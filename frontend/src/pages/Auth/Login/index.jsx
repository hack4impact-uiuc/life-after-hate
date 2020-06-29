import React, { useEffect } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import Logo from "../../../assets/images/lah-logo-2.png";
import Avatar from "../../../assets/images/user-avatar.svg";
import GoogleLogo from "../../../assets/images/google_logo.svg";
import { getURLForEndpoint } from "../../../utils/apiHelpers.js";

import "../styles.scss";
import { Redirect } from "react-router-dom";

const Login = ({ authed }) => {
  useEffect(() => {
    document.title = "Login - Life After Hate";
  }, []);
  if (authed) {
    return <Redirect to={{ pathname: "/" }} />;
  }
  return (
    <div className="login-wrapper">
      <div className="container-fluid">
        <div className="row">
          <div className="col col-sm-9 col-md-6 col-lg-4 mx-auto">
            <img id="lah-logo" src={Logo} alt="LAH Logo" />
          </div>
        </div>
        <div className="row">
          <div className="col col-sm-9 col-md-6 col-lg-4 mx-auto">
            <div className="login-card">
              <img id="user-avatar" src={Avatar} alt="avatar" />
              <a
                className="action-button blue"
                href={getURLForEndpoint("auth/login")}
              >
                <img src={GoogleLogo} id="google-logo" alt="Google logo"></img>
                <span> Sign in with Google</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MapStateToProps = (state) => ({
  authed: state.auth.authenticated,
});

Login.propTypes = {
  authed: PropTypes.bool,
};
export default connect(MapStateToProps)(Login);
