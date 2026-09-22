const mongoose = require("mongoose");
const Competition = require("../models/Competition");
const Registration = require("../models/Registration");
const Submission = require("../models/Submission");
const { computeLifecycleState, nextDeadline, canRegister, canSubmit } = require("../utils/lifecycle");

function serializeCompetition(comp, { state, deadline, userContext, serverTime }) {
  return {
    id: comp._id,
    title: comp.title,
    tags: comp.tags,
    winnersGetCertificate: comp.winnersGetCertificate,
    prizePool: comp.prizePool,
    entryFee: comp.entryFee,
    spots: {
      total: comp.spotsTotal,
      left: comp.spotsLeft,
      booked: comp.spotsTotal - comp.spotsLeft,
    },
    judge: comp.judge,
    dates: {
      registrationCloseAt: comp.registrationCloseAt,
      submissionStartAt: comp.submissionStartAt,
      submissionEndAt: comp.submissionEndAt,
      resultDate: comp.resultDate,
    },
    about: { short: comp.aboutShort, full: comp.aboutFull },
    judgingParameters: comp.judgingParameters,
    rulesEligibility: comp.rulesEligibility,
    rewards: comp.rewards,
    previousWinners: comp.previousWinners,
    disclaimer: comp.disclaimer,
    prizeMoneyVideoUrl: comp.prizeMoneyVideoUrl,
    refundPolicyUrl: comp.refundPolicyUrl,
    referral: comp.referralBaseUrl
      ? { link: `${comp.referralBaseUrl}/${userContext.userId || "guest"}`, rewardPerSignup: comp.referralRewardPerSignup }
      : null,
    // --- computed / dynamic fields ---
    state, // e.g. "registration_open" | "submission_open" | ...
    countdown: { label: deadline.label, targetAt: deadline.target },
    serverTime, // client should compute countdowns as (targetAt - serverTime + localElapsed) to avoid device clock skew
    actions: {
      canRegister: canRegister(comp, state),
      canSubmit: canSubmit(state) && userContext.isRegistered,
    },
    viewer: {
      isAuthenticated: Boolean(userContext.userId),
      isRegistered: userContext.isRegistered,
      hasSubmitted: userContext.hasSubmitted,
      submission: userContext.submission || null,
    },
  };
}

async function getUserContext(competitionId, userId) {
  if (!userId) return { userId: null, isRegistered: false, hasSubmitted: false, submission: null };

  const [registration, submission] = await Promise.all([
    Registration.findOne({ competition: competitionId, user: userId, status: "registered" }),
    Submission.findOne({ competition: competitionId, user: userId }),
  ]);

  return {
    userId,
    isRegistered: Boolean(registration),
    hasSubmitted: Boolean(submission),
    submission: submission ? { fileUrl: submission.fileUrl, submittedAt: submission.submittedAt } : null,
  };
}

async function getCompetition(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "VALIDATION_ERROR", message: "Invalid competition id" });
    }

    const comp = await Competition.findById(id);
    if (!comp) return res.status(404).json({ error: "NOT_FOUND", message: "Competition not found" });

    const now = new Date();
    const state = computeLifecycleState(comp, now);
    const deadline = nextDeadline(comp, state);
    const userContext = await getUserContext(comp._id, req.userId);

    res.json(serializeCompetition(comp, { state, deadline, userContext, serverTime: now }));
  } catch (err) {
    next(err);
  }
}

/**
 * Registration is the operation most exposed to race conditions: with
 * thousands of concurrent users chasing the last few spots, a naive
 * "read spotsLeft, check > 0, then write spotsLeft-1" would overbook the
 * competition (classic check-then-act race).
 *
 * Fix: a single atomic findOneAndUpdate whose FILTER re-checks
 * spotsLeft > 0 and registrationCloseAt > now at the database level.
 * MongoDB guarantees this find+update pair is atomic per document, so
 * only as many requests as there are remaining spots can ever succeed,
 * no matter how many arrive simultaneously.
 *
 * We check for an existing registration *before* touching the spot
 * counter (cheap, avoids wasting a spot on a duplicate-registration
 * attempt in the common case), and we still guard against the rare
 * double-submit race with the unique index on Registration + a
 * compensating rollback if the insert unexpectedly fails.
 *
 * Note on transactions: a multi-document ACID transaction (spot
 * decrement + registration insert together) would be the textbook
 * answer, but Mongo transactions require a replica set, which adds
 * real friction for local/dev setups and isn't strictly necessary here
 * - each individual step is already safe (atomic decrement, unique
 * index, compensating rollback on failure), so we intentionally avoid
 * the extra ops requirement. In a production deployment (which already
 * runs Mongo as a replica set for HA) this would be a good candidate to
 * wrap in a session.withTransaction for stronger consistency guarantees.
 */
async function registerForCompetition(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.userId;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "VALIDATION_ERROR", message: "Invalid competition id" });
    }

    const existing = await Registration.findOne({ competition: id, user: userId, status: "registered" });
    if (existing) {
      return res.status(409).json({ error: "ALREADY_REGISTERED", message: "You are already registered for this competition" });
    }

    const now = new Date();

    const updatedComp = await Competition.findOneAndUpdate(
      { _id: id, spotsLeft: { $gt: 0 }, registrationCloseAt: { $gt: now } },
      { $inc: { spotsLeft: -1 } },
      { new: true }
    );

    if (!updatedComp) {
      const comp = await Competition.findById(id);
      if (!comp) return res.status(404).json({ error: "NOT_FOUND", message: "Competition not found" });
      if (comp.registrationCloseAt <= now) {
        return res.status(409).json({ error: "REGISTRATION_CLOSED", message: "Registration has closed for this competition" });
      }
      return res.status(409).json({ error: "SPOTS_FULL", message: "No spots left" });
    }

    let registration;
    try {
      registration = await Registration.create({ competition: id, user: userId, registeredAt: now });
    } catch (err) {
      // Duplicate key => a concurrent request from the same user won the
      // race to insert first. Roll back the spot we just took.
      await Competition.updateOne({ _id: id }, { $inc: { spotsLeft: 1 } });
      if (err.code === 11000) {
        return res.status(409).json({ error: "ALREADY_REGISTERED", message: "You are already registered for this competition" });
      }
      throw err;
    }

    const state = computeLifecycleState(updatedComp, now);
    res.status(201).json({
      message: "Registered successfully",
      registration: { id: registration._id, registeredAt: registration.registeredAt },
      spots: { total: updatedComp.spotsTotal, left: updatedComp.spotsLeft },
      state,
    });
  } catch (err) {
    next(err);
  }
}

async function submitEntry(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { fileUrl, fileType } = req.body || {};

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "VALIDATION_ERROR", message: "Invalid competition id" });
    }
    if (!fileUrl) {
      return res.status(400).json({ error: "VALIDATION_ERROR", message: "fileUrl is required" });
    }

    const comp = await Competition.findById(id);
    if (!comp) return res.status(404).json({ error: "NOT_FOUND", message: "Competition not found" });

    const now = new Date();
    const state = computeLifecycleState(comp, now);
    if (!canSubmit(state)) {
      return res.status(409).json({ error: "SUBMISSION_CLOSED", message: "Submissions are not open right now", state });
    }

    const registration = await Registration.findOne({ competition: id, user: userId, status: "registered" });
    if (!registration) {
      return res.status(403).json({ error: "NOT_REGISTERED", message: "You must register before submitting an entry" });
    }

    const existing = await Submission.findOne({ competition: id, user: userId });
    let submission;
    if (existing) {
      existing.fileUrl = fileUrl;
      existing.fileType = fileType || existing.fileType;
      existing.submittedAt = now;
      existing.resubmissionCount += 1;
      submission = await existing.save();
    } else {
      submission = await Submission.create({
        competition: id,
        user: userId,
        registration: registration._id,
        fileUrl,
        fileType: fileType || "video",
        submittedAt: now,
      });
    }

    res.status(existing ? 200 : 201).json({
      message: existing ? "Submission updated" : "Submission received",
      submission: { id: submission._id, fileUrl: submission.fileUrl, submittedAt: submission.submittedAt },
    });
  } catch (err) {
    next(err);
  }
}

async function listWinners(req, res, next) {
  try {
    const { id } = req.params;
    const comp = await Competition.findById(id).select("previousWinners");
    if (!comp) return res.status(404).json({ error: "NOT_FOUND", message: "Competition not found" });
    res.json({ winners: comp.previousWinners });
  } catch (err) {
    next(err);
  }
}

module.exports = { getCompetition, registerForCompetition, submitEntry, listWinners };
