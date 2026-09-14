const { randomBytes, timingSafeEqual } = require("node:crypto");
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
function csrfProtection(req, res, next) {
  if (SAFE_METHODS.has(req.method)) return next();
  const origin = req.get("origin");
  const expected = req.session.csrfToken;
  const supplied = req.get("x-csrf-token");
  if (
    (origin && origin !== req.app.locals.config.frontendOrigin) ||
    !expected ||
    typeof supplied !== "string" ||
    !/^[a-f0-9]{64}$/.test(supplied) ||
    !timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))
  ) {
    return res
      .status(403)
      .json({ code: 403, success: false, message: "Invalid CSRF token" });
  }
  next();
}
function csrfToken(req, res) {
  if (!req.session.csrfToken)
    req.session.csrfToken = randomBytes(32).toString("hex");
  res.json({ token: req.session.csrfToken });
}
module.exports = { csrfProtection, csrfToken };
