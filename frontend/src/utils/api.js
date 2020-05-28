import {
  apiRequest,
  updateGlobalAuthState,
  purgeGlobalAuthState,
  toQueryString,
} from "./apiHelpers";
import { updateResources } from "../redux/actions/resources";
import { updateMapCenter } from "../redux/actions/map";
import { updateUsers } from "../redux/actions/users";
import { addTag, removeTag } from "../redux/actions/tags";
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

function addFilterTag(data) {
  store.dispatch(addTag(data));
}

function removeFilterTag(data) {
  store.dispatch(removeTag(data));
}

async function addResource(data) {
  return (
    await apiRequest({
      endpoint: `resources/`,
      method: "POST",
      data,
      notification: {
        successMessage: "Successfully added resource!",
        failureMessage: "Failed to add resource.",
      },
    })
  ).result;
}

async function editResource(data, id) {
  // Remove non-empty string fields from the object
  const filteredData = Object.keys(data).reduce((accum, key) => {
    if (data[key] !== "") {
      accum[key] = data[key];
    }
    return accum;
  }, {});
  return (
    await apiRequest({
      endpoint: `/resources/${id}`,
      method: "PUT",
      data: filteredData,
      notification: {
        successMessage: "Successfully edited resource!",
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

function spiderResources(resourceList) {
  resourceList.forEach((resource) => {
    // already has spidered coordinates, so continue
    if (resource.location.spiderCoordinates) {
      return;
    }
    const resourcePos = resource.location.coordinates;
    const matchLoc = resourceList.filter(
      (r) =>
        r.location.coordinates[0] === resourcePos[0] &&
        r.location.coordinates[1] === resourcePos[1]
    );
    // resources at same location
    if (matchLoc.length > 0) {
      console.log("same loc resources", matchLoc);
      const numPoints = matchLoc.length;
      const distance = 0.005; // radius of circle
      let curAngle = 0;
      const addAngle = (Math.PI * 2) / numPoints; // distribute new locations around a circle
      matchLoc.forEach((matchResource) => {
        const matchResourceLoc = matchResource.location.coordinates;
        const newLoc0 = matchResourceLoc[0] + Math.cos(curAngle) * distance;
        const newLoc1 = matchResourceLoc[1] + Math.sin(curAngle) * distance;
        matchResource.location.spiderCoordinates = [newLoc0, newLoc1];
        curAngle = curAngle + addAngle;
      });
    }
  });
  return resourceList;
}

async function refreshAllResources() {
  let resourceList = (await apiRequest({ endpoint: `resources/` })).result;
  resourceList = spiderResources(resourceList);
  store.dispatch(updateResources(resourceList));
}

async function refreshAllUsers() {
  const userList = (await apiRequest({ endpoint: `users/` })).result;
  store.dispatch(updateUsers(userList));
}

async function editAndRefreshUser(data, id) {
  await editUser(data, id);
  await refreshAllUsers();
}

async function editUser(data, id) {
  return (
    await apiRequest({
      endpoint: `/users/${id}`,
      method: "PATCH",
      data: data,
      notification: {
        successMessage: "Successfully edited user!",
      },
    })
  ).result;
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
  const resourceList = spiderResources(results.resources);
  store.dispatch(updateResources(resourceList));
  if (results.center) {
    store.dispatch(updateMapCenter(results.center));
  }
  return results;
}
export {
  refreshGlobalAuth,
  logout,
  addFilterTag,
  removeFilterTag,
  filterAndRefreshResource,
  addAndRefreshResource,
  editAndRefreshResource,
  deleteAndRefreshResource,
  refreshAllResources,
  refreshAllUsers,
  editAndRefreshUser,
  editUser,
};
