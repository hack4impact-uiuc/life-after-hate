import axios from "axios";
import {
  accessDenied,
  apiError,
  apiStart,
  apiEnd,
  API_REQUEST,
  apiSuccess
} from "../actions/api";
import { startLoader, endLoader } from "../actions/loader";
import { toast } from "react-toastify";
const apiMiddleware = ({ dispatch }) => next => action => {
  next(action);

  if (action.type !== API_REQUEST) {
    return;
  }

  const {
    url,
    method,
    data,
    onSuccess,
    onFailure,
    headers,
    withLoader,
    notification
  } = action.payload;

  const dataOrParams = ["GET", "DELETE"].includes(method) ? "params" : "data";

  // axios default configs
  axios.defaults.baseURL = process.env.REACT_APP_BASE_URL || "";
  axios.defaults.headers.common["Content-Type"] = "application/json";

  dispatch(apiStart(url));
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
      onSuccess(data);
      if (notification) {
        toast.success(notification.successMessage);
      }
    })
    .catch(error => {
      dispatch(apiError(error.response));
      onFailure(error.response);
      if (notification) {
        toast.error(notification.failureMessage);
      }
      if (error.response && error.response.status === 401) {
        dispatch(accessDenied(window.location.pathname));
      }
    })
    .finally(() => {
      dispatch(apiEnd(url));
      if (withLoader) {
        dispatch(endLoader());
      }
    });
};

export default apiMiddleware;
