const mongoose = require("mongoose");

/**
 * Minimal user model. A real production app would plug in a full auth
 * provider (OTP/OAuth/etc). For this assignment we support a lightweight
 * "demo login" (see authController) that creates/reuses a user by name,
 * so registration + submission flows are testable end-to-end.
 */
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true, unique: true, sparse: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
