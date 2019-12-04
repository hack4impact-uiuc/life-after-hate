import { combineReducers } from "redux";
import loading from "./loading";
import auth from "./auth";
export default combineReducers({
  isLoading: loading,
  auth
});
