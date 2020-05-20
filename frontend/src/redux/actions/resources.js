export const UPDATE_RESOURCES = "UPDATE_RESOURCES";
export const UPDATE_RESOURCE = "UPDATE_RESOURCE";
export const CLEAR_RESOURCES = "CLEAR_RESOURCES";

export const updateResource = (payload) => ({
  type: UPDATE_RESOURCE,
  payload,
});

export const updateResources = (payload) => ({
  type: UPDATE_RESOURCES,
  payload,
});

export const clearResources = () => ({
  type: CLEAR_RESOURCES,
});
