import { createStore, applyMiddleware } from "redux";
import rootReducer from "./reducers";
import apiMiddleware from "./middleware/api_middleware";

// Resource and identity data must not be sent to session replay or console logs.
const store = createStore(
  rootReducer,
  applyMiddleware(apiMiddleware)
);

export default store;
