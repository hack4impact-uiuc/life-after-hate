import axios from "axios";
import {
  accessDenied,
  apiError,
  API_REQUEST,
  apiSuccess
} from "../actions/api";
import { startLoader, endLoader } from "../actions/loader";
import { toast } from "react-toastify";

const apiMiddleware = ({ dispatch }) => next => action => {
  // Call the next method in the middleware
  next(action);

  if (action.type !== API_REQUEST) {
    return;
  }

  console.log("HERE!");
  console.log(url);
  const {
    url,
    method,
    data,
    onSuccess,
    onFailure,
    headers,
    withLoader,
    notification,
    expectUnauthorizedResponse
  } = action.payload;

  // Depending on the type of request, there might be a "data" or "params" field.
  const dataOrParams = ["GET", "DELETE"].includes(method) ? "params" : "data";

  // Headers set for all requests
  axios.defaults.baseURL = process.env.REACT_APP_BASE_URL || "";
  axios.defaults.headers.common["Content-Type"] = "application/json";

  if (withLoader) {
    dispatch(startLoader());
  }

  axios
    .request({
      url,
      method,
      headers,
      [dataOrParams]: data,
      withCredentials: true
    })
    .then(({ data }) => {
      dispatch(apiSuccess(data));
      // Request was successful, so call the callback for success
      onSuccess(data);
      if (notification && notification.successMessage) {
        toast.success(notification.successMessage);
      }
    })
    .catch(error => {
      dispatch(apiError(error.response));
      onFailure(error.response);
      if (notification && notification.failureMessage) {
        toast.error(notification.failureMessage);
      }
      if (
        expectUnauthorizedResponse !== true &&
        error.response &&
        error.response.status === 401
      ) {
        dispatch(accessDenied(window.location.pathname));
        toast.info("You have been signed out due to an unauthorized request.");
      }
    })
    .finally(() => {
      if (withLoader) {
        dispatch(endLoader());
      }
    });
};

export default apiMiddleware;
