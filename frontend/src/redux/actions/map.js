export const UPDATE_MAP_CENTER = "UPDATE_MAP_CENTER";
export const SELECT_MAP_RESOURCE = "SELECT_MAP_RESOURCE";
export const CLEAR_MAP_RESOURCE = "CLEAR_MAP_RESOURCE";

export const updateMapCenter = (payload) => ({
  type: UPDATE_MAP_CENTER,
  payload,
});

export const selectMapResource = (payload) => ({
  type: SELECT_MAP_RESOURCE,
  payload,
});

export const clearMapResource = () => ({
  type: CLEAR_MAP_RESOURCE,
});
