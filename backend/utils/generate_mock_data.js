const fetch = require("node-fetch");
const mongoose = require("mongoose");
const colors = require("colors");
const IndividualResource = require("../models/IndividualResource");
const User = require("../models/User");
const fs = require("fs");

const JSON_LINK_RESOURCES =
  "http://www.json-generator.com/api/json/get/bUvEqZDKPS?indent=2";

const RESOURCE_FILE_PATH = "/var/www/app/assets/mock_data.json";
const USER_FILE_PATH = "/var/www/app/assets/mock_user_data.json";

const createConnection = async () => {
  console.log(colors.green("Attempting to connect to Mongo..."));
  await mongoose.connect(process.env.DB_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });
};

const closeConnection = async () => {
  console.log(colors.green("Closing server connection..."));
  await mongoose.connection.close();
};

const fetchJson = async (jsonLink) => {
  console.log(colors.green("Fetching JSON..."));
  const response = await fetch(jsonLink);
  const dataJSON = await response.json();
  return dataJSON;
};

const fetchFromFile = (path) => JSON.parse(fs.readFileSync(path, "utf-8"));

const addSampleResource = (resource) => {
  // Convert what was an group resource to an individual resource for sake of testing out the app
  // TODO: Mix up individual and group resources
  const newResource = new IndividualResource({
    ...resource,
    availability: "My availability is...[insert availability]",
    volunteerReason: "My reason for joining is...[insert reason]",
    skills: resource.description,
    volunteerRoles: "I am proficient in...[insert roles]",
    howDiscovered: "Discovered LAH through...[insert reason]",
  });
  return newResource.save();
};

const addSampleUser = (user) => {
  const newUser = new User(user);
  return newUser.save();
};

const main = async () => {
  const args = process.argv.slice(2);
  const resourceCountLimit = args[0];
  const shouldUseLoremData = args[1] === "lorem";
  await createConnection();
  try {
    console.log(colors.green("Clearing all existing resource data..."));
    await IndividualResource.deleteMany({});
    await User.deleteMany({});
    const data = shouldUseLoremData
      ? await fetchJson(JSON_LINK_RESOURCES)
      : fetchFromFile(RESOURCE_FILE_PATH);
    const userData = await fetchFromFile(USER_FILE_PATH);
    const resources = resourceCountLimit
      ? data.slice(0, parseInt(args[0])).map(addSampleResource)
      : data.map(addSampleResource);
    const users = userData.map(addSampleUser);
    console.log(colors.green("Saving mock data in DB..."));
    await Promise.all(resources);
    console.log(
      colors.green(`Added ${resources.length} mock resources to DB!`)
    );
    await Promise.all(users);
    console.log(colors.green(`Added ${users.length} mock users to DB!`));
  } finally {
    await closeConnection();
  }
};

main();
