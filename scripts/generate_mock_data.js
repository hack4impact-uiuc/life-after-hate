const fetch = require("node-fetch");
const mongoose = require("mongoose");

const Resource = require("../backend/models/Resource");

const DB_URI = "mongodb://rxun:cheezits28@ds335668.mlab.com:35668/lah";
const JSON_LINK =
  "http://www.json-generator.com/api/json/get/cecKjNYROW?indent=2";

const createConnection = async () => {
  await mongoose.connect(DB_URI, {
    useUnifiedTopology: false,
    useNewUrlParser: true
  });
};

const closeConnection = async () => {
  await mongoose.connection.close();
};

const fetchJson = async () => {
  const response = await fetch(JSON_LINK);
  const dataJSON = await response.json();
  return dataJSON;
};

const addSampleResource = async resource => {
  const newResource = new Resource(resource);
  await newResource.save();
};

const main = async () => {
  await createConnection();
  const dataJSON = await fetchJson();
  for (var i = 0; i < dataJSON.length; i++) {
    await addSampleResource(dataJSON[i]);
  }
  await closeConnection();
};

main();
