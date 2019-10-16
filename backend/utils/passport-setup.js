const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
const router = require("express").Router();

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((id, done) => {
  // Find in DB and return user
  done(null, id);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `http://localhost:5000/api/auth/login/callback`
    },
    function(accessToken, refreshToken, profile, cb) {
      cb(null, "Hello");
    }
  )
);

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
