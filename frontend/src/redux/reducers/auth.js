import { AUTH_UPDATE, AUTH_PURGE } from "../actions/auth";
import { API_ACCESS_DENIED } from "../actions/api";

const INITIAL_STATE = { authenticated: false, isFetchingAuth: true };

const auth = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case AUTH_UPDATE:
      return { ...action.payload, isFetchingAuth: false, authenticated: true };
    case AUTH_PURGE:
    case API_ACCESS_DENIED:
      return { isFetchingAuth: false, authenticated: false };
    default:
      return state;
  }
};

export default auth;
