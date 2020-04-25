const { Joi: JoiOriginal } = require("celebrate");
const { resourceEnum } = require("../models/Resource");
// Joi.objectId = require("joi-objectid")(Joi);
// Workaround
// https://github.com/hapijs/joi/issues/556#issuecomment-593115711
const Joi = JoiOriginal.extend({
  // we want to apply this extension to all available types
  type: /.*/,
  rules: {
    requiredAtFirst: {
      method() {
        // we apply 'required()' only if the schema
        // is tailored to the 'finally' target
        // see https://github.com/hapijs/joi/blob/master/API.md#anyaltertargets
        return this.alter({
          post: (schema) => schema.required(),
        });
      },
    },
  },
});

const BASE_RESOURCE = Joi.object().keys({
  contactName: Joi.string().requiredAtFirst(),
  contactPhone: Joi.string(),
  contactEmail: Joi.string().requiredAtFirst(),
  address: Joi.string().requiredAtFirst(),
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
  description: Joi.string().requiredAtFirst(),
  companyName: Joi.string().requiredAtFirst(),
});

const RESOURCE_SCHEMA = Joi.alternatives().conditional(".type", {
  switch: [
    { is: resourceEnum.INDIVIDUAL, then: INDIVIDUAL_RESOURCE },
    { is: resourceEnum.GROUP, then: GROUP_RESOURCE },
  ],
});

module.exports = {
  POST_RESOURCE_SCHEMA: RESOURCE_SCHEMA.tailor("post"),
  PUT_RESOURCE_SCHEMA: RESOURCE_SCHEMA,
};