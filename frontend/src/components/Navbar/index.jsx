import React, { useState } from "react";
import { Link, withRouter } from "react-router-dom";
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Button,
} from "reactstrap";
import { connect } from "react-redux";
import { clearResources } from "../../redux/actions/resources";

import Logo from "../../assets/images/lah-logo-2.png";
import { logout } from "../../utils/api";
import "./styles.scss";
import { roleEnum } from "../../utils/enums";

const Navbar = ({ clearResources, role, profilePic, firstName, lastName }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleUserDropdown = () => {
    setDropdownOpen((prevState) => !prevState);
  };

  return (
    <div className="lah_navbar" data-cy="navbar">
      <Link to="/" onClick={clearResources}>
        <img src={Logo} alt="LAH Logo" id="logo" />
      </Link>
      <div className="spacing" />
      <div className="nav-links" data-cy="nav-links">
        <Link to="/">Map</Link>
        <Link to="/directory">Directory</Link>
        {role === roleEnum.ADMIN && <Link to="/users">Account Management</Link>}
      </div>
      <Dropdown isOpen={dropdownOpen} toggle={toggleUserDropdown}>
        <DropdownToggle id="dropdown-button">
          <img src={profilePic} alt="User icon" id="user" />
          <span className="caret"></span>
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItem header>
            <p>{`${firstName} ${lastName}`}</p>
            <Button className="signout-button" onClick={logout}>
              Sign Out
            </Button>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};

const mapStateToProps = (state) => ({
  profilePic: state.auth.propicUrl,
  firstName: state.auth.firstName,
  lastName: state.auth.lastName,
  role: state.auth.role,
});

const mapDispatchToProps = {
  clearResources,
};
// Add history functionality to Navbar (HOC wrapper) so that we can push a redirect to /login on signout
export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Navbar));
