import { UPDATE_SEARCH_PARAMS, RESET_SEARCH } from "../actions/search";
import { CHANGE_PAGE } from "../actions/nav";

const INITIAL_STATE = {};

const search = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case UPDATE_SEARCH_PARAMS:
      return action.payload;
    case CHANGE_PAGE:
    case RESET_SEARCH:
      return { ...INITIAL_STATE };
    default:
      return state;
  }
};

export default search;
