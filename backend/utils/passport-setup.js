const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
const User = require("../models/User");
const { roleEnum } = require("../models/User");
const beeline = require("honeycomb-beeline");

// Defines the default role a user gets assigned with upon first sign-in
const DEFAULT_ROLE = process.env.DEFAULT_ROLE || roleEnum.PENDING;
// Currently not being used but may be implemented in the future
const DEFAULT_LOC = "NORTH";

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((id, done) => {
  const span = beeline.startSpan({ name: "Deserialize User Query" });
  // Find in DB and return user
  User.findById(id, function (err, user) {
    beeline.finishSpan(span);
    if (err) {
      console.error("err");
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
      callbackURL: process.env.OAUTH_CALLBACK_URI,
    },
    function (accessToken, refreshToken, profile, cb) {
      // find the user in the database based on their facebook id
      const span = beeline.startSpan({ name: "OAuth DB Fetch" });
      User.findOne({ oauthId: profile.id }, async function (err, user) {
        if (err) {
          return cb(err);
        }

        if (user) {
          return cb(null, user);
        }
        const newUser = await new User({
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          oauthId: profile.id,
          propicUrl: profile.photos[0].value,
          role: DEFAULT_ROLE,
          location: DEFAULT_LOC,
          email: profile.emails[0].value,
        }).save();
        beeline.finishSpan(span);

        cb(null, newUser);
      });
    }
  )
);
