export const AUTH_UPDATE = "AUTH_UPDATE";
export const AUTH_PURGE = "AUTH_PURGE";

export const authUpdateAction = (payload) => ({
  type: AUTH_UPDATE,
  payload,
});

export const authPurgeAction = () => ({
  type: AUTH_PURGE,
});
