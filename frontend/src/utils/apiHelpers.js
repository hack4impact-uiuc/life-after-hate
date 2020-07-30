import store from "../redux/store";
import { apiAction } from "../redux/actions/api";
import { authUpdateAction, authPurgeAction } from "../redux/actions/auth";
import urljoin from "url-join";
import { toast } from "react-toastify";
const R = require("ramda");

const API_URI = process.env.REACT_APP_API_URI
  ? process.env.REACT_APP_API_URI
  : "/api/";

console.log(`API URI is ${API_URI}`);

// Map an object with key/value pairs to a query string of the form key=value&key2=value2
export const toQueryString = R.pipe(
  Object.entries,
  R.filter(([, v]) => v),
  R.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`),
  R.join("&")
);

export const getURLForEndpoint = (endpoint) => urljoin(API_URI, endpoint);
/**
 *
 * @param {String} endpoint - A string representing the URI of the endpoint (just the end part)
 * @param {String} method - Either "GET", "POST", "PUT", or "DELETE"
 * @param {Object} data - The body of the request
 * @param {Boolean} withLoader - A switch on whether to show the loading bar during the request
 * @param {Object} notification - An object containing a message for failure and success
 * @param {Boolean} expectUnauthorizedResponse - Whether to dispatch an ACCESS DENIED action and notify the user the request was unauthorized
 *
 */
export const apiRequest = ({
  endpoint = "",
  method = "GET",
  data = null,
  withLoader = true,
  notification,
  expectUnauthorizedResponse = false,
}) =>
  new Promise((resolve, reject) => {
    store.dispatch(
      apiAction({
        url: getURLForEndpoint(endpoint),
        onSuccess: resolve,
        onFailure: reject,
        method,
        withLoader,
        data,
        notification,
        expectUnauthorizedResponse,
      })
    );
  });

export const updateGlobalAuthState = (payload) => {
  store.dispatch(authUpdateAction(payload));
  if (process.env.NODE_ENV === "development") {
    toast.info(`Logged in with ${payload.role} role!`, {
      autoClose: 2000,
    });
  }
};

export const purgeGlobalAuthState = () => {
  store.dispatch(authPurgeAction());
};
