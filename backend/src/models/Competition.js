const mongoose = require("mongoose");

const rewardSchema = new mongoose.Schema(
  {
    position: { type: Number, required: true },
    label: { type: String, required: true }, // e.g. "1st Winner"
    amount: { type: Number, required: true },
    icon: { type: String, default: "star" }, // trophy | medal | bronze-medal | star
  },
  { _id: false }
);

const previousWinnerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    position: { type: String, required: true }, // "1st Winner", "2nd Winner"...
    photoUrl: { type: String },
    videoUrl: { type: String },
  },
  { _id: false }
);

/**
 * A single competition/document represents everything the Competition
 * Details screen needs. Dates drive the entire lifecycle state machine
 * (see utils/lifecycle.js) instead of a hardcoded status flag, so the
 * screen automatically "moves forward" as real time passes.
 *
 * spotsTotal / spotsLeft are kept as plain numbers (not derived from
 * counting Registration docs on every request) so that spot-booking can
 * be done with a single atomic findOneAndUpdate — this is what keeps the
 * feature correct under concurrent registrations (see registerForCompetition
 * in controllers/competitionController.js).
 */
const competitionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    tags: { type: [String], default: [] }, // ["Dance", "Multi-Win"]
    winnersGetCertificate: { type: Boolean, default: false },

    prizePool: { type: Number, required: true },
    entryFee: { type: Number, required: true },

    spotsTotal: { type: Number, required: true },
    spotsLeft: { type: Number, required: true },

    judge: {
      name: { type: String, required: true },
      title: { type: String },
      experience: { type: String },
      photoUrl: { type: String },
      introVideoUrl: { type: String },
    },

    // Lifecycle dates - the single source of truth for computed state
    registrationCloseAt: { type: Date, required: true },
    submissionStartAt: { type: Date, required: true },
    submissionEndAt: { type: Date, required: true },
    resultDate: { type: Date, required: true },

    aboutShort: { type: String, default: "" },
    aboutFull: { type: String, default: "" },
    judgingParameters: { type: String, default: "" },
    rulesEligibility: { type: String, default: "" },

    rewards: { type: [rewardSchema], default: [] },
    previousWinners: { type: [previousWinnerSchema], default: [] },

    disclaimer: { type: String, default: "" },
    prizeMoneyVideoUrl: { type: String, default: "" },
    refundPolicyUrl: { type: String, default: "" },
    referralBaseUrl: { type: String, default: "" },
    referralRewardPerSignup: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Never allow spotsLeft to be negative or exceed spotsTotal via a bad write.
competitionSchema.pre("save", function (next) {
  if (this.spotsLeft < 0) this.spotsLeft = 0;
  if (this.spotsLeft > this.spotsTotal) this.spotsLeft = this.spotsTotal;
  next();
});

module.exports = mongoose.model("Competition", competitionSchema);
