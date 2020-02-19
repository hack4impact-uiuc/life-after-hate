require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const mongoose = require("mongoose");
const session = require("express-session");
const app = express();
const passport = require("passport");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const { errors } = require("celebrate");
const errorHandler = require("./utils/error-handler");
const { setMockUser } = require("./utils/auth-middleware");
var expressWinston = require("express-winston");
var winston = require("winston");
require("winston-loggly-bulk");

require("./utils/passport-setup");
require("./utils/auth-middleware");

// Console Logger for external API requests
axios.interceptors.request.use(request => {
  console.log(`Starting Axios Request with URL: ${request.url}`);
  return request;
});

axios.interceptors.response.use(response => {
  console.log("Response:", response.status);
  return response;
});

app.use(cors({ origin: /localhost:\d{4}/, credentials: true }));
app.use(morgan("dev"));

if (process.env.NODE_ENV === "production") {
  console.log("Using production-level logging.");
  app.use(
    expressWinston.logger({
      transports: [
        new winston.transports.Loggly({
          subdomain: "h4i",
          inputToken: process.env.LOGGLY_TOKEN,
          json: true,
          colorize: true,
          tags: ["Winston-Request"]
        })
      ],
      exitOnError: false,
      format: winston.format.json()
    })
  );
}

app.use(
  session({ secret: "keyboard cat", saveUninitialized: false, resave: false })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());

// If we're running in a mode that should bypass auth, set up a mock user
if (process.env.BYPASS_AUTH_ROLE) {
  console.warn(
    `Auth is being bypassed with role \"${process.env.BYPASS_AUTH_ROLE}\"!`
  );
  app.use(setMockUser);
}

app.use(require("./routes"));

// Error handle logging
if (process.env.NODE_ENV === "production") {
  app.use(
    expressWinston.errorLogger({
      transports: [
        new winston.transports.Loggly({
          subdomain: "h4i",
          inputToken: process.env.LOGGLY_TOKEN,
          json: true,
          colorize: true,
          tags: ["Winston-Error"]
        })
      ],
      exitOnError: false,
      format: winston.format.json()
    })
  );
}

mongoose.connect(process.env.DB_URI, {
  useUnifiedTopology: true,
  useNewUrlParser: true
});
// Silence deprecation warnings
mongoose.set("useCreateIndex", true);

app.use(errors());
app.use(errorHandler);

module.exports = app;
