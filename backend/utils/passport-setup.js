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
      let newUser = User.findUser(profile.id);
      newUser.exec(function(err, user) {
        if (err) {
          return cb(err);
        }

        if (user) {
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

        // var newUser = new User();
        // // set all of the facebook information in our user model
        // newUser.firstName = profile.name.givenName;
        // newUser.lastName = profile.name.familyName;
        // newUser.oauthId = profile.id;
        // newUser.propicUrl = profile.photos[0].value;
        // (newUser.isApproved = false), (newUser.role = "VOLUNTEER");
        // newUser.location = "NORTH";

        // newUser.save(function(err) {
        //   // if (err)
        //   //     throw err;
        //   // if successful, return the new user
        //   return cb(null, newUser);
        // });
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
