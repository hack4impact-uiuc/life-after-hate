/* eslint-disable camelcase */
const express = require("express");
const R = require("ramda");
const { celebrate, Joi } = require("celebrate");
Joi.objectId = require("joi-objectid")(Joi);
const beeline = require("honeycomb-beeline");
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
    const span = beeline.startSpan({ name: "Resource Fetch" });
    const resources = await Resource.find({}).lean();
    beeline.finishSpan(span);
    res.json({
      code: 200,
      result: resources.map(concatAddress),
      success: true,
    });
  })
);

router.get(
  "/tags",
  requireVolunteerStatus,
  errorWrap(async (req, res) => {
    const tags = await Resource.distinct("tags").lean();
    res.json({ code: 200, result: tags, success: true });
  })
);
// get list of resources filtered by location radius
router.get(
  "/filter",
  requireVolunteerStatus,
  celebrate({
    query: {
      radius: Joi.number(),
      address: Joi.string(),
      keyword: Joi.string(),
      customWeights: Joi.array(),
      tag: Joi.string(),
    },
  }),
  errorWrap(async (req, res) => {
    const { radius, address, keyword, customWeights, tag } = req.query;
    let span = beeline.startSpan({ name: "Resource Fetch" });
    let resources = await Resource.find({}).lean();
    beeline.finishSpan(span);
    const { lat, lng } = address
      ? await resourceUtils.geocodeAddress(address)
      : {};

    // if custom weights provided, will set custom field rankings
    const filterOptions = customWeights
      ? { ...DEFAULT_FILTER_OPTIONS, keys: customWeights }
      : DEFAULT_FILTER_OPTIONS;

    span = beeline.startSpan({ name: "Resource Filtering Computation" });
    resources = R.pipe(
      filterResourcesWithinRadius(lat, lng, radius),
      filterByOptions(filterOptions)(keyword),
      filterByOptions(TAG_ONLY_OPTIONS)(tag)
    )(resources);
    beeline.finishSpan(span);

    res.json({
      code: 200,
      result: { center: [lng, lat], resources: resources.map(concatAddress) },
      success: true,
    });
  })
);

// create new resource
router.post(
  "/",
  requireAdminStatus,
  celebrate({ body: validators.POST_RESOURCE_SCHEMA }),
  errorWrap(async (req, res) => {
    // Copy the object and add an empty coordinate array
    let data = { ...req.body };

    const span = beeline.startSpan({ name: "Resource Create" });
    const { lat, lng, region, ...address } = await resourceUtils.geocodeAddress(
      data.address
    );
    beeline.finishSpan(span);

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
  })
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
    const span = beeline.startSpan({ name: "Resource Fetch" });
    const resource = await Resource.findById(resourceId).lean();
    beeline.finishSpan(span);
    res.json({
      code: 200,
      result: concatAddress(resource),
      success: true,
    });
  })
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

    let span = beeline.startSpan({ name: "Geocode Address" });
    const { lat, lng, region, ...address } = await resourceUtils.geocodeAddress(
      data.address
    );
    beeline.finishSpan(span);

    data = formatIncomingData({ lat, lng, region, address })(data);
    touchResourceModification(data, req.user);

    const ResourceModel = getModelForType(data.type);
    span = beeline.startSpan({ name: "Resource Update" });
    const resource = await ResourceModel.findByIdAndUpdate(
      resourceId,
      { $set: data },
      { new: true }
    );
    beeline.finishSpan(span);

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
  })
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
    const span = beeline.startSpan({ name: "Resource Delete" });
    const resource = await Resource.findByIdAndRemove(resourceId);
    beeline.finishSpan(span);
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
  })
);

module.exports = router;
