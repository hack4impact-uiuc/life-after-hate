import { createSelector } from "reselect";
import { roleEnum, userFilterEnum } from "../../utils/enums";

export const userSelector = state => state.users.userList;
export const filterSelector = state => state.users.userFilterType;

export const filteredUserSelector = createSelector(
  [filterSelector, userSelector],
  (filter, users) => {
    console.log(users);
    if (!users) {
      return [];
    }
    if (!filter) {
      return users.filter(
        user => user.role === roleEnum.VOLUNTEER || user.role === roleEnum.ADMIN
      );
    }
    switch (filter) {
      case userFilterEnum.REJECTED:
        return users.filter(user => user.role === roleEnum.REJECTED);
      case userFilterEnum.PENDING:
        return users.filter(user => user.role === roleEnum.PENDING);
      default:
        return users.filter(
          user =>
            user.role === roleEnum.VOLUNTEER || user.role === roleEnum.ADMIN
        );
    }
  }
);
