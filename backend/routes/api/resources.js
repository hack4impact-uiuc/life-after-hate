/* eslint-disable camelcase */
const express = require("express");
const R = require("ramda");
const { celebrate, Joi } = require("celebrate");
const extractor = require("keyword-extractor");
Joi.objectId = require("joi-objectid")(Joi);

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
  filterByTags
} = require("../../utils/resource-utils");
const {
  DEFAULT_FILTER_OPTIONS,
  TAG_ONLY_OPTIONS
} = require("../../utils/constants");
const {
  requireAdminStatus,
  requireVolunteerStatus
} = require("../../utils/auth-middleware");
const { resourceEnum } = require("../../models/Resource");

const router = express.Router();

const concatAddress = resource => {
  const { streetAddress, city, state, postalCode } = resource.address;
  resource.address = [streetAddress, city, [state, postalCode].join(" ")].join(
    ", "
  );
  return resource;
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
      success: true
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
      tag: Joi.string()
    }
  }),
  errorWrap(async (req, res) => {
    const { radius, address, keyword, customWeights, tag } = req.query;
    let resources = await Resource.find({}).lean();

    const { lat, lng } = address
      ? await resourceUtils.geocodeAddress(address)
      : {};

    // if custom weights provided, will set custom field rankings
    const filterOptions = customWeights
      ? { ...DEFAULT_FILTER_OPTIONS, keys: customWeights }
      : DEFAULT_FILTER_OPTIONS;

    resources = R.pipe(
      filterResourcesWithinRadius(lat, lng, radius),
      filterByOptions(filterOptions)(keyword),
      filterByOptions(TAG_ONLY_OPTIONS)(tag)
    )(resources);

    res.json({
      code: 200,
      result: { center: [lng, lat], resources: resources.map(concatAddress) },
      success: true
    });
  })
);

// get list of resources filtered by tag options
router.get(
  "/filter/tags",
  requireVolunteerStatus,
  celebrate({
    query: {
      tags: Joi.string()
    }
  }),
  errorWrap(async (req, res) => {
    const { tags } = req.query;
    let resources = await Resource.find({}).lean();

    const tagArray = tags.split(",");

    resources = filterByTags(tagArray, resources);

    res.json({
      code: 200,
      result: resources.map(concatAddress),
      success: true
    });
  })
);

// create new resource
router.post(
  "/",
  requireAdminStatus,
  celebrate({
    body: Joi.object().keys({
      companyName: Joi.string().required(),
      contactName: Joi.string().required(),
      contactPhone: Joi.string().required(),
      contactEmail: Joi.string().required(),
      description: Joi.string().required(),
      address: Joi.string().required(),
      location: Joi.object({
        type: Joi.string().default("Point"),
        coordinates: Joi.array()
          .length(2)
          .items(Joi.number())
      }).default({ type: "Point", coordinates: [0, 0] }),
      notes: Joi.string().allow(""),
      tags: Joi.array().items(Joi.string()),
      type: Joi.string().default(resourceEnum.GROUP)
    })
  }),
  errorWrap(async (req, res) => {
    // Copy the object and add an empty coordinate array
    let data = { ...req.body };
    const createdTags = extractor.extract(data.notes, {
      language: "english",
      remove_digits: true,
      return_changed_case: true,
      remove_duplicates: true
    });

    const { lat, lng, region, ...address } = await resourceUtils.geocodeAddress(
      data.address
    );

    data = R.pipe(
      R.set(resourceLatLens, lat),
      R.set(resourceLongLens, lng),
      R.set(resourceRegionLens, region),
      R.set(resourceAddressLens, address)
    )(data);

    const newResource = new Resource(data);
    newResource.tags = createdTags;
    await newResource.save();

    res.status(201).json({
      code: 201,
      message: "Resource Successfully Created",
      success: true
    });
  })
);

// get one resource
router.get(
  "/:resource_id",
  requireVolunteerStatus,
  celebrate({
    params: {
      resource_id: Joi.objectId().required()
    }
  }),
  errorWrap(async (req, res) => {
    const resourceId = req.params.resource_id;
    const resource = await Resource.findById(resourceId);
    res.json({
      code: 200,
      result: concatAddress(resource),
      success: true
    });
  })
);

// edit resource
router.put(
  "/:resource_id",
  requireAdminStatus,
  celebrate({
    body: Joi.object().keys({
      companyName: Joi.string(),
      contactName: Joi.string(),
      contactPhone: Joi.string(),
      contactEmail: Joi.string(),
      description: Joi.string(),
      address: Joi.string(),
      location: Joi.object({
        type: Joi.string().default("Point"),
        coordinates: Joi.array()
          .length(2)
          .items(Joi.number())
      }),
      notes: Joi.string(),
      tags: Joi.array().items(Joi.string()),
      type: Joi.string()
    }),
    params: {
      resource_id: Joi.objectId().required()
    }
  }),
  errorWrap(async (req, res) => {
    let data = { ...req.body };
    const resourceId = req.params.resource_id;

    const { lat, lng, region, ...address } = await resourceUtils.geocodeAddress(
      data.address
    );

    data = R.pipe(
      R.set(resourceLatLens, lat),
      R.set(resourceLongLens, lng),
      R.set(resourceRegionLens, region),
      R.set(resourceAddressLens, address)
    )(data);

    const resource = await Resource.findByIdAndUpdate(
      resourceId,
      { $set: data },
      { new: true }
    );

    const ret = resource
      ? {
          code: 200,
          message: "Resource Updated Successfully",
          success: true
        }
      : {
          code: 404,
          message: "Resource Not Found",
          success: false
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
      resource_id: Joi.objectId().required()
    }
  }),
  errorWrap(async (req, res) => {
    const resourceId = req.params.resource_id;
    const resource = await Resource.findByIdAndRemove(resourceId);
    const ret = resource
      ? {
          code: 200,
          message: "Resource deleted successfully",
          success: true
        }
      : {
          code: 404,
          message: "Resource not found",
          success: false
        };
    res.status(ret.code).json(ret);
  })
);

module.exports = router;
