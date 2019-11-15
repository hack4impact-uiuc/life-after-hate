require("node-fetch");

const API_URI = process.env.REACT_APP_API_URI
  ? process.env.REACT_APP_API_URI
  : "";

const host = `${API_URI}/api`;

async function fetchWithError(
  endPoint,
  method,
  data = null,
  additional_headers = null
) {
  let isGetOrDelete = method === "GET" || method === "DELETE";
  let response = await fetch(`${host}/${endPoint}`, {
    method,
    headers: isGetOrDelete
      ? {}
      : { ...additional_headers, "Content-Type": "application/json" },
    body: isGetOrDelete ? null : JSON.stringify(data)
  });
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  let responseJson = await response.json();
  return responseJson.result;
}

async function getEndPoint(endPoint) {
  let responseJsonResult = await fetchWithError(endPoint, "GET");
  return responseJsonResult;
}

/**
async function postEndPoint(endPoint, data, additonal_headers = null) {
  return await fetchWithError(endPoint, "POST", data, additional_headers = additional_headers);
}

async function putEndPoint(endPoint, data, additonal_headers = null) {
  return await fetchWithError(endPoint, "PUT", data, additional_headers = additional_headers);
}

async function deleteEndPoint(endPoint) {
    return await fetchWithError(endPoint, "DELETE");
}
*/

async function getSearchResults(keyword) {
  return await getEndPoint(`resources/filter?keyword=${keyword}`, "");
}

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
export { isAuthenticated, getProPic, getFullName, logout, API_URI, getSearchResults };
