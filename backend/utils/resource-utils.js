const axios = require("axios");
const R = require("ramda");
const mapquestKey = process.env.MAPQUEST_KEY;
const mapquestURI = process.env.MAPQUEST_URI;
const { STATE_REGION_MAP } = require("./constants");
const Fuse = require("fuse.js");
const geolib = require("geolib");
const parseLatLongResponse = resp => {
  // Grab the lat/lng object within the result JSON
  const getLocationFromResults = R.path([
    "results",
    0,
    "locations",
    0,
    "latLng"
  ]);

  // Grab the 2 letter state code within the result JSON
  const getStateFromResults = R.path([
    "results",
    0,
    "locations",
    0,
    "adminArea3"
  ]);

  // Take the state and find the federal region that maps to it
  const findFederalRegion = R.pipe(
    R.propEq("State"),
    R.flip(R.find)(STATE_REGION_MAP)
  );

  const region = R.pipe(
    getStateFromResults,
    findFederalRegion,
    R.prop("Region")
  )(resp);

  const getCoord = R.pipe(
    getLocationFromResults,
    R.flip(R.prop)
  )(resp);

  return { region, lat: getCoord("lat"), lng: getCoord("lng") };
};

const addressToLatLong = async address => {
  const addressQuery = `${mapquestURI}address?key=${mapquestKey}&maxResults=5&outFormat=json&location=${address}`;
  const response = await axios.get(addressQuery);
  return parseLatLongResponse(response.data);
};

const latlongToAddress = async function(lat, long) {
  const apiAddress = `${mapquestURI}reverse?key=${mapquestKey}&location=${lat},${long}&includeRoadMetadata=false&includeNearestIntersection=false`;

  const response = await fetch(apiAddress, {});
  const responseJson = await response.json();

  console.log(responseJson["results"][0]["locations"]);

  const streetAddress = responseJson["results"][0]["locations"][0]["street"];
  const city = responseJson["results"][0]["locations"][0]["adminArea5"];
  const state = responseJson["results"][0]["locations"][0]["adminArea3"];
  // country = responseJson["results"][0]["locations"][0]["adminArea1"];
  const postalCode = responseJson["results"][0]["locations"][0][
    "postalCode"
  ].substring(0, 5);
  const fullAddress = `${streetAddress} ${city} ${state} ${postalCode}`;
  return fullAddress;
};

const addDistanceField = (lat, long) => resource => ({
  ...resource.toJSON(),
  distanceFromSearchLoc: computeDistance(
    resource.location.coordinates[1],
    resource.location.coordinates[0],
    lat,
    long
  )
});

const computeDistance = R.curry(
  (sourceLat, sourceLong, destLat, destLong) =>
    (geolib.getDistance(
      {
        latitude: sourceLat,
        longitude: sourceLong
      },
      { latitude: destLat, longitude: destLong }
    ) /
      1000) *
    0.621371
);

const filterByOptions = R.curry((filterOptions, query, resources) => {
  const fuse = new Fuse(resources, filterOptions);
  return fuse.search(query);
});

const resourceLatLens = R.lensPath(["location", "coordinates", 1]);
const resourceLongLens = R.lensPath(["location", "coordinates", 0]);
const resourceRegionLens = R.lensProp("federalRegion");

const distanceFilter = R.curry((lat, long, radius) =>
  R.filter(
    resource =>
      computeDistance(
        R.view(resourceLatLens, resource),
        R.view(resourceLongLens, resource),
        lat,
        long
      ) < radius
  )
);

const filterResourcesWithinRadius = R.curry((lat, long, radius, resources) =>
  R.pipe(
    distanceFilter(lat, long, radius),
    R.map(addDistanceField(lat, long)),
    R.sortBy(R.prop("distanceFromSearchLoc"))
  )(resources)
);

module.exports = {
  addressToLatLong,
  latlongToAddress,
  filterResourcesWithinRadius,
  filterByOptions,
  resourceLatLens,
  resourceLongLens,
  resourceRegionLens
};
