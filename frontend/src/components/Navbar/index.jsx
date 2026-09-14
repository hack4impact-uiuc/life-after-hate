import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
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
  Collapse,
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
  const [indicator, setIndicator] = useState(null);
  useLayoutEffect(() => {
    const measure = () => {
      const active = navbarRef.current?.querySelector(
        '.workspace-tab [aria-current="page"]',
      );
      const nav = active?.closest(".navbar-nav");
      if (!active || !nav) return;
      const rect = active.getBoundingClientRect();
      const parent = nav.getBoundingClientRect();
      setIndicator({
        x: rect.left - parent.left,
        y: rect.top - parent.top,
        width: rect.width,
        height: rect.height,
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(navbarRef.current);
    return () => observer.disconnect();
  }, [location.pathname, dropdownOpen]);
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
    <div ref={navbarRef} className="lah-navbar-container">
      <Navbar light expand="md" className="lah_navbar">
        <NavbarBrand tag={Link} to="/" onClick={navigate}>
          <img src={Logo} alt="Life After Hate home" id="logo" />
        </NavbarBrand>
        <NavbarToggler
          onClick={toggleUserDropdown}
          aria-label="Toggle navigation"
          aria-expanded={dropdownOpen}
          aria-controls="main-navigation"
        />
        <Collapse id="main-navigation" isOpen={dropdownOpen} navbar>
          <Nav
            className="ms-auto align-items-md-center"
            data-cy="nav-links"
            navbar
          >
            {indicator && (
              <span
                className="workspace-tab-indicator"
                aria-hidden="true"
                style={{
                  width: indicator.width,
                  height: indicator.height,
                  transform: `translate(${indicator.x}px, ${indicator.y}px)`,
                }}
              />
            )}
            <NavItem className="workspace-tab">
              <NavLink
                tag={Link}
                onClick={navigate}
                to="/"
                aria-current={location.pathname === "/" ? "page" : undefined}
                className="hover-orange pe-md-3"
              >
                Map
              </NavLink>
            </NavItem>
            <NavItem className="workspace-tab">
              <NavLink
                tag={Link}
                onClick={navigate}
                to="/directory"
                aria-current={
                  location.pathname === "/directory" ? "page" : undefined
                }
                className="hover-orange pe-md-3"
              >
                Directory
              </NavLink>
            </NavItem>
            <NavItem className="workspace-tab">
              <NavLink
                tag={Link}
                onClick={navigate}
                to="/shortlists"
                aria-current={
                  location.pathname.startsWith("/shortlists")
                    ? "page"
                    : undefined
                }
                className="hover-orange pe-md-3"
              >
                Shortlists
              </NavLink>
            </NavItem>
            <AdminView>
              <NavItem className="workspace-tab">
                <NavLink
                  tag={Link}
                  onClick={navigate}
                  to="/users"
                  aria-current={
                    location.pathname === "/users" ? "page" : undefined
                  }
                  className="hover-orange pe-md-3"
                >
                  People
                </NavLink>
              </NavItem>
            </AdminView>
            <AdminView>
              <NavItem className="header-create-resource">
                <Button
                  id={
                    location.pathname === "/directory"
                      ? "add-button"
                      : undefined
                  }
                  onClick={() => {
                    setDropdownOpen(false);
                    openResourceModal();
                  }}
                >
                  New resource
                </Button>
              </NavItem>
            </AdminView>
            <UncontrolledDropdown nav inNavbar>
              <DropdownToggle
                nav
                tag="button"
                type="button"
                className="dropdown-toggle"
                aria-label="User menu"
              >
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
              <DropdownMenu end className="account-menu">
                <DropdownItem header>
                  <span className="account-menu-label">Signed in as</span>
                  <span className="account-menu-name">
                    {[firstName, lastName].filter(Boolean).join(" ") ||
                      "Your account"}
                  </span>
                </DropdownItem>
                <DropdownItem divider />
                <DropdownItem id="signout-button" onClick={logout}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M9 5H5v14h4M10 12h10m-4-4 4 4-4 4" />
                  </svg>
                  <span>Sign out</span>
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
