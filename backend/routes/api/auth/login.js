const passport = require("passport");
const router = require("express").Router();

router.get("/login", passport.authenticate("google", { scope: ["profile"] }));

router.get(
  "/login/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect home.
    // console.log(req);
    res.redirect("/api/auth/hello");
  }
);

router.get("/hello", function(req, res) {
  res.send("pew pew");
  // res.send(req.user.firstName);
});

module.exports = router;
