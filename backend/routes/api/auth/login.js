const passport = require("passport");
const router = require("express").Router();
// const url = require("url");

router.get("/login", passport.authenticate("google", { scope: ["profile"] }));

router.get(
  "/login/callback",
  passport.authenticate("google", {
    failureRedirect: "/login"
  }),
  function(req, res) {
    res.redirect("/api/auth/hello");
  }
);

router.get("/hello", function(req, res) {
  if (req.user) {
    res.json(req.user);
  } else {
    res.redirect("/login");
  }
});

module.exports = router;
