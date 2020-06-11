/* eslint-disable jsx-a11y/no-onchange */
import React, { useEffect, useState } from "react";
import { refreshAllUsers } from "../../utils/api";
import { connect } from "react-redux";
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
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

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggle = () => setDropdownOpen((prevState) => !prevState);

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
            <h1 id="page-title">User Directory</h1>
          </div>
          <Dropdown
            isOpen={dropdownOpen}
            toggle={toggle}
            onChange={onCategoryChange}
            // defaultValue={filter}
            data-cy="user-filter"
          >
            <DropdownToggle caret color="custom">
              {filter} Users
            </DropdownToggle>
            <DropdownMenu right>
              <DropdownItem
                value={userFilterEnum.ALL}
                onClick={onCategoryChange}
              >
                All Users
              </DropdownItem>
              <DropdownItem
                value={userFilterEnum.PENDING}
                onClick={onCategoryChange}
              >
                Pending Users
              </DropdownItem>
              <DropdownItem
                value={userFilterEnum.REJECTED}
                onClick={onCategoryChange}
              >
                Rejected/Deactivated Users
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
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
            <div className="col d-none d-md-block">
              <h3>Title</h3>
            </div>
            <div className="col" />
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
