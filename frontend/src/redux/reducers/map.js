import {
  UPDATE_MAP_CENTER,
  SELECT_MAP_RESOURCE,
  CLEAR_MAP_RESOURCE,
  CLEAR_MAP_CENTER,
  UPDATE_SEARCH_LOCATION,
  UPDATE_SEARCH_QUERY,
} from "../actions/map";
import {
  REPLACE_ALL_RESOURCES,
  UPDATE_RESOURCE,
  DELETE_RESOURCE,
  CLEAR_RESOURCES,
} from "../actions/resources";
const R = require("ramda");

const map = (state = { search: { location: "", query: "" } }, action) => {
  switch (action.type) {
    case UPDATE_MAP_CENTER:
      return { ...state, center: action.payload };
    case CLEAR_MAP_CENTER:
      return R.omit(["center"], state);
    case SELECT_MAP_RESOURCE:
      return { ...state, selectedId: action.payload };
    case CLEAR_MAP_RESOURCE:
    case CLEAR_RESOURCES:
    case DELETE_RESOURCE:
    case UPDATE_RESOURCE:
      return R.omit(["selectedId"], state);
    case REPLACE_ALL_RESOURCES:
      // Check to see if the currently selected resource
      // is in the new resource list, and if not, remove it
      return R.find(R.propEq("_id", state.selectedId))(action.payload)
        ? state
        : R.omit(["selectedId"], state);
    case UPDATE_SEARCH_LOCATION:
      return {
        ...state,
        search: { ...state.search, location: action.payload },
      };
    case UPDATE_SEARCH_QUERY:
      return { ...state, search: { ...state.search, query: action.payload } };
    default:
      return state;
  }
};

export default map;
