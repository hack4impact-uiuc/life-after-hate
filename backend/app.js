require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const session = require("express-session");
const app = express();
const passport = require("passport");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const { errors } = require("celebrate");
const errorHandler = require("./utils/error-handler");

require("./utils/passport-setup");
require("./utils/auth-middleware");

app.use(cors({ origin: /localhost:\d{4}/, credentials: true }));
app.use(morgan("dev"));
app.use(session({ secret: "keyboard cat" }));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());
app.use(require("./routes"));

mongoose.connect(process.env.DB_URI, {
  useUnifiedTopology: false,
  useNewUrlParser: true
});

app.use(errors());
app.use(errorHandler);

module.exports = app;
