import React, { useState } from "react";
import { Link, withRouter } from "react-router-dom";
import {
  NavbarBrand,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  NavbarToggler,
  Navbar,
  Collapse,
  NavItem,
  Nav,
  NavLink,
  UncontrolledDropdown,
  Button,
} from "reactstrap";
import { connect } from "react-redux";
import { clearResources } from "../../redux/actions/resources";
import {
  updateSearchLocation,
  updateSearchQuery,
  clearMapCenter,
} from "../../redux/actions/map";
import AdminView from "../Auth/AdminView";
import Logo from "../../assets/images/lah-logo-2.png";
import { logout } from "../../utils/api";
import "./styles.scss";

const LAHNavbar = ({
  profilePic,
  firstName,
  lastName,
  updateSearchLocation,
  updateSearchQuery,
  clearResources,
  clearMapCenter,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const onLogoClick = () => {
    clearResources();
    clearMapCenter();
    updateSearchLocation("");
    updateSearchQuery("");
  };

  const toggleUserDropdown = () => {
    setDropdownOpen((prevState) => !prevState);
  };

  return (
    <div>
      <Navbar light expand="md" className="lah_navbar">
        <NavbarBrand onClick={onLogoClick}>
          <Link to="/">
            <img src={Logo} alt="LAH Logo" id="logo" />
          </Link>
        </NavbarBrand>
        <NavbarToggler onClick={toggleUserDropdown} />
        <Collapse isOpen={dropdownOpen} navbar>
          <Nav className="ml-auto align-items-md-center" navbar>
            <NavItem>
              <NavLink tag={Link} to="/" className="hover-orange">
                Map
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={Link} to="/directory" className="hover-orange">
                Directory
              </NavLink>
            </NavItem>
            <AdminView>
              <NavItem>
                <NavLink tag={Link} to="/users" className="hover-orange">
                  Account Management
                </NavLink>
              </NavItem>
            </AdminView>
            <UncontrolledDropdown nav inNavbar>
              <DropdownToggle nav caret>
                <img src={profilePic} alt="User icon" id="user-icon" />
              </DropdownToggle>
              <DropdownMenu right>
                <DropdownItem header>{`${firstName} ${lastName}`}</DropdownItem>
                <DropdownItem divider />
                <DropdownItem header>
                  <Button id="signout-button" onClick={logout}>
                    Sign Out
                  </Button>
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          </Nav>
        </Collapse>
      </Navbar>
    </div>
  );
};

const mapStateToProps = (state) => ({
  profilePic: state.auth.propicUrl,
  firstName: state.auth.firstName,
  lastName: state.auth.lastName,
});

const mapDispatchToProps = {
  clearResources,
  updateSearchLocation,
  updateSearchQuery,
  clearMapCenter,
};
// Add history functionality to Navbar (HOC wrapper) so that we can push a redirect to /login on signout
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(LAHNavbar));
