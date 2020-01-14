import {
  UPDATE_MAP_CENTER,
  SELECT_MAP_RESOURCE,
  CLEAR_MAP_RESOURCE
} from "../actions/map";
import { UPDATE_RESOURCES } from "../actions/resources";
const R = require("ramda");

const map = (state = {}, action) => {
  switch (action.type) {
    case UPDATE_MAP_CENTER:
      return { ...state, center: action.payload };
    case SELECT_MAP_RESOURCE:
      return { ...state, selectedId: action.payload };
    case CLEAR_MAP_RESOURCE:
      return R.omit(["selectedId"], state);
    case UPDATE_RESOURCES:
      // Check to see if the currently selected resource
      // is in the new resource list, and if not, remove it
      return R.find(R.propEq("_id", state.selectedId))(action.payload)
        ? state
        : R.omit(["selectedId"], state);
    default:
      return state;
  }
};

export default map;
