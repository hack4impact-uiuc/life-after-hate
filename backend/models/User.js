/** Schema representing a LAH user
 * Role should be one of the following: [Admin, Volunteer]
 */
const mongoose = require("mongoose");
require("mongoose").set("debug", true);

const User = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  oauthId: { type: String, required: true, unique: true },
  propicUrl: { type: String, required: true },
  isApproved: { type: Boolean, required: true },
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

User.statics.findUser = function(id) {
  let foundUser = this.findOne({ oauthId: id });
  return foundUser;
};

module.exports = mongoose.model("User", User);
