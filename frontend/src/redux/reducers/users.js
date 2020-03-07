import { UPDATE_USERS } from "../actions/users";
const users = (state = [], action) => {
  switch (action.type) {
    case UPDATE_USERS:
      return action.payload;
    default:
      return state;
  }
};

export default users;
