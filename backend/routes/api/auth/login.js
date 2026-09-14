const router = require("express").Router();
router.get("/", (req, res, next) => {
  req.app.locals.passport.authenticate("google", {
    scope: ["openid", "profile", "email"],
  })(req, res, next);
});
// Every deployment registers its own fixed callback. No relay redirects.
router.get(
  "/callback",
  (req, res, next) => {
    req.app.locals.passport.authenticate("google", {
      failureRedirect: `${req.app.locals.config.frontendOrigin}/login`,
    })(req, res, next);
  },
  (req, res) => res.redirect(req.app.locals.config.frontendOrigin),
);
module.exports = router;
