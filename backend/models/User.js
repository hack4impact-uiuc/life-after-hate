/** Schema representing a LAH user
 * Role should be one of the following: [Admin, Volunteer]
 */
const mongoose = require("mongoose");

const User = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  oauthId: { type: String, required: true, unique: true },
  propicUrl: { type: String, required: true },
  isApproved: { type: Boolean, default: false, required: true },
  role: {
    type: String,
    enum: ["ADMIN", "VOLUNTEER"],
    required: true
  },
  location: {
    type: String,
    enum: ["NORTH", "SOUTH"],
    required: true
  }
});

module.exports = mongoose.model("User", User);
