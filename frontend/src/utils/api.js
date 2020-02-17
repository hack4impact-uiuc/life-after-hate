import {
  apiRequest,
  updateGlobalAuthState,
  purgeGlobalAuthState,
  toQueryString
} from "./apiHelpers";
import { updateResources } from "../redux/actions/resources";
import { updateMapCenter } from "../redux/actions/map";
import { updateUsers } from "../redux/actions/users";
import store from "../redux/store";

async function getSearchResults(keyword, address, tag, radius = 500) {
  const endptStr = `resources/filter?`;
  const arglist = { keyword, address, tag, radius };
  return (await apiRequest({
    endpoint: endptStr + toQueryString(arglist)
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

async function deleteResource(id) {
  return (await apiRequest({
    endpoint: `resources/${id}`,
    method: "DELETE",
    notification: {
      successMessage: "Successfully deleted resource!",
      failureMessage: "Failed to delete resource."
    }
  })).result;
}

async function refreshAllResources() {
  const resourceList = (await apiRequest({ endpoint: `resources/` })).result;
  store.dispatch(updateResources(resourceList));
}

async function refreshAllUsers() {
  const userList = (await apiRequest({ endpoint: `users/` })).result;
  store.dispatch(updateUsers(userList));
}

async function editAndRefreshResource(data, id) {
  await editResource(data, id);
  await refreshAllResources();
}

async function addAndRefreshResource(data) {
  await addResource(data);
  await refreshAllResources();
}

async function deleteAndRefreshResource(id) {
  await deleteResource(id);
  await refreshAllResources();
}

async function filterAndRefreshResource(keyword, address, tag, radius) {
  const results = await getSearchResults(keyword, address, tag, radius);
  store.dispatch(updateResources(results.resources));
  if (results.center) {
    store.dispatch(updateMapCenter(results.center));
  }
  return results;
}
export {
  refreshGlobalAuth,
  logout,
  filterAndRefreshResource,
  addAndRefreshResource,
  editAndRefreshResource,
  deleteAndRefreshResource,
  refreshAllResources,
  refreshAllUsers
};
