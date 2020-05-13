require("dotenv").config();
const beeline = require("honeycomb-beeline");
beeline({
  writeKey: process.env.BEELINE_KEY,
  dataset: "LAH",
  serviceName: "lah-backend",
  // ... additional optional configuration ...
});

const express = require("express");
const axios = require("axios");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const app = express();
const passport = require("passport");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const { errors } = require("celebrate");
const errorHandler = require("./utils/error-handler");
const {
  mockUserMiddleware,
  setMockUserRole,
} = require("./utils/auth-middleware");
const { requestLogger, errorLogger } = require("./utils/logging-middleware");

require("./utils/passport-setup");
require("./utils/auth-middleware");

// For code coverage
app.get("/__coverage__", (req, res) => {
  res.json(global.__coverage__ || null);
});

const isProd = process.env.NODE_ENV === "production";
// Console Logger for external API requests
axios.interceptors.request.use((request) => {
  console.log(`Starting Axios Request with URL: ${request.url}`);
  return request;
});

axios.interceptors.response.use((response) => {
  console.log("Response:", response.status);
  return response;
});
app.use(helmet());
if (!isProd) {
  app.use(cors({ origin: /localhost:\d{4}/, credentials: true }));
}
app.use(morgan("dev"));
mongoose.connection.on("connecting", () => {
  console.log("Connecting!");
});
mongoose
  .connect(process.env.DB_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
  })
  .catch((e) => console.error(e.reason.servers));
mongoose.connection.on("disconnected", () => {
  console.error("Disconnected!");
});

// console.log(mongoose.connection);
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
      touchAfter: 24 * 3600,
      stringify: false,
    }),
    saveUninitialized: false, // don't create session until something stored
    resave: false, //don't save session if unmodified
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());

if (isProd) {
  console.log("Using production-level logging.");
  app.use(requestLogger);
}

// If we're running in a mode that should bypass auth, set up a mock user
if (!isProd && process.env.BYPASS_AUTH_ROLE) {
  console.warn(
    `Auth is being bypassed with role \"${process.env.BYPASS_AUTH_ROLE}\"!`
  );
  setMockUserRole(app, process.env.BYPASS_AUTH_ROLE);
  app.use(mockUserMiddleware);
}

app.use(require("./routes"));
// Error handle logging
if (isProd) {
  app.use(errorLogger);
}

app.use(errors());
app.use(errorHandler);

module.exports = app;
