import React, { Component } from "react";
import { Button } from "reactstrap";

import Logo from "./images/lah-logo.png";
import GoogleLogo from "./images/google-logo.png";
import Signin from "./images/google-signin.png";

import "./styles.scss";

class Login extends Component {
  render() {
    return (
      <div className="login">
        <img id="lah-logo" src={Logo} alt="LAH Logo" />
        <img id="google-logo" src={GoogleLogo} alt="Google Logo" />
        <p>Sign in to Life After Hate with Google</p>
        <Button
          className="login-button"
          color="link"
          href="http://localhost:5000/api/auth/login"
        >
          <img id="sign-in" src={Signin} alt="signin" />
        </Button>
      </div>
    );
  }
}

export default Login;
