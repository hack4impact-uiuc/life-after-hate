/** Schema representing a LAH user
 * Role should be one of the following: [Admin, Volunteer]
 */
const mongoose = require("mongoose");

let roleEnum = {
  ADMIN: "ADMIN",
  VOLUNTEER: "VOLUNTEER"
};

let locationEnum = {
  NORTH: "NORTH",
  SOUTH: "SOUTH"
};

const User = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  oauthId: { type: String, required: true, unique: true },
  propicUrl: { type: String, required: false },
  isApproved: { type: Boolean, default: false, required: true },
  role: {
    type: String,
    enum: [roleEnum.ADMIN, roleEnum.VOLUNTEER],
    required: true
  },
  location: {
    type: String,
    enum: [locationEnum.NORTH, locationEnum.SOUTH],
    required: true
  },
  email: { type: String, required: true, unique: true }
});

module.exports = mongoose.model("User", User);
module.exports.roleEnum = roleEnum;
