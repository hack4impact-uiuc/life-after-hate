/* eslint-disable jsx-a11y/no-onchange */
import React, { useEffect } from "react";
import { refreshAllUsers } from "../../utils/api";
import { connect } from "react-redux";
import {
  filteredUserSelector,
  filterSelector,
} from "../../redux/selectors/users";
import { changeUserFilter } from "../../redux/actions/users";
import { userFilterEnum } from "../../utils/enums";
import UserCard from "./UserCard";
import "./styles.scss";

const UserManager = ({ users, filter, changeUserFilter }) => {
  useEffect(() => {
    document.title = "Account Management - Life After Hate";
    refreshAllUsers();
  }, []);

  const renderCards = (user) => <UserCard key={user.id} user={user} />;

  const onCategoryChange = (event) => {
    console.log("filter changed");
    changeUserFilter(event.target.value);
  };

  return (
    <div className="user-directory">
      <div className="container-fluid">
        <div className="manager-header row">
          <div className="col">
            <h1>User Directory</h1>
          </div>
          <select
            onChange={onCategoryChange}
            defaultValue={filter}
            data-cy="user-filter"
          >
            <option value={userFilterEnum.ALL}>All Users</option>
            <option value={userFilterEnum.ACTIVE}>Active Users</option>
            <option value={userFilterEnum.PENDING}>Pending Users</option>
            <option value={userFilterEnum.REJECTED}>
              Rejected/Deactivated Users
            </option>
          </select>
        </div>
      </div>
      <div className="users">
        <div className="container-fluid">
          <div className="user-labels row">
            <div className="col">
              <h3>Name</h3>
            </div>
            <div className="col">
              <h3>Email</h3>
            </div>
            <div className="col">
              <h3>Account Type</h3>
            </div>
            <div className="col">
              <h3>Title</h3>
            </div>
            <div className="col-2" />
            <div />
          </div>

          {users && users.map(renderCards)}
        </div>
      </div>
    </div>
  );
};

const MapStateToProps = (state) => ({
  users: filteredUserSelector(state),
  filter: filterSelector(state),
});

const mapDispatchToProps = {
  changeUserFilter,
};

export default connect(MapStateToProps, mapDispatchToProps)(UserManager);
