import { UPDATE_USERS, CHANGE_USER_FILTER } from "../actions/users";
import { userFilterEnum } from "../../utils/enums";
import { CHANGE_PAGE } from "../actions/nav";

const INITIAL_STATE = { userFilterType: userFilterEnum.ALL };

const users = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case UPDATE_USERS:
      return { ...state, userList: action.payload };
    case CHANGE_USER_FILTER:
      return { ...state, userFilterType: action.payload };
    case CHANGE_PAGE:
      return { ...INITIAL_STATE };
    default:
      return state;
  }
};

export default users;
