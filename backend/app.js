require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const port = process.env.PORT;
const passport = require("passport");
const session = require("express-session");
require("./utils/passport-setup");

app.use(session({ secret: "asdf" }));

app.use(passport.initialize());
app.use(
  passport.session({
    secret: "asdf",
    cookie: {
      secure: false
    }
  })
);

app.use(require("./routes"));

mongoose.connect(process.env.DB_URI, {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
