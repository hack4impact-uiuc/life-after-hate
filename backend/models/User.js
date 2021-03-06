/** Schema representing a LAH user
 * Role should be one of the following: [Admin, Volunteer, Pending, Rejected]
 */
const mongoose = require("mongoose");

const roleEnum = {
  ADMIN: "ADMIN",
  VOLUNTEER: "VOLUNTEER",
  PENDING: "PENDING",
  REJECTED: "REJECTED",
};

const locationEnum = {
  NORTH: "NORTH",
  SOUTH: "SOUTH",
};

const User = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: false, default: "" },
  oauthId: { type: String, required: true, unique: true },
  propicUrl: { type: String, required: false },
  role: {
    type: String,
    enum: [
      roleEnum.ADMIN,
      roleEnum.VOLUNTEER,
      roleEnum.PENDING,
      roleEnum.REJECTED,
    ],
    required: true,
  },
  title: {
    type: String,
    required: false,
    default: "",
    setDefaultsOnInsert: true,
  },
  location: {
    type: String,
    enum: [locationEnum.NORTH, locationEnum.SOUTH],
    required: true,
  },
  email: { type: String, required: true, unique: true },
});

module.exports = mongoose.model("User", User);
module.exports.roleEnum = roleEnum;
