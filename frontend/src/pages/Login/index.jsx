import React, { useEffect } from "react";
import { Button } from "reactstrap";
import { connect } from "react-redux";

import Logo from "./images/lah-logo.png";
import GoogleLogo from "./images/google-logo.png";
import Signin from "./images/google-signin.png";
import { getURLForEndpoint } from "../../utils/apiHelpers.js";

import "./styles.scss";
import { Redirect } from "react-router-dom";

const Login = (props) => {
  useEffect(() => {
    document.title = "Login - Life After Hate";
  }, []);
  if (props.authed) {
    return <Redirect to={{ pathname: "/" }} />;
  }
  return (
    <div className="login">
      <img id="lah-logo" src={Logo} alt="LAH Logo" />
      <img id="google-logo" src={GoogleLogo} alt="Google Logo" />
      <p>Sign in to Life After Hate with Google</p>
      <Button
        className="login-button"
        color="link"
        href={getURLForEndpoint("auth/login")}
      >
        <img id="sign-in" src={Signin} alt="signin" />
      </Button>
    </div>
  );
};

const MapStateToProps = (state) => ({
  authed: state.auth.authenticated,
});

export default connect(MapStateToProps)(Login);
