const { rateLimit, ipKeyGenerator } = require("express-rate-limit");

const tooMany = (message) => (req, res) =>
  res.status(429).json({ success: false, message });

// Whole API: stops simple flooding.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: tooMany("Too many requests. Please slow down and try again shortly."),
});

// Login / register: stops password guessing.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: tooMany("Too many attempts. Please wait 15 minutes and try again."),
});

// Upload + job match: every call spends AI quota, so limit per logged-in user.
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: Number(process.env.AI_RATE_LIMIT_PER_HOUR) || 40,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.userId?.toString() || ipKeyGenerator(req.ip),
  handler: tooMany("AI usage limit reached for this hour. Please try again later."),
});

module.exports = { apiLimiter, authLimiter, aiLimiter };
