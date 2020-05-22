export const REPLACE_ALL_RESOURCES = "REPLACE_ALL_RESOURCES";
export const UPDATE_RESOURCE = "UPDATE_RESOURCE";
export const ADD_RESOURCE = "ADD_RESOURCE";
export const CLEAR_RESOURCES = "CLEAR_RESOURCES";
export const DELETE_RESOURCE = "DELETE_RESOURCE";

export const addResource = (payload) => ({
  type: ADD_RESOURCE,
  payload,
});

export const updateResource = (payload) => ({
  type: UPDATE_RESOURCE,
  payload,
});

export const deleteResource = (payload) => ({
  type: DELETE_RESOURCE,
  payload,
});

export const replaceAllResources = (payload) => ({
  type: REPLACE_ALL_RESOURCES,
  payload,
});

export const clearResources = () => ({
  type: CLEAR_RESOURCES,
});
