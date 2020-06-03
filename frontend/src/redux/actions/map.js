export const UPDATE_MAP_CENTER = "UPDATE_MAP_CENTER";
export const CLEAR_MAP_CENTER = "CLEAR_MAP_CENTER";
export const SELECT_MAP_RESOURCE = "SELECT_MAP_RESOURCE";
export const CLEAR_MAP_RESOURCE = "CLEAR_MAP_RESOURCE";

export const UPDATE_SEARCH_LOCATION = "UPDATE_SEARCH_LOCATION";
export const UPDATE_SEARCH_QUERY = "UPDATE_SEARCH_QUERY";

export const updateMapCenter = (payload) => ({
  type: UPDATE_MAP_CENTER,
  payload,
});

export const clearMapCenter = (payload) => ({
  type: CLEAR_MAP_CENTER,
  payload,
});

export const selectMapResource = (payload) => ({
  type: SELECT_MAP_RESOURCE,
  payload,
});

export const clearMapResource = () => ({
  type: CLEAR_MAP_RESOURCE,
});

export const updateSearchLocation = (payload) => ({
  type: UPDATE_SEARCH_LOCATION,
  payload,
});

export const updateSearchQuery = (payload) => ({
  type: UPDATE_SEARCH_QUERY,
  payload,
});
