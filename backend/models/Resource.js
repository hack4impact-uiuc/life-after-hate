/** Schema representing a LAH resource
 */
const mongoose = require("mongoose");

const resourceEnum = {
  GROUP: "GROUP",
  INDIVIDUAL: "INDIVIDUAL",
};

const Resource = new mongoose.Schema({
  companyName: { type: String, default: "" },
  contactName: { type: String, required: true },
  contactPhone: { type: String, default: "" },
  contactEmail: { type: String, default: "" },
  description: { type: String, default: "" },
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
  type: {
    type: String,
    enum: [resourceEnum.GROUP, resourceEnum.INDIVIDUAL],
    default: resourceEnum.GROUP,
  },
});

module.exports = mongoose.model("Resource", Resource);
module.exports.resourceEnum = resourceEnum;
