const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
const User = require("../models/User");

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((id, done) => {
  // Find in DB and return user
  User.findById(id, function(err, user) {
    if (err) {
      console.log("err");
      done(err);
    }
    done(null, user);
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
        if (err) {
          return cb(err);
        }

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
