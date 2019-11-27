export const API_START = "API_START";
export const API_END = "API_END";
export const API_ERROR = "API_ERROR";
export const API_ACCESS_DENIED = "API_ACCESS_DENIED";

export const apiStart = label => ({
  type: API_START,
  payload: label
});

export const apiEnd = label => ({
  type: API_END,
  payload: label
});

export const apiError = error => ({
  type: API_ERROR,
  error
});

export const accessDenied = url => ({
  type: API_ACCESS_DENIED,
  url
});
