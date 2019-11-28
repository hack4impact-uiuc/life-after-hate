import { AUTH_UPDATE, AUTH_PURGE } from "../actions/auth";

const auth = (
  state = { authenticated: false, isFetchingAuth: true },
  action
) => {
  switch (action.type) {
    case AUTH_UPDATE:
      return { ...action.payload, isFetchingAuth: false, authenticated: true };
    case AUTH_PURGE:
      return { isFetchingAuth: false, authenticated: false };
    default:
      return state;
  }
};

export default auth;
