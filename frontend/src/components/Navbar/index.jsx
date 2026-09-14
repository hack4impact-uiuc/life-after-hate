import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Link, withRouter } from "react-router-dom";
import {
  NavbarBrand,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  NavbarToggler,
  Navbar,
  NavItem,
  Nav,
  NavLink,
  UncontrolledDropdown,
  Button,
} from "reactstrap";
import { connect } from "react-redux";
import { openResourceModal } from "../../redux/actions/modal";
import AdminView from "../Auth/AdminView";
import Logo from "../../assets/images/lah-logo-2.png";
import { logout } from "../../utils/api";
import "./styles.scss";
import { changePage } from "../../redux/actions/nav";

const LAHNavbar = ({
  profilePic,
  firstName,
  lastName,
  changePage,
  location,
  openResourceModal,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [pictureFailed, setPictureFailed] = useState(false);
  useEffect(() => setPictureFailed(false), [profilePic]);
  const navbarRef = useRef(null);
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      document.documentElement.style.setProperty(
        "--nav-height",
        `${entry.contentRect.height}px`,
      );
    });
    observer.observe(navbarRef.current);
    return () => observer.disconnect();
  }, []);
  const navigate = () => {
    changePage();
    setDropdownOpen(false);
  };

  const toggleUserDropdown = () => {
    setDropdownOpen((prevState) => !prevState);
  };

  return (
    <div ref={navbarRef}>
      <Navbar light expand="lg" className="lah_navbar ps-sm-5 pe-sm-5">
        <NavbarBrand tag={Link} to="/" onClick={navigate}>
          <img src={Logo} alt="LAH Logo" id="logo" />
        </NavbarBrand>
        <NavbarToggler
          onClick={toggleUserDropdown}
          aria-label="Toggle navigation"
          aria-expanded={dropdownOpen}
          aria-controls="main-navigation"
        />
        <div
          id="main-navigation"
          className={`navbar-collapse collapse${dropdownOpen ? " show" : ""}`}
        >
          <Nav
            className="ms-auto align-items-md-center"
            data-cy="nav-links"
            navbar
          >
            <NavItem>
              <NavLink
                tag={Link}
                onClick={navigate}
                to="/"
                className="hover-orange pe-md-3"
              >
                Map
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                tag={Link}
                onClick={navigate}
                to="/directory"
                className="hover-orange pe-md-3"
              >
                Directory
              </NavLink>
            </NavItem>
            <AdminView>
              <NavItem>
                <NavLink
                  tag={Link}
                  onClick={navigate}
                  to="/users"
                  className="hover-orange pe-md-3"
                >
                  Account Management
                </NavLink>
              </NavItem>
            </AdminView>
            {location.pathname === "/" && (
              <AdminView>
                <NavItem className="map-create-resource">
                  <Button onClick={openResourceModal}>New resource</Button>
                </NavItem>
              </AdminView>
            )}
            <UncontrolledDropdown nav inNavbar>
              <DropdownToggle nav caret>
                {profilePic && !pictureFailed ? (
                  <img
                    src={profilePic}
                    alt="User icon"
                    id="user-icon"
                    onError={() => setPictureFailed(true)}
                  />
                ) : (
                  <span
                    id="user-icon"
                    className="user-initial"
                    aria-label="User menu"
                  >
                    {firstName?.charAt(0) || "U"}
                  </span>
                )}
              </DropdownToggle>
              <DropdownMenu end>
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
        </div>
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
  openResourceModal,
  changePage,
};

LAHNavbar.propTypes = {
  location: PropTypes.object,
  openResourceModal: PropTypes.func,
  profilePic: PropTypes.string.isRequired,
  firstName: PropTypes.string,
  lastName: PropTypes.string,
  changePage: PropTypes.func.isRequired,
};

// Add history functionality to Navbar (HOC wrapper) so that we can push a redirect to /login on signout
export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withRouter(LAHNavbar));
