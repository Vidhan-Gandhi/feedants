const mongoose = require("mongoose");

/**
 * Represents an uploaded entry for a competition. File storage itself
 * (S3 / Cloudinary / etc.) is out of scope for this assignment - the API
 * accepts a fileUrl + fileType as if a client-side/pre-signed upload has
 * already happened. This keeps the backend focused on the business logic
 * the assignment actually asks to be evaluated on.
 *
 * A user may resubmit while the submission window is open; we upsert on
 * (competition, user) rather than growing an array, since only the latest
 * submission should count for judging.
 */
const submissionSchema = new mongoose.Schema(
  {
    competition: { type: mongoose.Schema.Types.ObjectId, ref: "Competition", required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    registration: { type: mongoose.Schema.Types.ObjectId, ref: "Registration", required: true },
    fileUrl: { type: String, required: true },
    fileType: { type: String, default: "video" },
    submittedAt: { type: Date, default: Date.now },
    resubmissionCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

submissionSchema.index({ competition: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("Submission", submissionSchema);
