import { apiRequest } from "./apiHelpers";

async function getSearchResults(keyword) {
  return (await apiRequest({
    endpoint: `resources/filter?keyword=${keyword}`
  })).result;
}

const isAuthenticated = async () => {
  try {
    // TODO: Handle this more gracefully than a try/catch
    await apiRequest({ endpoint: `users/current` });
    return true;
  } catch (e) {
    return false;
  }
};

const getProPic = async () => {
  const res = await apiRequest({ endpoint: `users/current` });
  return res.result.propicUrl;
};

const getFullName = async () => {
  const res = await apiRequest({ endpoint: `users/current` });
  return `${res.result.firstName} ${res.result.lastName}`;
};

const logout = async () => {
  const res = await apiRequest({ endpoint: `auth/logout` });
  return res.status === 200;
};

async function addResource(data) {
  return (await apiRequest({ endpoint: `resources/`, method: "POST", data }))
    .result;
}

async function editResource(data, id) {
  return (await apiRequest({
    endpoint: `resources/${id}`,
    method: "PUT",
    data
  })).result;
}

async function getAllResources() {
  return (await apiRequest({ endpoint: `resources/` })).result;
}

export {
  isAuthenticated,
  getProPic,
  getFullName,
  logout,
  getSearchResults,
  addResource,
  editResource,
  getAllResources
};
