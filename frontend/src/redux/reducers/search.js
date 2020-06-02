import { UPDATE_SEARCH_PARAMS, RESET_SEARCH } from "../actions/search";

const search = (state = {}, action) => {
  switch (action.type) {
    case UPDATE_SEARCH_PARAMS:
      return action.payload;
    case RESET_SEARCH:
      return {};
    default:
      return state;
  }
};

export default search;
