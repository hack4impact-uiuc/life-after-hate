const express = require("express");
const mongoose = require("mongoose");
const app = express();
const port = process.env.PORT;
const passport = require("passport");
require("./utils/passport-setup");

app.use(passport.initialize());
app.use(passport.session());

app.use(require("./routes"));

mongoose.connect("mongodb://db:27017/LAH_DB", {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
