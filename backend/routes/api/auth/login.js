const passport = require("passport");
const router = require("express").Router();
// const url = require("url");

router.get(
  "/login",
  passport.authenticate("google", { scope: ["openid", "profile"] })
);

router.get(
  "/login/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect home.
    // console.log(req);

    // res.redirect(url.format({pathname: "/api/auth/hello", query: {
    //   query: req.query
    // }}));
    res.send(req.user);
    // res.redirect("/api/auth/hello");
  }
);

router.get(
  "/hello",
  passport.authenticate("google", {
    scope: ["openid", "profile"],
    session: true
  }),
  function(req, res) {
    // res.send(req.query);
    // res.send(req.user.firstName);
    console.log(req);
    res.send("pew pew");
  }
);

module.exports = router;
