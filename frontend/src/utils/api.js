//TODO: Add API calls here!
require("node-fetch");
const host = "http://localhost:5000/api";

async function getEndpoint(endPoint, dataKey, additonal_headers = null) {
  try {
    let headers = { ...additonal_headers, "Content-Type": "application/json" };
    let response = await fetch(`${host}/${endPoint}`, {
      method: "GET",
      headers
    });
    let responseJson = await response.json();
    return dataKey === "" || responseJson.success === false
      ? responseJson.result
      : responseJson.result[dataKey];
  } catch (error) {
    console.error(error);
  }
}
/**
async function postEndpoint(endPoint, data, additonal_headers = null) {
  try {
    let headers = { ...additonal_headers, "Content-Type": "application/json" };
    let response = await fetch(`${host }/${ endPoint}`, {
      method: "POST",
      headers,
      body: JSON.stringify(data)
    });
    let responseJson = await response.json();
    return responseJson.result;
  } catch (error) {
    console.error(error);
  }
}

async function putEndpoint(endPoint, data, additonal_headers = null) {
  try {
    let headers = { ...additonal_headers, "Content-Type": "application/json" };
    let response = await fetch(`${host }/${ endPoint}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(data)
    });
    let responseJson = await response.json();
    return responseJson.result;
  } catch (error) {
    console.error(error);
  }
}

async function deleteEndpoint(endPoint) {
  try {
    let response = await fetch(`${host }/${ endPoint}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      }
    });
    let responseJson = await response.json();
    return responseJson.result;
  } catch (error) {
    console.error(error);
  }
}
*/

async function getSearchResults(keyword) {
  return await getEndpoint(`resources/filter?keyword=${keyword}`, "");
}

export default {
  getSearchResults
};
