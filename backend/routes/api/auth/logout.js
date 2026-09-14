const router = require("express").Router();
router.post("/", (req, res, next) => {
  req.logout((error) => {
    if (error) return next(error);
    req.session.destroy((error) => {
      if (error) return next(error);
      res.clearCookie(req.app.locals.config.cookieName, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: req.app.locals.config.isProd,
      });
      res.json({ code: 200, message: "Signed out", success: true });
    });
  });
});
module.exports = router;
