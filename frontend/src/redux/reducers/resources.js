import {
  ADD_RESOURCE,
  REPLACE_ALL_RESOURCES,
  UPDATE_RESOURCE,
  CLEAR_RESOURCES,
  DELETE_RESOURCE,
} from "../actions/resources";
import { CHANGE_PAGE } from "../actions/nav";

const INITIAL_STATE = [];

const resources = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case ADD_RESOURCE:
      return [action.payload, ...state];
    case UPDATE_RESOURCE:
      return state.map((resource) =>
        resource._id === action.payload._id ? action.payload : resource
      );
    case DELETE_RESOURCE:
      return state.filter((item) => item._id !== action.payload._id);
    case REPLACE_ALL_RESOURCES:
      return action.payload;
    case CHANGE_PAGE:
    case CLEAR_RESOURCES:
      return [...INITIAL_STATE];
    default:
      return state;
  }
};

export default resources;
