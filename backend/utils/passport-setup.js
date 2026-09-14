const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { Passport } = require("passport");
const User = require("../models/User");

module.exports = function createPassport(config) {
  const passport = new Passport();
  passport.serializeUser((user, done) => done(null, user._id));
  passport.deserializeUser(async (id, done) => {
    try {
      done(null, (await User.findById(id)) || false);
    } catch (error) {
      done(error);
    }
  });
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.googleClientId,
        clientSecret: config.googleClientSecret,
        callbackURL: config.callbackUrl,
        state: true,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          // Only Google's stable subject identifies an existing account.
          let user = await User.findOne({ oauthId: profile.id });
          if (!user) {
            const email = profile.emails?.find(
              (entry) => entry.verified,
            )?.value;
            if (!email) return done(null, false);
            user = await User.create({
              oauthId: profile.id,
              firstName: profile.name?.givenName || "User",
              lastName: profile.name?.familyName || "",
              propicUrl: profile.photos?.[0]?.value,
              email,
              role: User.roleEnum.PENDING,
              location: "NORTH",
            });
          }
          done(null, user);
        } catch (error) {
          done(error);
        }
      },
    ),
  );
  return passport;
};
