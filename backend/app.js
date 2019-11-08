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

require("./utils/passport-setup");
require("./utils/auth-middleware");

app.use(cors({ origin: "http://localhost:3000" }));
app.use(morgan("dev"));
app.use(session({ secret: "keyboard cat" }));
app.use(passport.initialize());
app.use(passport.session({ secret: "keyboard cat" }));
app.use(bodyParser.json());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Credentials", true);
  // res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept"
  );
  if ("OPTIONS" === req.method) {
    res.send(200);
  } else {
    next();
  }
});
app.use(require("./routes"));

mongoose.connect(process.env.DB_URI, {
  useUnifiedTopology: false,
  useNewUrlParser: true
});

app.use(errors());

module.exports = app;
