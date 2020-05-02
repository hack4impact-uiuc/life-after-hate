/* eslint-disable camelcase */
const express = require("express");
const R = require("ramda");
const { celebrate, Joi } = require("celebrate");
const extractor = require("keyword-extractor");
Joi.objectId = require("joi-objectid")(Joi);
const beeline = require("honeycomb-beeline");
const IndividualResource = require("../../models/IndividualResource");
const GroupResource = require("../../models/GroupResource");
const Resource = require("../../models/Resource");
const errorWrap = require("../../utils/error-wrap");
const resourceUtils = require("../../utils/resource-utils");
const {
  resourceLatLens,
  resourceLongLens,
  resourceRegionLens,
  resourceAddressLens,
  filterResourcesWithinRadius,
  filterByOptions,
} = require("../../utils/resource-utils");
const {
  DEFAULT_FILTER_OPTIONS,
  TAG_ONLY_OPTIONS,
} = require("../../utils/constants");
const {
  requireAdminStatus,
  requireVolunteerStatus,
} = require("../../utils/auth-middleware");
const { resourceEnum } = require("../../models/Resource");
const validators = require("../../utils/joi-validators");
const router = express.Router();

const concatAddress = (resource) => {
  if (!resource.address) {
    resource.address = "";
  } else {
    const { streetAddress, city, state, postalCode } = resource.address;
    resource.address = [
      streetAddress,
      city,
      [state, postalCode].filter(Boolean).join(" "),
    ]
      .filter(Boolean)
      .join(", ");
  }
  return resource;
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
    const createdTags = extractor.extract(data.notes, {
      language: "english",
      remove_digits: true,
      return_changed_case: true,
      remove_duplicates: true,
    });

    const span = beeline.startSpan({ name: "Resource Create" });
    const { lat, lng, region, ...address } = await resourceUtils.geocodeAddress(
      data.address
    );
    beeline.finishSpan(span);

    data = R.pipe(
      R.set(resourceLatLens, lat),
      R.set(resourceLongLens, lng),
      R.set(resourceRegionLens, region),
      R.set(resourceAddressLens, address)
    )(data);

    const newResource =
      data.type === resourceEnum.INDIVIDUAL
        ? new IndividualResource(data)
        : new GroupResource(data);
    newResource.tags = createdTags;
    await newResource.save();

    res.status(201).json({
      code: 201,
      message: "Resource Successfully Created",
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
    const resource = await Resource.findById(resourceId);
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

    data = R.pipe(
      R.set(resourceLatLens, lat),
      R.set(resourceLongLens, lng),
      R.set(resourceRegionLens, region),
      R.set(resourceAddressLens, address)
    )(data);

    const resourceType =
      data.type === resourceEnum.INDIVIDUAL
        ? IndividualResource
        : GroupResource;
    span = beeline.startSpan({ name: "Resource Update" });
    const resource = await resourceType.findByIdAndUpdate(
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
