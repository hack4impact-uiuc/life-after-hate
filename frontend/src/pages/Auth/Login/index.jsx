import React from "react";
import { connect } from "react-redux";

import Logo from "../../../assets/images/lah-logo-2.png";
import Avatar from "../../../assets/images/user-avatar.svg";
import GoogleLogo from "../../../assets/images/google_logo.svg";
import { getURLForEndpoint } from "../../../utils/apiHelpers.js";

import "../styles.scss";
import { Redirect } from "react-router-dom";

const Login = (props) => {
  if (props.authed) {
    return <Redirect to={{ pathname: "/" }} />;
  }
  return (
    <div className="login-wrapper">
      <img id="lah-logo" src={Logo} alt="LAH Logo" />
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
  );
};

const MapStateToProps = (state) => ({
  authed: state.auth.authenticated,
});

export default connect(MapStateToProps)(Login);
