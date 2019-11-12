const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
const User = require("../models/User");

const DEFAULTROLE = "VOLUNTEER";
const DEFAULTLOC = "NORTH";

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
      callbackURL: process.env.OAUTH_CALLBACK_URI
    },
    function(accessToken, refreshToken, profile, cb) {
      // find the user in the database based on their facebook id
      User.findOne({ oauthId: profile.id }, async function(err, user) {
        if (err) {
          return cb(err);
        }

        if (user) {
          return cb(null, user);
        }
        console.log(profile);
        const newUser = await new User({
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          oauthId: profile.id,
          propicUrl: profile.photos[0].value,
          isApproved: false,
          role: DEFAULTROLE,
          location: DEFAULTLOC
        }).save();

        cb(null, newUser);
      });
    }
  )
);
