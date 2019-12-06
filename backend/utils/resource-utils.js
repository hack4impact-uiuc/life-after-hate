const geolib = require("geolib");
const fetch = require("node-fetch");
const mapquestKey = process.env.MAPQUEST_KEY;
const mapquestURI = process.env.MAPQUEST_URI;

const sortByDistance = (a, b, lat, long) => {
  const distanceA = geolib.getDistance(
    {
      latitude: a.location.coordinates[0],
      longitude: a.location.coordinates[1]
    },
    { latitude: lat, longitude: long }
  );
  const distanceB = geolib.getDistance(
    {
      latitude: b.location.coordinates[0],
      longitude: b.location.coordinates[1]
    },
    { latitude: lat, longitude: long }
  );

  return distanceA - distanceB;
};

let options = {
  shouldSort: true,
  threshold: 0.2,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: [
    {
      name: "contactName",
      weight: 0.35
    },
    {
      name: "companyName",
      weight: 0.3
    },
    {
      name: "tags",
      weight: 0.15
    },

    {
      name: "description",
      weight: 0.1
    },
    {
      name: "notes",
      weight: 0.1
    }
  ]
};

let tag_only = {
  shouldSort: true,
  threshold: 0.0,
  findAllMatches: true,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: [
    {
      name: "tags",
      weight: 1.0
    }
  ]
};

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

let addressToLatLong = async function(address) {
  const api_latlong = `${mapquestURI}address?key=${mapquestKey}&maxResults=5&outFormat=json&location=${address}`;

  const response = await fetch(api_latlong, {});
  const responseJson = await response.json();

  let lat = responseJson["results"][0]["locations"][0]["latLng"]["lat"];
  let lng = responseJson["results"][0]["locations"][0]["latLng"]["lng"];

  let state = responseJson["results"][0]["locations"][0]["adminArea3"];
  let region = stateToFederalRegion.find(obj => obj.State === state).Region;

  return { lat: lat, lng: lng, region: region };
};

let latlongToAddress = async function(lat, long) {
  let api_address = `${mapquestURI}reverse?key=${mapquestKey}&location=${lat},${long}&includeRoadMetadata=false&includeNearestIntersection=false`;

  const response = await fetch(api_address, {});
  const responseJson = await response.json();

  console.log(responseJson["results"][0]["locations"]);

  let street_address = responseJson["results"][0]["locations"][0]["street"];
  let city = responseJson["results"][0]["locations"][0]["adminArea5"];
  let state = responseJson["results"][0]["locations"][0]["adminArea3"];
  // country = responseJson["results"][0]["locations"][0]["adminArea1"];
  let postal_code = responseJson["results"][0]["locations"][0][
    "postalCode"
  ].substring(0, 5);
  let full_address = `${street_address} ${city} ${state} ${postal_code}`;
  return full_address;
};

module.exports = {
  sortByDistance,
  options,
  addressToLatLong,
  latlongToAddress,
  tag_only
};
