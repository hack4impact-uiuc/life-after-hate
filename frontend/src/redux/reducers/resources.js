import { UPDATE_RESOURCES } from "../actions/resources";
const resources = (state = [], action) => {
  switch (action.type) {
    case UPDATE_RESOURCES:
      return action.payload;
    default:
      return state;
  }
};

export default resources;
