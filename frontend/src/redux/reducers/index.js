import { combineReducers } from "redux";
import loading from "./loading";
import auth from "./auth";
import resources from "./resources";
import modal from "./modal";
import map from "./map";
import users from "./users";
import tags from "./tags";
import search from "./search";
import sort from "./sort";

const combined = combineReducers({
  isLoading: loading,
  auth,
  resources,
  modal,
  map,
  users,
  tags,
  search,
  sort,
});

export default function rootReducer(state, action) {
  if (["AUTH_PURGE", "API_ACCESS_DENIED"].includes(action.type))
    state = undefined;
  return combined(state, action);
}
