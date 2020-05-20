export const UPDATE_SEARCH_PARAMS = "UPDATE_SEARCH_PARAMS";
export const RESET_SEARCH = "RESET_SEARCH";

export const updateSearchParams = (payload) => ({
  type: UPDATE_SEARCH_PARAMS,
  payload,
});

export const resetSearch = () => ({
  type: RESET_SEARCH,
});
