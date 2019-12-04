const express = require("express");
const router = express.Router();
const Resource = require("../../models/Resource");
const errorWrap = require("../../utils/error-wrap");
const { celebrate, Joi } = require("celebrate");
const Fuse = require("fuse.js");
const { sortByDistance } = require("../../utils/resource-utils");
let { options } = require("../../utils/resource-utils");
const fetch = require("node-fetch");
Joi.objectId = require("joi-objectid")(Joi);
const extractor = require("keyword-extractor");
const mapquestKey = process.env.MAPQUEST_KEY;
const mapquestURI = process.env.MAPQUEST_URI;

const stateToFederalRegion = [
  { State: "AL", Region: 4 },
  { State: "AK", Region: 10 },
  { State: "AZ", Region: 9 },
  { State: "AR", Region: 6 },
  { State: "CA", Region: 9 },
  { State: "CO", Region: 8 },
  { State: "CT", Region: 1 },
  { State: "DE", Region: 3 },
  { State: "FL", Region: 4 },
  { State: "GA", Region: 4 },
  { State: "HI", Region: 9 },
  { State: "ID", Region: 10 },
  { State: "IL", Region: 5 },
  { State: "IN", Region: 5 },
  { State: "IA", Region: 7 },
  { State: "KS", Region: 7 },
  { State: "KY", Region: 4 },
  { State: "LA", Region: 6 },
  { State: "ME", Region: 1 },
  { State: "MD", Region: 3 },
  { State: "MA", Region: 1 },
  { State: "MI", Region: 5 },
  { State: "MN", Region: 5 },
  { State: "MS", Region: 4 },
  { State: "MO", Region: 7 },
  { State: "MT", Region: 8 },
  { State: "NE", Region: 7 },
  { State: "NV", Region: 9 },
  { State: "NH", Region: 1 },
  { State: "NJ", Region: 2 },
  { State: "NM", Region: 6 },
  { State: "NY", Region: 2 },
  { State: "NC", Region: 4 },
  { State: "ND", Region: 8 },
  { State: "OH", Region: 5 },
  { State: "OK", Region: 6 },
  { State: "OR", Region: 10 },
  { State: "PA", Region: 3 },
  { State: "RI", Region: 1 },
  { State: "SC", Region: 4 },
  { State: "SD", Region: 8 },
  { State: "TN", Region: 4 },
  { State: "TX", Region: 6 },
  { State: "UT", Region: 8 },
  { State: "VT", Region: 1 },
  { State: "VA", Region: 3 },
  { State: "WA", Region: 10 },
  { State: "WV", Region: 3 },
  { State: "WI", Region: 5 },
  { State: "WY", Region: 8 },
  { State: "PR", Region: 2 }
  // { State: "US Virgin Islands", Region: 2 },
  // { State: "District of Columbia", Region: 3 },
  // { State: "American Samoa", Region: 9 },
  // { State: "Guam", Region: 9 },
  // { State: "Northern Mariana Islands", Region: 9 }
];

// const api_url =

async function addressToLatLong(address) {
  const api_latlong = `${mapquestURI}address?key=${mapquestKey}&maxResults=5&outFormat=json&location=${address}`;
  // "&boundingBox=40.121581,-88.253981,40.098315,-88.205082";

  const response = await fetch(api_latlong, {});
  const responseJson = await response.json();

  let lat = responseJson["results"][0]["locations"][0]["latLng"]["lat"];
  let lng = responseJson["results"][0]["locations"][0]["latLng"]["lng"];

  let state = responseJson["results"][0]["locations"][0]["adminArea3"];
  let region = stateToFederalRegion.find(obj => obj.State === state).Region;

  return { lat: lat, lng: lng, region: region };
}

// async function latlongToAddress(lat, long) {
//   let api_address = `${mapquestURI}reverse?key=${mapquestKey}&location=${lat},${long}&includeRoadMetadata=false&includeNearestIntersection=false`;
//   // "&boundingBox=40.121581,-88.253981,40.098315,-88.205082";

//   const response = await fetch(api_address, {});
//   const responseJson = await response.json();

//   console.log(responseJson["results"][0]["locations"]);

//   let street_address = responseJson["results"][0]["locations"][0]["street"];
//   let city = responseJson["results"][0]["locations"][0]["adminArea5"];
//   let state = responseJson["results"][0]["locations"][0]["adminArea3"];
//   // country = responseJson["results"][0]["locations"][0]["adminArea1"];
//   let postal_code = responseJson["results"][0]["locations"][0][
//     "postalCode"
//   ].substring(0, 5);
//   let full_address = `${street_address} ${city} ${state} ${postal_code}`;
//   return full_address;
// }

// get all resources
router.get(
  "/",
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
  celebrate({
    query: {
      radius: Joi.number(),
      address: Joi.string(),
      keyword: Joi.string(),
      customWeights: Joi.array()
    }
  }),
  errorWrap(async (req, res) => {
    const { radius, address, keyword, customWeights } = req.query;
    let resources = await Resource.find({});

    let latlng = await addressToLatLong(address);
    let lat = latlng.lat;
    let long = latlng.lng;

    // 3963.2 = radius of Earth in miles
    if (radius && lat && long) {
      resources = await Resource.find({
        location: {
          $geoWithin: { $centerSphere: [[long, lat], radius / 3963.2] }
        }
      });

      // sort by closest distance first
      resources.sort((a, b) => {
        sortByDistance(a, b, lat, long);
      });
    }

    // fuzzy search
    if (keyword) {
      // if custom weights provided, will set custom field rankings
      if (customWeights) {
        options.keys = customWeights;
      }

      // else uses default weights contained in resource-utils.js
      const fuse = new Fuse(resources, options);
      resources = fuse.search(keyword);
    }

    res.json({
      code: 200,
      result: resources,
      success: true
    });
  })
);

// create new resource
router.post(
  "/",
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
      notes: Joi.string(),
      tags: Joi.array().items(Joi.string())
    })
  }),
  errorWrap(async (req, res) => {
    // const newResource;
    const data = req.body;
    const created_tags = extractor.extract(data.notes, {
      language: "english",
      remove_digits: true,
      return_changed_case: true,
      remove_duplicates: true
    });

    let latlng = await addressToLatLong(data.address);
    // For now until API key integrated
    // latlng = { lat: -88, lng: 22, region: 2 };

    data.location.coordinates[0] = latlng.lat;
    data.location.coordinates[1] = latlng.lng;
    data.federalRegion = latlng.region;

    // const goodAddress = latlongToAddress(data.location.coordinates[0], data.location.coordinates[1]);
    // goodAddress.then(function(result) {
    //   data.address = result;
    //   console.log("result is " + result);
    // })
    const newResource = new Resource(data);
    newResource.tags = created_tags;
    await newResource.save();

    res.json({
      code: 201,
      message: "Resource Successfully Created",
      success: true
    });
  })
);

// get one resource
router.get(
  "/:resource_id",
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
