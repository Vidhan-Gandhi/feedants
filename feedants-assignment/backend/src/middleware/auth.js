const jwt = require("jsonwebtoken");

/**
 * requireAuth: rejects the request if no valid token is present.
 * optionalAuth: attaches req.userId if a valid token is present, but
 *   never rejects - used on GET /competitions/:id so the response can
 *   include "isRegistered"/"hasSubmitted" for a logged-in viewer while
 *   still working for anonymous browsing.
 */
function verify(req) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
    return payload.userId;
  } catch {
    return null;
  }
}

function requireAuth(req, res, next) {
  const userId = verify(req);
  if (!userId) {
    return res.status(401).json({ error: "UNAUTHENTICATED", message: "Login required" });
  }
  req.userId = userId;
  next();
}

function optionalAuth(req, res, next) {
  req.userId = verify(req);
  next();
}

module.exports = { requireAuth, optionalAuth };
