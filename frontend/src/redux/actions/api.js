export const API_REQUEST = "API_REQUEST";
export const API_START = "API_START";
export const API_ERROR = "API_ERROR";
export const API_SUCCESS = "API_SUCCESS";
export const API_END = "API_END";
export const API_ACCESS_DENIED = "API_ACCESS_DENIED";

export const apiStart = url => ({
  type: API_START,
  url
});

export const apiEnd = url => ({
  type: API_END,
  url
});

export const apiError = error => ({
  type: API_ERROR,
  error
});

export const apiSuccess = payload => ({
  type: API_SUCCESS,
  payload
});

export const accessDenied = url => ({
  type: API_ACCESS_DENIED,
  url
});

export const apiAction = payload => ({
  type: API_REQUEST,
  payload
});
