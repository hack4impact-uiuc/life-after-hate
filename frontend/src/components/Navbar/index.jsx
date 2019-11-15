import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Button
} from "reactstrap";

import Logo from "../../assets/images/lah-logo-2.png";
import { getProPic, getFullName, logout } from "../../utils/api";
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

  logoutHandler = async () => {
    const success = await logout();
    if (success) {
      this.props.history.push("/login");
    }
  };

  render() {
    return (
      <div className="lah_navbar">
        <Link to="/">
          <img src={Logo} alt="LAH Logo" id="logo" />
        </Link>
        <div className="spacing" />
        <div className="nav-links">
          <Link to="/">Map</Link>
          <Link to="/resource-manager">Directory</Link>
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
              <Button className="signout-button" onClick={this.logoutHandler}>
                Sign Out
              </Button>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    );
  }
}

// Add history functionality to Navbar (HOC wrapper) so that we can push a redirect to /login on signout
export default withRouter(Navbar);
