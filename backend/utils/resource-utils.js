const axios = require("axios");
const R = require("ramda");
const mapquestKey = process.env.MAPQUEST_KEY;
const mapquestURI = process.env.MAPQUEST_URI;
const { STATE_REGION_MAP } = require("./constants");
const parseLatLongResponse = resp => {
  // Grab the lat/lng object within the result JSON
  const getLatLngFromResults = R.path(["results", 0, "locations", 0, "latLng"]);
  // Grab the 2 letter state code within the result JSON
  const getStateFromResults = R.path([
    "results",
    0,
    "locations",
    0,
    "adminArea3"
  ]);

  // Take the state and find the federal region that maps to it
  const findFederalRegion = state =>
    R.find(obj => obj.State === state)(STATE_REGION_MAP);

  // Execute and get only the region component
  const region = R.compose(
    R.path(["Region"]),
    findFederalRegion,
    getStateFromResults
  )(resp);

  // Execute the function and get only the latitude component from the object
  const lat = R.compose(
    R.path(["lat"]),
    getLatLngFromResults
  )(resp);

  const lng = R.compose(
    R.path(["lng"]),
    getLatLngFromResults
  )(resp);

  // Note that this will now return an empty object if the response is not valid
  return { region, lat, lng };
};

const addressToLatLong = async address => {
  const addressQuery = `${mapquestURI}address?key=${mapquestKey}&maxResults=5&outFormat=json&location=${address}`;
  const response = await axios.get(addressQuery);
  return parseLatLongResponse(response.data);
};

const latlongToAddress = async function(lat, long) {
  const api_address = `${mapquestURI}reverse?key=${mapquestKey}&location=${lat},${long}&includeRoadMetadata=false&includeNearestIntersection=false`;

  const response = await fetch(api_address, {});
  const responseJson = await response.json();

  console.log(responseJson["results"][0]["locations"]);

  const street_address = responseJson["results"][0]["locations"][0]["street"];
  const city = responseJson["results"][0]["locations"][0]["adminArea5"];
  const state = responseJson["results"][0]["locations"][0]["adminArea3"];
  // country = responseJson["results"][0]["locations"][0]["adminArea1"];
  const postal_code = responseJson["results"][0]["locations"][0][
    "postalCode"
  ].substring(0, 5);
  const full_address = `${street_address} ${city} ${state} ${postal_code}`;
  return full_address;
};

module.exports = {
  addressToLatLong,
  latlongToAddress
};
