import React, { useState } from "react";
import { Link, withRouter } from "react-router-dom";
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Button
} from "reactstrap";
import { connect } from "react-redux";

import Logo from "../../assets/images/lah-logo-2.png";
import { logout } from "../../utils/api";
import "./styles.scss";

const Navbar = props => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleUserDropdown = () => {
    setDropdownOpen(prevState => !prevState);
  };

  return (
    <div className="lah_navbar">
      <Link to="/">
        <img src={Logo} alt="LAH Logo" id="logo" />
      </Link>
      <div className="spacing" />
      <div className="nav-links">
        <Link to="/">Map</Link>
        <Link to="/directory">Directory</Link>
      </div>
      <Dropdown isOpen={dropdownOpen} toggle={toggleUserDropdown}>
        <DropdownToggle id="dropdown-button">
          <img src={props.profilePic} alt="User icon" id="user" />
          <span className="caret"></span>
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItem header>
            <p>{`${props.firstName} ${props.lastName}`}</p>
            <Button className="signout-button" onClick={logout}>
              Sign Out
            </Button>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};

const mapStateToProps = state => ({
  profilePic: state.auth.propicUrl,
  firstName: state.auth.firstName,
  lastName: state.auth.lastName
});
// Add history functionality to Navbar (HOC wrapper) so that we can push a redirect to /login on signout
export default connect(mapStateToProps)(withRouter(Navbar));
