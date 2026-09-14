const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const session = require("express-session");
const { rateLimit } = require("express-rate-limit");
const createPassport = require("./utils/passport-setup");
const { csrfProtection, csrfToken } = require("./utils/csrf");
const { requestLogger } = require("./utils/logging-middleware");
const errorHandler = require("./utils/error-handler");
const {
  mockUserMiddleware,
  setMockUserRole,
} = require("./utils/auth-middleware");

function createApp(
  config,
  { store, passport = createPassport(config), logRequests = true } = {},
) {
  if (config.isProd && !store)
    throw new Error("Production requires a persistent session store");
  const app = express();
  app.locals.config = config;
  app.locals.passport = passport;
  app.disable("x-powered-by");
  app.set("trust proxy", config.trustProxy);
  app.use(helmet());
  app.use((_req, res, next) => {
    res.set("Cache-Control", "no-store");
    res.set("Referrer-Policy", "no-referrer");
    next();
  });
  if (logRequests) app.use(requestLogger);
  if (!config.isProd)
    app.use(cors({ origin: config.frontendOrigin, credentials: true }));
  app.use(
    rateLimit({
      windowMs: 60000,
      limit: 120,
      standardHeaders: "draft-8",
      legacyHeaders: false,
    }),
  );
  app.use(
    "/api/auth/login",
    rateLimit({
      windowMs: 15 * 60000,
      limit: 30,
      standardHeaders: "draft-8",
      legacyHeaders: false,
    }),
  );
  app.use(express.json({ limit: "64kb" }));
  app.use(
    session({
      name: config.cookieName,
      secret: config.secret,
      store,
      saveUninitialized: false,
      resave: false,
      rolling: true,
      cookie: {
        httpOnly: true,
        secure: config.isProd,
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 60000,
      },
    }),
  );
  app.use((req, res, next) => {
    if (
      req.session.createdAt &&
      Date.now() - req.session.createdAt > 8 * 60 * 60000
    ) {
      return req.session.destroy((error) => {
        if (error) return next(error);
        res.clearCookie(config.cookieName, {
          path: "/",
          secure: config.isProd,
          sameSite: "lax",
          httpOnly: true,
        });
        res
          .status(401)
          .json({ code: 401, success: false, message: "Session expired" });
      });
    }
    next();
  });
  app.use(passport.initialize());
  app.use(passport.session());
  app.use((req, _res, next) => {
    if (req.isAuthenticated() && !req.session.createdAt)
      req.session.createdAt = Date.now();
    next();
  });
  app.use(csrfProtection);
  app.get("/api/auth/csrf", csrfToken);
  if (!config.isProd && config.mockRole) {
    setMockUserRole(app, config.mockRole);
    app.use(mockUserMiddleware);
    if (process.env.NODE_ENV === "test")
      app.use("/api/test", require("./routes/api/test"));
  }
  app.use(require("./routes"));
  app.use((_req, res) =>
    res.status(404).json({ code: 404, success: false, message: "Not found" }),
  );
  app.use(errorHandler);
  return app;
}
module.exports = { createApp };
