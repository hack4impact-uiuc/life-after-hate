/** Schema representing a LAH resource
 */
const mongoose = require("mongoose");

const Resource = new mongoose.Schema({
  company_name: { type: String, required: true },
  contact_name: { type: String, required: true },
  contact_phone: { type: String, required: true },
  contact_email: { type: String, required: true },
  description: { type: String, required: true },
  address: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  notes: { type: String },
  tags: { type: Array, default: [] }
});

module.exports = mongoose.model("Resource", Resource);
