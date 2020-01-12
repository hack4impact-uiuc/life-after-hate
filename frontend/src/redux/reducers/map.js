import { UPDATE_MAP_CENTER } from "../actions/map";

const map = (state = {}, action) => {
  switch (action.type) {
    case UPDATE_MAP_CENTER:
      return { ...state, center: action.payload };
    default:
      return state;
  }
};

export default map;
