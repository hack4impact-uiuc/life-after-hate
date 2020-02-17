import { combineReducers } from "redux";
import loading from "./loading";
import auth from "./auth";
import resources from "./resources";
import modal from "./modal";
import map from "./map";
import users from "./users";

export default combineReducers({
  isLoading: loading,
  auth,
  resources,
  modal,
  map,
  users
});
