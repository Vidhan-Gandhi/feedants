/**
 * Pure function that derives the competition's current lifecycle state
 * from its dates + spot count, evaluated at request time. This is what
 * lets the same competition document answer correctly regardless of when
 * a user hits the API - no cron job / background status flag needed,
 * and no risk of a stale "status" field drifting from the actual dates.
 *
 * States:
 *  - registration_open     : before registrationCloseAt AND spots remain
 *  - registration_full     : before registrationCloseAt BUT spotsLeft === 0
 *  - awaiting_submission    : after registrationCloseAt, before submissionStartAt
 *  - submission_open        : within [submissionStartAt, submissionEndAt]
 *  - judging                : after submissionEndAt, before resultDate
 *  - results_declared       : now >= resultDate
 */
function computeLifecycleState(competition, now = new Date()) {
  const {
    registrationCloseAt,
    submissionStartAt,
    submissionEndAt,
    resultDate,
    spotsLeft,
  } = competition;

  if (now >= resultDate) return "results_declared";
  if (now > submissionEndAt) return "judging";
  if (now >= submissionStartAt) return "submission_open";
  if (now >= registrationCloseAt) return "awaiting_submission";
  if (spotsLeft <= 0) return "registration_full";
  return "registration_open";
}

/**
 * The countdown shown at the top of the screen always points at the NEXT
 * meaningful deadline for the state the competition is currently in, so
 * the UI doesn't need its own guesswork.
 */
function nextDeadline(competition, state) {
  switch (state) {
    case "registration_open":
    case "registration_full":
      return { label: "Registration closes in", target: competition.registrationCloseAt };
    case "awaiting_submission":
      return { label: "Submissions open in", target: competition.submissionStartAt };
    case "submission_open":
      return { label: "Submission closes in", target: competition.submissionEndAt };
    case "judging":
      return { label: "Result declares in", target: competition.resultDate };
    case "results_declared":
    default:
      return { label: "Results declared", target: competition.resultDate };
  }
}

function canRegister(competition, state) {
  return state === "registration_open";
}

function canSubmit(state) {
  return state === "submission_open";
}

module.exports = { computeLifecycleState, nextDeadline, canRegister, canSubmit };
