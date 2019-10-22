const express = require("express");
const mongoose = require("mongoose");
const app = express();
const passport = require("passport");
const morgan = require("morgan");
require("./utils/passport-setup");

app.use(morgan("dev"));
app.use(passport.initialize());
app.use(passport.session());
app.use(require("./routes"));

mongoose.connect(process.env.DB_URI, {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

module.exports = app;
