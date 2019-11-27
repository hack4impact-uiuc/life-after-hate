import { combineReducers } from "redux";
import loading from "./loading";

export default combineReducers({
  isLoading: loading
});
