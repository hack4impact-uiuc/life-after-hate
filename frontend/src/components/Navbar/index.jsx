import React, { Component } from "react";
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

class Navbar extends Component {
  state = {
    dropdownOpen: false
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
          <Link to="/directory">Directory</Link>
        </div>
        <Dropdown
          isOpen={this.state.dropdownOpen}
          toggle={this.toggleUserDropdown.bind(this)}
        >
          <DropdownToggle id="dropdown-button">
            <img src={this.props.profilePic} alt="User icon" id="user" />
            <span className="caret"></span>
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem header>
              <p>{`${this.props.firstName} ${this.props.lastName}`}</p>
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
const mapStateToProps = state => ({
  profilePic: state.auth.propicUrl,
  firstName: state.auth.firstName,
  lastName: state.auth.lastName
});
// Add history functionality to Navbar (HOC wrapper) so that we can push a redirect to /login on signout
export default connect(mapStateToProps)(withRouter(Navbar));
