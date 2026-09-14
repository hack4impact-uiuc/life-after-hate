require("dotenv").config({ quiet: true });
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo").default;
const { loadConfig } = require("./utils/config");
const { createApp } = require("./create-app");
const config = loadConfig();
mongoose.set("sanitizeFilter", true);
const ready = mongoose.connect(config.dbUri, {
  serverSelectionTimeoutMS: 10000,
});
const store = MongoStore.create({
  clientPromise: ready.then(() => mongoose.connection.getClient()),
  collectionName: "sessions",
  ttl: 30 * 60,
});
const app = createApp(config, {
  store,
  logRequests: process.env.NODE_ENV !== "test",
});
app.locals.ready = ready;
module.exports = app;
