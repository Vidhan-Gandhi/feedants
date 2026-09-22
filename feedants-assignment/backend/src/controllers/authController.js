const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Demo login: real auth (OTP/social login) is out of scope for this
 * assignment. This endpoint creates-or-reuses a user by name/email so the
 * register + submit flows can be exercised by different "users" (e.g. to
 * prove the spots-left counter is consistent across concurrent users).
 */
async function demoLogin(req, res, next) {
  try {
    const { name, email } = req.body || {};
    if (!name) {
      return res.status(400).json({ error: "VALIDATION_ERROR", message: "name is required" });
    }

    let user;
    if (email) {
      user = await User.findOneAndUpdate(
        { email: email.toLowerCase() },
        { $setOnInsert: { name, email: email.toLowerCase() } },
        { upsert: true, new: true }
      );
    } else {
      user = await User.create({ name });
    }

    const token = jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET || "dev_secret", {
      expiresIn: "7d",
    });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    next(err);
  }
}

module.exports = { demoLogin };
