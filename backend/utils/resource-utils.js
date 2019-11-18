const geolib = require("geolib");

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

const options = {
  shouldSort: true,
  threshold: 0.2,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: [
    {
      name: "tags",
      weight: 0.5
    },
    {
      name: "companyName",
      weight: 0.3
    },
    {
      name: "description",
      weight: 0.1
    },
    {
      name: "address",
      weight: 0.1
    }
  ]
};

module.exports = {
  sortByDistance,
  options
};
