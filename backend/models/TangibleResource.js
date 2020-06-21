const mongoose = require("mongoose");
const BaseResource = require("./Resource");
const { resourceEnum } = require("./Resource");

const TangibleResource = BaseResource.discriminator(
  resourceEnum.TANGIBLE,
  new mongoose.Schema({
    resourceName: { type: String, default: "", required: true },
    description: { type: String, default: "" },
    quantity: { type: Number, default: 0 },
  })
);

module.exports = TangibleResource;
