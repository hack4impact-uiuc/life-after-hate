const passport = require("passport");
const router = require("express").Router();

router.get("/login", passport.authenticate("google", { scope: ["profile"] }));

router.get(
  "/login/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect("/");
  }
);

module.exports = router;
