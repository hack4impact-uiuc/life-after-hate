import axios from "axios";
import {
  accessDenied,
  apiError,
  API_REQUEST,
  apiSuccess,
} from "../actions/api";
import { startLoader, endLoader } from "../actions/loader";
import { toast } from "react-toastify";

const apiMiddleware = ({ dispatch }) => {
  let sessionGeneration = 0;
  let csrfRequest;
  return (next) => (action) => {
    if (["AUTH_PURGE", "API_ACCESS_DENIED"].includes(action.type)) {
      sessionGeneration++;
      csrfRequest = undefined;
    }
    next(action);
    if (action.type !== API_REQUEST) return;
    const generation = sessionGeneration;
    const {
      url,
      method,
      data,
      onSuccess,
      onFailure,
      headers,
      withLoader,
      notification,
      expectUnauthorizedResponse,
    } = action.payload;
    const stale = () => generation !== sessionGeneration;
    const dataOrParams = ["GET", "DELETE"].includes(method) ? "params" : "data";
    if (withLoader) dispatch(startLoader());
    const csrfUrl = new URL(url, window.location.origin);
    csrfUrl.pathname = "/api/auth/csrf";
    csrfUrl.search = "";
    if (!["GET", "HEAD", "OPTIONS"].includes(method) && !csrfRequest) {
      csrfRequest = axios
        .get(csrfUrl.href, { withCredentials: true, timeout: 10000 })
        .then(({ data }) => data.token)
        .catch((error) => {
          csrfRequest = undefined;
          throw error;
        });
    }
    const tokenRequest = ["GET", "HEAD", "OPTIONS"].includes(method)
      ? Promise.resolve(null)
      : csrfRequest;
    tokenRequest
      .then((token) => {
        if (stale()) throw new Error("Session changed");
        return axios.request({
          url,
          method,
          headers: {
            "Content-Type": "application/json",
            ...headers,
            ...(token ? { "X-CSRF-Token": token } : {}),
          },
          [dataOrParams]: data,
          withCredentials: true,
          timeout: 35000,
        });
      })
      .then(({ data }) => {
        // A response started before logout must never repopulate private state.
        if (stale()) throw new Error("Session changed");
        dispatch(apiSuccess(data));
        onSuccess(data);
        if (notification?.successMessage)
          toast.success(notification.successMessage);
      })
      .catch((error) => {
        if (stale()) {
          onFailure(new Error("Session changed"));
          return;
        }
        dispatch(apiError({ status: error.response?.status }));
        onFailure(error.response || error);
        if (["ECONNABORTED", "ETIMEDOUT"].includes(error.code))
          toast.error(
            "The request timed out. Refresh to check whether the change was saved before trying again.",
          );
        else if (notification?.failureMessage)
          toast.error(notification.failureMessage);
        if (error.response?.status === 403) csrfRequest = undefined;
        if (!expectUnauthorizedResponse && error.response?.status === 401) {
          dispatch(accessDenied(window.location.pathname));
          toast.info("Your session has ended. Please sign in again.");
        }
      })
      .finally(() => {
        if (withLoader && !stale()) dispatch(endLoader());
      });
  };
};
export default apiMiddleware;
