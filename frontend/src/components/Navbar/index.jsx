import React, { Component } from "react";
import { Link } from "react-router-dom";
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from "reactstrap";

import Logo from "../../assets/images/lah-logo-2.png";
import User from "../../assets/images/user.svg";
import "./styles.scss";

class Navbar extends Component {
  state = {
    dropdownOpen: false
  };

  toggleUserDropdown() {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen
    });
  }

  render() {
    return (
      <div className="lah_navbar">
        <Link to="/">
          <img src={Logo} alt="LAH Logo" id="logo" />
        </Link>
        <div className="spacing" />
        <div className="nav-links">
          <Link to="/">Map Search</Link>
          <Link to="/">Dictionary Search</Link>
          <Link to="/">Resource Management</Link>
        </div>
        <Dropdown
          isOpen={this.state.dropdownOpen}
          toggle={this.toggleUserDropdown.bind(this)}
        >
          <DropdownToggle id="dropdown-button">
            <img src={User} alt="User icon" id="user" />
            <span className="caret"></span>
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem header>Account Settings</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    );
  }
}

export default Navbar;
