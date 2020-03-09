import { UPDATE_USERS, CHANGE_USER_FILTER } from "../actions/users";
const users = (state = [], action) => {
  switch (action.type) {
    case UPDATE_USERS:
      return { ...state, userList: action.payload };
    case CHANGE_USER_FILTER:
      return { ...state, userFilterType: action.payload };
    default:
      return state;
  }
};

export default users;
