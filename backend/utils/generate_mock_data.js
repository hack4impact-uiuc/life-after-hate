const fetch = require("node-fetch");
const mongoose = require("mongoose");
const colors = require("colors");
const Resource = require("../models/Resource");

const JSON_LINK =
  "http://www.json-generator.com/api/json/get/cfakcpbucy?indent=2";

const createConnection = async () => {
  console.log(colors.green("Attempting to connect to Mongo..."));
  await mongoose.connect(process.env.DB_URI, {
    useUnifiedTopology: false,
    useNewUrlParser: true
  });
};

const closeConnection = async () => {
  console.log(colors.green("Closing server connection..."));
  await mongoose.connection.close();
};

const fetchJson = async () => {
  console.log(colors.green("Fetching JSON..."));
  const response = await fetch(JSON_LINK);
  const dataJSON = await response.json();
  return dataJSON;
};

const addSampleResource = resource => {
  const newResource = new Resource(resource);
  return newResource.save();
};

const main = async () => {
  await createConnection();
  console.log(colors.green("Clearing all existing resource data..."));
  await Resource.deleteMany({});
  const data = await fetchJson();
  let resources = data.map(addSampleResource);
  console.log(colors.green("Saving mock data in DB..."));
  await Promise.all(resources);
  await closeConnection();
};

main();
