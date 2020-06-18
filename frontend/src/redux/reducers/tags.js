import { combineReducers } from "redux";

import {
  ADD_TAG,
  REMOVE_TAG,
  REPLACE_TAGS,
  REFRESH_TAG_LIST,
} from "../actions/tags";
import { CHANGE_PAGE } from "../actions/nav";

const INITIAL_STATE = [];

const selected = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case ADD_TAG:
      if (state.indexOf(action.payload) !== -1) {
        return state;
      }
      return [...state, action.payload];
    case REMOVE_TAG:
      if (state.indexOf(action.payload) !== -1) {
        const newState = [...state];
        const ind = state.indexOf(action.payload);
        newState.splice(ind, 1);
        return newState;
      }
      return state;
    case REPLACE_TAGS:
      return action.payload;
    case CHANGE_PAGE:
      return [...INITIAL_STATE];
    default:
      return state;
  }
};

const all = (state = [], action) => {
  switch (action.type) {
    case REFRESH_TAG_LIST:
      return action.payload;
    default:
      return state;
  }
};

export default combineReducers({ selected, all });
