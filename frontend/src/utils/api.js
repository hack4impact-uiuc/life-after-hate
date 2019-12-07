import {
  apiRequest,
  updateGlobalAuthState,
  purgeGlobalAuthState
} from "./apiHelpers";

async function getSearchResults(keyword, address) {
  const defaultRadius = 500;
  let endptStr = `resources/filter?radius=${defaultRadius}`;
  if (keyword) {
    endptStr += `&keyword=${keyword}`;
  }
  if (address) {
    endptStr += `&address=${address}`;
  }
  return (await apiRequest({
    endpoint: endptStr
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
  return (await apiRequest({
    endpoint: `/resources/${id}`,
    method: "PUT",
    data,
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
