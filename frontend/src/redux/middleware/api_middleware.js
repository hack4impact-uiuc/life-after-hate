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
    withLoader
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
    })
    .catch(error => {
      dispatch(apiError(error.response));
      onFailure(error.response);
      if (error.response && error.response.status === 401) {
        dispatch(accessDenied(window.location.pathname));
      }
    })
    .finally(() => {
      dispatch(apiEnd(url));
      dispatch(endLoader());
    });
};

export default apiMiddleware;
