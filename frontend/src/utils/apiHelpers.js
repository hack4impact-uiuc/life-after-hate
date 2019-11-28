import store from "../redux/store";
import { apiAction } from "../redux/actions/api";

export const API_URI = process.env.REACT_APP_API_URI
  ? process.env.REACT_APP_API_URI
  : "/api/";

export const apiRequest = ({
  endpoint = "",
  method = "GET",
  data = null,
  withLoader = true,
  notification
}) =>
  new Promise((resolve, reject) => {
    store.dispatch(
      apiAction({
        url: API_URI.concat(endpoint),
        onSuccess: resolve,
        onFailure: reject,
        method,
        withLoader,
        data,
        notification
      })
    );
  });
