const express = require("express");
const router = express.Router();
const Resource = require("../../models/Resource");
const errorWrap = require("../../utils/error-wrap");
const { celebrate, Joi } = require("celebrate");
const Fuse = require("fuse.js");
const resourceUtils = require("../../utils/resource-utils");
const {
  DEFAULT_FILTER_OPTIONS,
  TAG_ONLY_OPTIONS
} = require("../../utils/constants");
Joi.objectId = require("joi-objectid")(Joi);
const extractor = require("keyword-extractor");
const {
  requireAdminStatus,
  requireVolunteerStatus
} = require("../../utils/auth-middleware");
const geolib = require("geolib");

// get all resources
router.get(
  "/",
  requireVolunteerStatus,
  errorWrap(async (req, res) => {
    const resources = await Resource.find({});
    res.json({
      code: 200,
      result: resources,
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
    let resources = await Resource.find({});

    const latlng = await resourceUtils.addressToLatLong(address);
    const lat = latlng.lat;
    const long = latlng.lng;

    if (radius && lat && long) {
      const radiusOfEarth = 3963.2; // in miles
      resources = await Resource.find({
        location: {
          $geoWithin: { $centerSphere: [[long, lat], radius / radiusOfEarth] }
        }
      });

      resources = resources.map(resource => ({
        ...resource._doc,
        distanceFromSearchLoc:
          (geolib.getDistance(
            {
              latitude: resource.location.coordinates[1],
              longitude: resource.location.coordinates[0]
            },
            { latitude: lat, longitude: long }
          ) /
            1000) *
          0.621371
      }));

      // sort by closest distance
      resources = resources.sort(
        (a, b) => a.distanceFromSearchLoc - b.distanceFromSearchLoc
      );
    }
    let filterOptions = DEFAULT_FILTER_OPTIONS;
    // fuzzy search
    if (keyword) {
      // if custom weights provided, will set custom field rankings
      if (customWeights) {
        filterOptions = { ...filterOptions, keys: customWeights };
      }

      // else uses default weights contained in resource-utils.js
      const fuse = new Fuse(resources, filterOptions);
      resources = fuse.search(keyword);
    }

    if (tag) {
      const fuse = new Fuse(resources, TAG_ONLY_OPTIONS);
      resources = fuse.search(tag);
    }

    res.json({
      code: 200,
      result: { center: [long, lat], resources },
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
      }).required(),
      notes: Joi.string()
        .required()
        .allow(""),
      tags: Joi.array().items(Joi.string())
    })
  }),
  errorWrap(async (req, res) => {
    const data = req.body;
    const created_tags = extractor.extract(data.notes, {
      language: "english",
      remove_digits: true,
      return_changed_case: true,
      remove_duplicates: true
    });

    const latlng = await resourceUtils.addressToLatLong(data.address);

    data.location.coordinates[0] = latlng.lng;
    data.location.coordinates[1] = latlng.lat;
    data.federalRegion = latlng.region;

    const newResource = new Resource(data);
    newResource.tags = created_tags;
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
      result: resource,
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
      tags: Joi.array().items(Joi.string())
    }),
    params: {
      resource_id: Joi.objectId().required()
    }
  }),
  errorWrap(async (req, res) => {
    const data = req.body;
    const resourceId = req.params.resource_id;

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
