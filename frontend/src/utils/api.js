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
  let headers = {};
  if (!(method === "GET" || method === "DELETE")) {
    headers = { ...additional_headers, "Content-Type": "application/json" };
  }
  let response = await fetch(`${host}/${endPoint}`, {
    method,
    headers,
    body: !method === "GET" || (method === "DELETE" && JSON.stringify(data))
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

export { getSearchResults };
