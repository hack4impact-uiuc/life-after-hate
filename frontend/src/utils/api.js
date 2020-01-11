import {
  apiRequest,
  updateGlobalAuthState,
  purgeGlobalAuthState
} from "./apiHelpers";

async function getSearchResults(keyword, address, tag, radius = 500) {
  const endptStr = `resources/filter?`;
  let queryParamStr = "";

  if (address) {
    queryParamStr += `&radius=${radius}&address=${address}`;
  }
  if (keyword) {
    queryParamStr += `&keyword=${keyword}`;
  }
  if (tag) {
    queryParamStr += `&tag=${tag}`;
  }

  return (await apiRequest({
    endpoint: endptStr + queryParamStr.slice(1)
  })).result;
}

const refreshGlobalAuth = async () => {
  try {
    const res = await apiRequest({
      endpoint: `users/current`,
      withLoader: false,
      expectUnauthorizedResponse: true
    });
    const payload = res.result;
    updateGlobalAuthState(payload);
  } catch (e) {
    purgeGlobalAuthState();
  }
};

const logout = async () => {
  await apiRequest({ endpoint: `auth/logout` });
  purgeGlobalAuthState();
};

async function addResource(data) {
  return (await apiRequest({
    endpoint: `resources/`,
    method: "POST",
    data,
    notification: {
      successMessage: "Successfully added resource!",
      failureMessage: "Failed to add resource."
    }
  })).result;
}

async function editResource(data, id) {
  // Remove non-empty string fields from the object
  const filteredData = Object.keys(data).reduce((accum, key) => {
    if (data[key] !== "") {
      accum[key] = data[key];
    }
    return accum;
  }, {});
  return (await apiRequest({
    endpoint: `/resources/${id}`,
    method: "PUT",
    data: filteredData,
    notification: {
      successMessage: "Successfully edited resource!"
    }
  })).result;
}

async function getAllResources() {
  return (await apiRequest({ endpoint: `resources/` })).result;
}

export {
  refreshGlobalAuth,
  logout,
  getSearchResults,
  addResource,
  editResource,
  getAllResources
};
