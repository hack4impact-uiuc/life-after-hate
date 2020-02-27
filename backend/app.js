require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
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
  setMockUserRole
} = require("./utils/auth-middleware");
const { requestLogger, errorLogger } = require("./utils/logging-middleware");

require("./utils/passport-setup");
require("./utils/auth-middleware");

const isProd = process.env.NODE_ENV === "production";
// Console Logger for external API requests
axios.interceptors.request.use(request => {
  console.log(`Starting Axios Request with URL: ${request.url}`);
  return request;
});

axios.interceptors.response.use(response => {
  console.log("Response:", response.status);
  return response;
});

app.use(cors({ origin: /.*/, credentials: true }));
app.use(morgan("dev"));

mongoose.connect(process.env.DB_URI, {
  useUnifiedTopology: true,
  useNewUrlParser: true
});
// Silence deprecation warnings
mongoose.set("useCreateIndex", true);
console.log(
  `REACT_APP: ${process.env.REACT_APP_API_URI === "http://backend:5000/api/"}`
);
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
      touchAfter: 24 * 3600,
      stringify: false
    }),
    saveUninitialized: false, // don't create session until something stored
    resave: false //don't save session if unmodified
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
