/* eslint-disable camelcase */
const express = require("express");
const Boom = require("@hapi/boom");
const R = require("ramda");
const { celebrate, Joi } = require("celebrate");
Joi.objectId = require("joi-objectid")(Joi);
const Resource = require("../../models/Resource");
const errorWrap = require("../../utils/error-wrap");
const resourceUtils = require("../../utils/resource-utils");
const {
  resourceAddressLens,
  filterResourcesWithinRadius,
  filterByOptions,
  touchResourceModification,
  getModelForType,
  formatIncomingData,
} = require("../../utils/resource-utils");
const {
  DEFAULT_FILTER_OPTIONS,
  TAG_ONLY_OPTIONS,
} = require("../../utils/constants");
const {
  requireAdminStatus,
  requireVolunteerStatus,
} = require("../../utils/auth-middleware");
const validators = require("../../utils/joi-validators");
const router = express.Router();

const concatAddress = (resource) => {
  // Older stored records may predate URL validation. Never expose executable links.
  let websiteURL = "";
  try {
    const url = new URL(resource.websiteURL);
    if (
      ["http:", "https:"].includes(url.protocol) &&
      !url.username &&
      !url.password
    )
      websiteURL = url.href;
  } catch {
    /* Missing or malformed legacy URL. */
  }
  resource = { ...resource, websiteURL };
  const address = R.view(resourceAddressLens, resource);
  if (!resource.address) {
    return resource;
  }
  const { streetAddress, city, state, postalCode } = address;
  const formattedAddress = [
    streetAddress,
    city,
    [state, postalCode].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .join(", ");
  return { ...resource, address: formattedAddress };
};

// get all resources
router.get(
  "/",
  requireVolunteerStatus,
  errorWrap(async (req, res) => {
    const resources = await Resource.find({}).lean();

    res.json({
      code: 200,
      result: resources.map(concatAddress),
      success: true,
    });
  }),
);

router.get(
  "/tags",
  requireVolunteerStatus,
  errorWrap(async (req, res) => {
    const tags = await Resource.distinct("tags").lean();
    res.json({ code: 200, result: tags, success: true });
  }),
);
// get list of resources filtered by location radius
router.get(
  "/filter",
  requireVolunteerStatus,
  celebrate({
    query: {
      radius: Joi.number().min(0).max(12500),
      address: Joi.string().max(500),
      keyword: Joi.string().max(200),

      tag: Joi.string().max(100),
    },
  }),
  errorWrap(async (req, res) => {
    const { radius, address, keyword, tag } = req.query;

    let resources = await Resource.find({}).lean();

    const { lat, lng } = address
      ? await resourceUtils.geocodeAddress(address)
      : {};

    const filterOptions = DEFAULT_FILTER_OPTIONS;

    resources = R.pipe(
      filterResourcesWithinRadius(lat, lng, radius),
      filterByOptions(filterOptions)(keyword),
      filterByOptions(TAG_ONLY_OPTIONS)(tag),
    )(resources);

    res.json({
      code: 200,
      result: { center: [lng, lat], resources: resources.map(concatAddress) },
      success: true,
    });
  }),
);

// create new resource
router.post(
  "/",
  requireAdminStatus,
  celebrate({ body: validators.POST_RESOURCE_SCHEMA }),
  errorWrap(async (req, res) => {
    // Copy the object and add an empty coordinate array
    let data = { ...req.body };

    const { lat, lng, region, ...address } = await resourceUtils.geocodeAddress(
      data.address,
    );

    data = formatIncomingData({ lat, lng, region, address })(data);
    touchResourceModification(data, req.user);

    const ResourceModel = getModelForType(data.type);
    const newResource = new ResourceModel(data);
    const { _id } = await newResource.save();

    res.status(201).json({
      code: 201,
      message: "Resource Successfully Created",
      id: _id,
      success: true,
    });
  }),
);

// get one resource
router.get(
  "/:resource_id",
  requireVolunteerStatus,
  celebrate({
    params: {
      resource_id: Joi.objectId().required(),
    },
  }),
  errorWrap(async (req, res) => {
    const resourceId = req.params.resource_id;

    const resource = await Resource.findById(resourceId).lean();
    if (!resource) throw Boom.notFound();

    res.json({
      code: 200,
      result: concatAddress(resource),
      success: true,
    });
  }),
);

// edit resource
router.put(
  "/:resource_id",
  requireAdminStatus,
  celebrate({
    body: validators.PUT_RESOURCE_SCHEMA,
    params: {
      resource_id: Joi.objectId().required(),
    },
  }),
  errorWrap(async (req, res) => {
    let data = { ...req.body };
    const resourceId = req.params.resource_id;

    const existing = await Resource.findById(resourceId).lean();
    if (!existing) throw Boom.notFound();
    if (data.type && data.type !== existing.type)
      throw Boom.badRequest("Resource type cannot change");
    if (data.address !== undefined) {
      const { lat, lng, region, ...address } =
        await resourceUtils.geocodeAddress(data.address);
      data = formatIncomingData({ lat, lng, region, address })(data);
    } else {
      data = resourceUtils.normalizeResourceFields(data);
    }
    touchResourceModification(data, req.user);
    const ResourceModel = getModelForType(existing.type);
    const resource = await ResourceModel.findByIdAndUpdate(
      resourceId,
      { $set: data },
      { returnDocument: "after", runValidators: true },
    );

    const ret = resource
      ? {
          code: 200,
          message: "Resource Updated Successfully",
          success: true,
        }
      : {
          code: 404,
          message: "Resource Not Found",
          success: false,
        };
    res.status(ret.code).json(ret);
  }),
);

// delete resource
router.delete(
  "/:resource_id",
  requireAdminStatus,
  celebrate({
    params: {
      resource_id: Joi.objectId().required(),
    },
  }),
  errorWrap(async (req, res) => {
    const resourceId = req.params.resource_id;

    const resource = await Resource.findByIdAndDelete(resourceId);

    const ret = resource
      ? {
          code: 200,
          message: "Resource deleted successfully",
          success: true,
        }
      : {
          code: 404,
          message: "Resource not found",
          success: false,
        };
    res.status(ret.code).json(ret);
  }),
);

module.exports = router;
