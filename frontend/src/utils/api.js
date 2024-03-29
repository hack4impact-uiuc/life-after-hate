import {
  apiRequest,
  updateGlobalAuthState,
  purgeGlobalAuthState,
  toQueryString,
} from "./apiHelpers";
import {
  replaceAllResources,
  updateResource,
  addResource as insertResource,
  deleteResource as removeResource,
} from "../redux/actions/resources";
import { updateMapCenter } from "../redux/actions/map";
import { updateSearchParams } from "../redux/actions/search";
import { updateUsers } from "../redux/actions/users";
import { addTag, removeTag, refreshTagList } from "../redux/actions/tags";
import store from "../redux/store";

async function getSearchResults(keyword, address, tag, radius = 500) {
  const endptStr = `resources/filter?`;
  const arglist = { keyword, address, tag, radius };
  return (
    await apiRequest({
      endpoint: endptStr + toQueryString(arglist),
      notification: {
        failureMessage: "Failed to execute search.",
      },
    })
  ).result;
}

const refreshGlobalAuth = async () => {
  try {
    const res = await apiRequest({
      endpoint: `users/current`,
      withLoader: false,
      expectUnauthorizedResponse: true,
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

async function getResource(id) {
  return (
    await apiRequest({
      endpoint: `resources/${id}`,
      method: "GET",
    })
  ).result;
}

async function getTags() {
  const tags = (
    await apiRequest({
      endpoint: `resources/tags`,
      withLoader: false,
      method: "GET",
    })
  ).result;
  store.dispatch(refreshTagList(tags));
}

async function addResource(data) {
  return await apiRequest({
    endpoint: `resources/`,
    method: "POST",
    data,
    notification: {
      successMessage: "Successfully added resource!",
      failureMessage: "Failed to add resource.",
    },
  });
}

async function editResource(data, id) {
  return (
    await apiRequest({
      endpoint: `/resources/${id}`,
      method: "PUT",
      data,
      notification: {
        successMessage: "Successfully edited resource!",
        failureMessage: "Failed to edit resource.",
      },
    })
  ).result;
}

async function deleteResource(id) {
  return (
    await apiRequest({
      endpoint: `resources/${id}`,
      method: "DELETE",
      notification: {
        successMessage: "Successfully deleted resource!",
        failureMessage: "Failed to delete resource.",
      },
    })
  ).result;
}

async function editUser(data, id) {
  return (
    await apiRequest({
      endpoint: `/users/${id}`,
      method: "PATCH",
      data: data,
      notification: {
        successMessage: "Successfully edited user!",
        failureMessage: "Failed to edit user.",
      },
    })
  ).result;
}

// Redux dispatches for resources and users
async function refreshAllUsers() {
  const userList = (await apiRequest({ endpoint: `users/` })).result;
  store.dispatch(updateUsers(userList));
}

async function editAndRefreshUser(data, id) {
  await editUser(data, id);
  await refreshAllUsers();
}

async function editAndRefreshResource(data, id) {
  await editResource(data, id);
  const newResourceData = await getResource(id);
  store.dispatch(updateResource(newResourceData));
}

async function addAndRefreshResource(data) {
  const { id } = await addResource(data);
  const processedData = await getResource(id);
  await store.dispatch(insertResource(processedData));
}

async function deleteAndRefreshResource(id) {
  await deleteResource(id);
  store.dispatch(removeResource({ _id: id }));
}

function addFilterTag(data) {
  store.dispatch(addTag(data));
}

function removeFilterTag(data) {
  store.dispatch(removeTag(data));
}

async function filterAndRefreshResource(keyword, address, tag, radius) {
  store.dispatch(updateSearchParams({ keyword, address, tag }));
  const results = await getSearchResults(keyword, address, tag, radius);
  store.dispatch(replaceAllResources(results.resources));
  if (results.center && results.center[0]) {
    store.dispatch(updateMapCenter(results.center));
  } else {
    store.dispatch(updateMapCenter(null));
  }
  return results;
}

export {
  refreshGlobalAuth,
  logout,
  addFilterTag,
  removeFilterTag,
  getTags,
  filterAndRefreshResource,
  addAndRefreshResource,
  editAndRefreshResource,
  deleteAndRefreshResource,
  refreshAllUsers,
  editAndRefreshUser,
  editUser,
};
