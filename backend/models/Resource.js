/** Schema representing a LAH resource
 */
const mongoose = require("mongoose");

const resourceEnum = {
  GROUP: "GROUP",
  INDIVIDUAL: "INDIVIDUAL",
};

const Resource = new mongoose.Schema({
  companyName: { type: String, required: true },
  contactName: { type: String, required: true },
  contactPhone: { type: String, required: true },
  contactEmail: { type: String, required: true },
  description: { type: String, required: true },
  address: { type: String, required: true },
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
