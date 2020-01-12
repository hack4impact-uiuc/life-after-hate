import {
  UPDATE_MAP_CENTER,
  SELECT_MAP_RESOURCE,
  CLEAR_MAP_RESOURCE
} from "../actions/map";
const R = require("ramda");

const map = (state = {}, action) => {
  switch (action.type) {
    case UPDATE_MAP_CENTER:
      return { ...state, center: action.payload };
    case SELECT_MAP_RESOURCE:
      return { ...state, selectedId: action.payload };
    case CLEAR_MAP_RESOURCE:
      return R.omit(["selectedId"], state);
    default:
      return state;
  }
};

export default map;
