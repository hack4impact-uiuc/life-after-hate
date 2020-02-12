const fetch = require("node-fetch");
const mongoose = require("mongoose");
const colors = require("colors");
const Resource = require("../models/Resource");
const fs = require("fs");

const JSON_LINK =
  "http://www.json-generator.com/api/json/get/bUvEqZDKPS?indent=2";

const FILE_PATH = "/var/www/app/assets/mock_data.json";

const createConnection = async () => {
  console.log(colors.green("Attempting to connect to Mongo..."));
  await mongoose.connect(process.env.DB_URI, {
    useUnifiedTopology: true,
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

const fetchFromFile = () => JSON.parse(fs.readFileSync(FILE_PATH, "utf-8"));

const addSampleResource = resource => {
  const newResource = new Resource(resource);
  return newResource.save();
};

const main = async () => {
  const args = process.argv.slice(2);
  const resourceCountLimit = args[0];
  const shouldUseLoremData = args[1] === "lorem";
  await createConnection();
  console.log(colors.green("Clearing all existing resource data..."));
  await Resource.deleteMany({});
  const data = shouldUseLoremData ? await fetchJson() : fetchFromFile();
  const resources = resourceCountLimit
    ? data.slice(0, parseInt(args[0])).map(addSampleResource)
    : data.map(addSampleResource);
  console.log(colors.green("Saving mock data in DB..."));
  try {
    await Promise.all(resources);
    console.log(
      colors.green(`Added ${resources.length} mock resources to DB!`)
    );
  } finally {
    await closeConnection();
  }
};

main();
