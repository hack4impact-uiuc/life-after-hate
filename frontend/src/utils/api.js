//TODO: Add API calls here!
require("node-fetch");
const API_URI = process.env.REACT_APP_API_URI
  ? process.env.REACT_APP_API_URI
  : "";

const isAuthenticated = async () => {
  const res = await fetch(`${API_URI}/api/users/current`, {
    credentials: "include"
  });
  return res.status === 200;
};

module.exports = { isAuthenticated, API_URI };
