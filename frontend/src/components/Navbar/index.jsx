import React, { Component } from "react";
import { Link } from "react-router-dom";
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Button
} from "reactstrap";

import Logo from "../../assets/images/lah-logo-2.png";
import { getProPic, getFullName } from "../../utils/api";
import "./styles.scss";

class Navbar extends Component {
  state = {
    dropdownOpen: false,
    proPic: "",
    fullName: ""
  };

  componentDidMount() {
    this.getProPic();
    this.getFullName();
  }

  getProPic = async () => {
    this.setState({
      proPic: await getProPic()
    });
  };

  getFullName = async () => {
    this.setState({
      fullName: await getFullName()
    });
  };

  toggleUserDropdown() {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen
    });
  }

  render() {
    console.log(this.state.firstName);
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
            <img src={this.state.proPic} alt="User icon" id="user" />
            <span className="caret"></span>
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem header>
              <p>{this.state.fullName}</p>
              <Button className="signout-button">Sign Out</Button>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    );
  }
}

export default Navbar;
