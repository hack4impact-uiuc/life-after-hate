import {
  UPDATE_RESOURCES,
  UPDATE_RESOURCE,
  CLEAR_RESOURCES,
} from "../actions/resources";

const resources = (state = [], action) => {
  switch (action.type) {
    case UPDATE_RESOURCE:
      return state.map((resource) =>
        resource._id === action.payload._id ? action.payload : resource[0]
      );
    case UPDATE_RESOURCES:
      return action.payload;
    case CLEAR_RESOURCES:
      return [];
    default:
      return state;
  }
};

export default resources;
