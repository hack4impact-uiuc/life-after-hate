/** Schema representing a LAH resource
 */

const mongoose = require("mongoose");

const resourceEnum = {
  GROUP: "GROUP",
  INDIVIDUAL: "INDIVIDUAL",
};

const options = { discriminatorKey: "type" };

const Resource = new mongoose.Schema(
  {
    contactName: { type: String, required: true },
    contactPhone: { type: String, default: "" },
    contactEmail: { type: String, default: "" },
    address: {
      streetAddress: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
    },
    location: {
      type: { type: String, default: "Point" },
      coordinates: { type: Array, default: [] },
    },
    federalRegion: { type: Number, default: 0 },
    notes: { type: String },
    tags: { type: Array, default: [] },
  },
  options
);

module.exports = mongoose.model("BaseResource", Resource);
module.exports.resourceEnum = resourceEnum;
