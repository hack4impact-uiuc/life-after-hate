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
import AdminView from "../Auth/AdminView";
import Logo from "../../assets/images/lah-logo-2.png";
import { logout } from "../../utils/api";
import "./styles.scss";
import { changePage } from "../../redux/actions/nav";
const LAHNavbar = ({ profilePic, firstName, lastName, changePage }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleUserDropdown = () => {
    setDropdownOpen((prevState) => !prevState);
  };

  return (
    <div>
      <Navbar light expand="md" className="lah_navbar pl-5 pr-5">
        <NavbarBrand tag={Link} to="/" onClick={changePage}>
          <img src={Logo} alt="LAH Logo" id="logo" />
        </NavbarBrand>
        <NavbarToggler onClick={toggleUserDropdown} />
        <Collapse isOpen={dropdownOpen} navbar>
          <Nav
            className="ml-auto align-items-md-center"
            data-cy="nav-links"
            navbar
          >
            <NavItem>
              <NavLink
                tag={Link}
                onClick={changePage}
                to="/"
                className="hover-orange pr-md-3"
              >
                Map
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                tag={Link}
                onClick={changePage}
                to="/directory"
                className="hover-orange pr-md-3"
              >
                Directory
              </NavLink>
            </NavItem>
            <AdminView>
              <NavItem>
                <NavLink
                  tag={Link}
                  onClick={changePage}
                  to="/users"
                  className="hover-orange pr-md-3"
                >
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
  changePage,
};
// Add history functionality to Navbar (HOC wrapper) so that we can push a redirect to /login on signout
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(LAHNavbar));
