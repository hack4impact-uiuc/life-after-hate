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

const getProPic = async () => {
  const res = await fetch(`${API_URI}/api/users/current`, {
    credentials: "include"
  });
  const res_json = await res.json();
  return res_json.result.propicUrl;
};

const getFullName = async () => {
  const res = await fetch(`${API_URI}/api/users/current`, {
    credentials: "include"
  });
  const res_json = await res.json();
  return `${res_json.result.firstName} ${res_json.result.lastName}`;
};

const logout = async () => {
  const res = await fetch(`${API_URI}/api/auth/logout`, {
    credentials: "include"
  });
  return res.status === 200;
};
export { isAuthenticated, getProPic, getFullName, logout, API_URI };
