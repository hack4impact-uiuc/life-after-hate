export const UPDATE_USERS = "UPDATE_USERS";
export const CHANGE_USER_FILTER = "CHANGE_USER_FILTER";

export const updateUsers = payload => ({ type: UPDATE_USERS, payload });
export const changeUserFilter = payload => ({
  type: CHANGE_USER_FILTER,
  payload
});
