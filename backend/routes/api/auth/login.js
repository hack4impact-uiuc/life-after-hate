const passport = require("passport");
const router = require("express").Router();
// const url = require("url");

router.get("/login", passport.authenticate("google", { scope: ["profile"] }));

router.get(
  "/login/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect home.
    // console.log(req);

    // res.redirect(url.format({pathname: "/api/auth/hello", query: {
    //   query: req.query
    // }}));

    res.redirect("/api/auth/hello");
  }
);

router.get("/hello", function(req, res) {
  // res.send(req.query);
  // res.send(req.user.firstName);
  res.send("pew pew");
});

module.exports = router;
