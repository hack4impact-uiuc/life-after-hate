const express = require("express");
const mongoose = require("mongoose");
const app = express();
const passport = require("passport");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const { errors } = require("celebrate");

require("./utils/passport-setup");

app.use(morgan("dev"));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());
app.use(require("./routes"));

mongoose.connect(process.env.DB_URI, {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

app.use(errors());

module.exports = app;
