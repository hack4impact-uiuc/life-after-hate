const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
const router = require("express").Router();
const User = require("../models/User");

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((id, done) => {
  // Find in DB and return user
  User.findById(id, function(err, user) {
    if (err) {
      done(err);
    }
    done(null, user.oauthId);
  });
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `http://localhost:5000/api/auth/login/callback`
    },
    function(accessToken, refreshToken, profile, cb) {
      // find the user in the database based on their facebook id
      User.findOne({ oauthId: profile.id }, function(err, user) {
        if (err) {return cb(err);}

        if (user) {
          console.log("found");
          return cb(null, user);
        } 
          new User({
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            oauthId: profile.id,
            propicUrl: profile.photos[0].value,
            isApproved: false,
            role: "VOLUNTEER",
            location: "NORTH"
          })
            .save()
            .then(user => {
              console.log({ user });
              cb(null, user); //callback to let passport know that we are done processing
            });
        
      });
    }
  )
);

router.get("/login", passport.authenticate("google", { scope: ["profile"] }));

router.get(
  "/login/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect home.

    // check if authenticated
    res.redirect("/");
  }
);

module.exports = router;
