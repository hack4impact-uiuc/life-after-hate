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

const UserManager = (props) => {
  useEffect(() => {
    refreshAllUsers();
  }, []);

  const renderCards = (user) => <UserCard key={user.id} user={user} />;

  const onCategoryChange = (event) => {
    console.log("filter changed");
    props.changeUserFilter(event.target.value);
  };

  return (
    <div className="directory">
      <div className="manager-header">
        <h1>User Directory</h1>
        <select
          onChange={onCategoryChange}
          defaultValue={props.filter}
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

      <div className="users">
        <div className="user-labels clearfix">
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
          <div />
        </div>
        {props.users && props.users.map(renderCards)}
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
