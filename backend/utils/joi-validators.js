const { Joi } = require("celebrate");
const { resourceEnum } = require("../models/Resource");
const text = () => Joi.string().max(10000).allow("");
const common = {
  contactName: Joi.string().max(300),
  contactPhone: text(),
  contactEmail: Joi.string().email().max(254).allow(""),
  address: Joi.string().max(500),
  websiteURL: Joi.string()
    .max(2000)
    .allow("")
    .custom((value, helpers) => {
      try {
        const url = new URL(
          /^[a-z][a-z0-9+.-]*:/i.test(value) ? value : `https://${value}`,
        );
        if (
          !["http:", "https:"].includes(url.protocol) ||
          url.username ||
          url.password
        )
          return helpers.error("any.invalid");
        return url.href;
      } catch {
        return helpers.error("any.invalid");
      }
    }),
  notes: text(),
  tags: Joi.array().max(50).items(Joi.string().max(100)),
  type: Joi.string().valid(...Object.values(resourceEnum)),
};
const individual = {
  availability: text(),
  howDiscovered: text(),
  volunteerReason: text(),
  skills: text(),
  volunteerRoles: text(),
};
const group = { description: text(), companyName: Joi.string().max(300) };
const tangible = {
  description: text(),
  quantity: text(),
  resourceName: Joi.string().max(300),
};
const post = (type, extra, required = {}) =>
  Joi.object({
    ...common,
    ...extra,
    type: Joi.string().valid(type).required(),
    contactName: common.contactName.required(),
    address: common.address.required(),
    ...required,
  });
module.exports = {
  POST_RESOURCE_SCHEMA: Joi.alternatives().try(
    post(resourceEnum.INDIVIDUAL, individual),
    post(resourceEnum.GROUP, group, {
      companyName: group.companyName.required(),
    }),
    post(resourceEnum.TANGIBLE, tangible, {
      resourceName: tangible.resourceName.required(),
    }),
  ),
  PUT_RESOURCE_SCHEMA: Joi.object({
    ...common,
    ...individual,
    ...group,
    ...tangible,
  }).min(1),
};
