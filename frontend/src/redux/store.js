import logger from "redux-logger";
import { createStore, applyMiddleware, compose } from "redux";
import rootReducer from "./reducers";
import apiMiddleware from "./middleware/api_middleware";

// Add Redux DevTools support
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(logger, apiMiddleware))
);

export default store;
