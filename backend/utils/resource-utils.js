const axios = require("axios");
const R = require("ramda");
const mapquestKey = process.env.MAPQUEST_KEY;
const mapquestURI =
  process.env.MAPQUEST_URI || "https://www.mapquestapi.com/geocoding/v1/";
const Boom = require("@hapi/boom");
const { STATE_REGION_MAP } = require("./constants");
const Fuse = require("fuse.js");
const geolib = require("geolib");
const { resourceEnum } = require("../models/Resource");
const GroupResource = require("../models/GroupResource");
const IndividualResource = require("../models/IndividualResource");
const TangibleResource = require("../models/TangibleResource");

const parseGeocodingResponse = (resp) => {
  // Grab the lat/lng object within the result JSON
  const getLocationFromResults = R.path([
    "results",
    0,
    "locations",
    0,
    "latLng",
  ]);

  // Grab the street within the result JSON
  const getStreetFromResults = R.path(["results", 0, "locations", 0, "street"]);

  // Grab the city within the result JSON
  const getCityFromResults = R.path([
    "results",
    0,
    "locations",
    0,
    "adminArea5",
  ]);

  // Grab the 2 letter state code within the result JSON
  const getStateFromResults = R.path([
    "results",
    0,
    "locations",
    0,
    "adminArea3",
  ]);

  // Grab the postal code within the result JSON
  const getPostalCodeFromResults = R.path([
    "results",
    0,
    "locations",
    0,
    "postalCode",
  ]);

  // Take the state and find the federal region that maps to it
  const findFederalRegion = R.pipe(
    R.propEq("State"),
    R.flip(R.find)(STATE_REGION_MAP),
  );

  const region = R.pipe(
    getStateFromResults,
    findFederalRegion,
    R.prop("Region"),
  )(resp);

  const getCoord = R.pipe(getLocationFromResults, R.flip(R.prop))(resp);

  return {
    region,
    lat: getCoord("lat"),
    lng: getCoord("lng"),
    streetAddress: getStreetFromResults(resp),
    city: getCityFromResults(resp),
    state: getStateFromResults(resp),
    postalCode: getPostalCodeFromResults(resp),
  };
};

const getModelForType = (type) => {
  switch (type) {
    case resourceEnum.TANGIBLE:
      return TangibleResource;
    case resourceEnum.GROUP:
      return GroupResource;
    case resourceEnum.INDIVIDUAL:
      return IndividualResource;
    default:
      throw new Error(`Cannot find corresponding model for type ${type}!`);
  }
};

const geocodeAddress = async (address) => {
  if (typeof address !== "string" || !address.trim() || address.length > 500)
    throw Boom.badRequest("Invalid address");
  const url = new URL("address", mapquestURI);
  if (
    url.protocol !== "https:" ||
    url.hostname !== "www.mapquestapi.com" ||
    url.username ||
    url.password
  ) {
    throw new Error("Geocoding requires the HTTPS MapQuest endpoint");
  }
  try {
    const response = await axios.get(url.href, {
      params: {
        key: mapquestKey,
        maxResults: 1,
        outFormat: "json",
        location: address,
      },
      timeout: 10000,
      maxRedirects: 0,
      maxContentLength: 1024 * 1024,
    });
    const result = parseGeocodingResponse(response.data);
    if (!Number.isFinite(result.lat) || !Number.isFinite(result.lng))
      throw new Error("No coordinates");
    return result;
  } catch (_error) {
    // Never propagate Axios errors containing the API key and searched address.
    throw Boom.badGateway("Geocoding failed");
  }
};

const addDistanceField = (lat, long) => (resource) => ({
  ...resource,
  distanceFromSearchLoc: computeDistance(
    resource.location.coordinates[1],
    resource.location.coordinates[0],
    lat,
    long,
  ),
});

const computeDistance = R.curry(
  (sourceLat, sourceLong, destLat, destLong) =>
    (geolib.getDistance(
      {
        latitude: sourceLat,
        longitude: sourceLong,
      },
      { latitude: destLat, longitude: destLong },
    ) /
      1000) *
    0.621371,
);

const filterByOptions = R.curry((filterOptions, query, resources) => {
  if (!(filterOptions && query && resources)) {
    return resources;
  }

  // Take the entire object and put all the different fields together to fuzzy search on
  const getAllText = R.pipe(
    R.omit([
      "dateCreated",
      "_id",
      "type",
      "federalRegion",
      "__v",
      "address",
      "location",
      "dateLastModified",
      "lastModifiedUser",
    ]),
    (r) => Object.values(r),
    R.join(" "),
  );

  const preparedResources = R.map(
    R.over(R.lens(R.identity, R.assoc("allText")), getAllText),
  )(resources);

  const fuse = new Fuse(preparedResources, filterOptions);
  const results = fuse
    .search(query)
    .map((i) => i.item)
    .map(R.omit(["allText"]));
  return results;
});

const resourceLatLens = R.lensPath(["location", "coordinates", 1]);
const resourceLongLens = R.lensPath(["location", "coordinates", 0]);
const resourceRegionLens = R.lensProp("federalRegion");
const resourceAddressLens = R.lensProp("address");

const distanceFilter = R.curry((lat, long, radius) =>
  R.filter(
    (resource) =>
      computeDistance(
        R.view(resourceLatLens, resource),
        R.view(resourceLongLens, resource),
        lat,
        long,
      ) < radius,
  ),
);

// Coerce to boolean
const nullLocationFilter = R.filter(
  (resource) =>
    Number.isFinite(R.view(resourceLatLens, resource)) &&
    Number.isFinite(R.view(resourceLongLens, resource)),
);

const touchResourceModification = (data, user) => {
  if (!user) {
    return data;
  }
  const { firstName, lastName } = user;
  data.lastModifiedUser = [firstName, lastName].join(" ");
  data.dateLastModified = Date.now();
  return data;
};

const filterResourcesWithinRadius = R.curry((lat, long, radius, resources) => {
  if (![lat, long, radius].every(Number.isFinite)) {
    // Do nothing if undefined
    return resources;
  }
  return R.pipe(
    nullLocationFilter,
    distanceFilter(lat, long, radius),
    R.map(addDistanceField(lat, long)),
    R.sortBy(R.prop("distanceFromSearchLoc")),
  )(resources);
});

const toTitleCase = (str) =>
  str.replace(/(^|\s)\S/g, function (t) {
    return t.toUpperCase();
  });

// Apply fn only if path exists
const updatePath = R.curry((pth, fn, obj) =>
  R.hasPath(pth, obj) ? R.assocPath(pth, fn(R.path(pth, obj)), obj) : obj,
);

const isAbsoluteURL = (url) => /^((http|https|ftp):\/\/)/.test(url);
const prefixWithHTTP = (url) => (isAbsoluteURL(url) ? url : `https://${url}`);

const normalizeResourceFields = R.pipe(
  updatePath(["tags"], R.map(toTitleCase)),
  updatePath(["websiteURL"], (url) => (url ? prefixWithHTTP(url) : url)),
);

const formatIncomingData = ({ lat, lng, region, address }) =>
  R.pipe(
    R.set(resourceLatLens, lat),
    R.set(resourceLongLens, lng),
    R.set(resourceRegionLens, region),
    R.set(resourceAddressLens, address),
    updatePath(["tags"], R.map(toTitleCase)),
    updatePath(["websiteURL"], (url) => (url ? prefixWithHTTP(url) : url)),
  );

module.exports = {
  normalizeResourceFields,
  getModelForType,
  geocodeAddress,
  filterResourcesWithinRadius,
  filterByOptions,
  resourceLatLens,
  resourceLongLens,
  resourceRegionLens,
  resourceAddressLens,
  touchResourceModification,
  toTitleCase,
  formatIncomingData,
};
