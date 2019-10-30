const passport = require("passport");
const router = require("express").Router();
const auth = require("../../../utils/auth-middleware");

router.get(
  "/login",
  passport.authenticate("google", { scope: ["openid", "profile"] })
);

router.get(
  "/login/callback",
  passport.authenticate("google", {
    failureRedirect: "/login"
  }),
  function(req, res) {
    res.redirect("/api/auth/hello");
  }
);

router.get("/hello", auth.isAuthenticated, function(req, res) {
  res.json(req.user);
});

router.get("/testVolunteer", auth.isVolunteer, function(req, res) {
  res.json("you are a volunteer boo yah");
});

router.get("/testAdmin", auth.isAdmin, function(req, res) {
  res.json("you are an admin boo yah");
});

module.exports = router;
