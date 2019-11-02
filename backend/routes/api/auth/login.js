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
  res.json({
    code: 200,
    result: req.user,
    success: true
  });
});

router.get("/testVolunteer", auth.isVolunteer, function(req, res) {
  res.json({
    code: 200,
    result: "you are a volunteer boo yah",
    success: true
  });
});

router.get("/testAdmin", auth.isAdmin, function(req, res) {
  res.json({
    code: 200,
    result: "you are an admin boo yah",
    success: true
  });
});

module.exports = router;
