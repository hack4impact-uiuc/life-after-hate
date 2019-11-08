require("node-fetch");

const API_URI = process.env.REACT_APP_API_URI
  ? process.env.REACT_APP_API_URI
  : "";

const host = `${API_URI}/api`;

async function getEndPoint(endPoint) {
  try {
    let response = await fetch(`${host}/${endPoint}`, {
      method: "GET"
    });
    let responseJson = await response.json();
    return responseJson.result;
  } catch (error) {
    console.error(error);
  }
}
/**
async function postEndPoint(endPoint, data, additonal_headers = null) {
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

async function putEndPoint(endPoint, data, additonal_headers = null) {
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

async function deleteEndPoint(endPoint) {
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
  return await getEndPoint(`resources/filter?keyword=${keyword}`, "");
}

export default {
  getSearchResults
};
