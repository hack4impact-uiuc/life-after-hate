/** Schema representing a LAH resource
 */

const mongoose = require("mongoose");

const resourceEnum = {
  GROUP: "GROUP",
  INDIVIDUAL: "INDIVIDUAL",
};

const options = { discriminatorKey: "type", collection: "resources" };

const Resource = new mongoose.Schema(
  {
    contactName: { type: String, required: true },
    contactPhone: { type: String, default: "" },
    contactEmail: { type: String, default: "" },
    address: {
      streetAddress: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      postalCode: { type: String, default: "" },
    },
    location: {
      type: { type: String, default: "Point" },
      coordinates: { type: Array, default: [] },
    },
    dateCreated: { type: Date, default: Date.now },
    dateLastModified: { type: Date },
    lastModifiedUser: { type: String },
    federalRegion: { type: Number, default: 0 },
    notes: { type: String },
    tags: { type: Array, default: [] },
  },
  options
);

module.exports = mongoose.model("BaseResource", Resource);
module.exports.resourceEnum = resourceEnum;
