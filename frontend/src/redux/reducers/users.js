import { UPDATE_USERS, CHANGE_USER_FILTER } from "../actions/users";
import { userFilterEnum } from "../../utils/enums";
const users = (state = { userFilterType: userFilterEnum.ALL }, action) => {
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
