//TODO: Add API calls here!
require("node-fetch");
const API_URI = process.env.REACT_APP_API_URI
  ? process.env.REACT_APP_API_URI
  : "";

module.exports = { API_URI };
