const mongoose = require("mongoose");
const BaseResource = require("./Resource");
const { resourceEnum } = require("./Resource");

const GroupResource = BaseResource.discriminator(
  resourceEnum.GROUP,
  new mongoose.Schema({
    description: { type: String, default: "" },
    companyName: { type: String, default: "" },
  })
);

module.exports = GroupResource;
