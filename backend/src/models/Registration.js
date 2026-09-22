const mongoose = require("mongoose");

/**
 * A join record between a User and a Competition. The unique compound
 * index is the actual guarantee against double-registration at the
 * database level (application logic also checks first, for a friendlier
 * error message, but the index is what makes it safe under concurrency).
 */
const registrationSchema = new mongoose.Schema(
  {
    competition: { type: mongoose.Schema.Types.ObjectId, ref: "Competition", required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    status: { type: String, enum: ["registered", "cancelled"], default: "registered" },
    registeredAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

registrationSchema.index({ competition: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("Registration", registrationSchema);
