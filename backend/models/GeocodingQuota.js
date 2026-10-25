const mongoose = require("mongoose");

module.exports = mongoose.model(
  "GeocodingQuota",
  new mongoose.Schema({
    _id: { type: String, required: true },
    count: { type: Number, required: true },
    expiresAt: { type: Date, required: true, expires: 0 },
  }),
);
