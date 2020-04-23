const mongoose = require("mongoose");
const BaseResource = require("./Resource");
const { resourceEnum } = require("./Resource");

const IndividualResource = BaseResource.discriminator(
  resourceEnum.INDIVIDUAL,
  new mongoose.Schema({
    availability: { type: String, default: "" },
    howDiscovered: { type: String, default: "" },
    volunteerReason: { type: String, default: "" },
    skills: { type: String, default: "" },
    volunteerRoles: { type: String, default: "" },
  })
);

module.exports = IndividualResource;
