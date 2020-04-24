const { Joi } = require("celebrate");
const { resourceEnum } = require("../models/Resource");
// Joi.objectId = require("joi-objectid")(Joi);

const BASE_RESOURCE = Joi.object().keys({
  contactName: Joi.string().required(),
  contactPhone: Joi.string(),
  contactEmail: Joi.string().required(),
  address: Joi.string().required(),
  location: Joi.object({
    type: Joi.string().default("Point"),
    coordinates: Joi.array().length(2).items(Joi.number()),
  }).default({ type: "Point", coordinates: [0, 0] }),
  notes: Joi.string().allow(""),
  tags: Joi.array().items(Joi.string()),
  type: Joi.string()
    .valid(resourceEnum.INDIVIDUAL, resourceEnum.GROUP)
    .default(resourceEnum.INDIVIDUAL),
});

const INDIVIDUAL_RESOURCE = BASE_RESOURCE.keys({
  availability: Joi.string(),
  howDiscovered: Joi.string(),
  volunteerReason: Joi.string(),
  skills: Joi.string(),
  volunteerRoles: Joi.string(),
});

const GROUP_RESOURCE = BASE_RESOURCE.keys({
  description: Joi.string().required(),
  companyName: Joi.string().required(),
});

const RESOURCE_SCHEMA = Joi.alternatives().conditional(".type", {
  switch: [
    { is: resourceEnum.INDIVIDUAL, then: INDIVIDUAL_RESOURCE },
    { is: resourceEnum.GROUP, then: GROUP_RESOURCE },
  ],
});

module.exports = { RESOURCE_SCHEMA };
