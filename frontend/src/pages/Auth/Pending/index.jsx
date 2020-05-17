import React from "react";
import { withRouter } from "react-router-dom";
import Logo from "../../../assets/images/lah-logo-2.png";
import Check from "../../../assets/images/pending-check.svg";
import "../styles.scss";
import { logout } from "../../../utils/api";
const Pending = () => (
  <div className="login-wrapper">
    <img id="lah-logo" src={Logo} alt="LAH Logo" />
    <div className="login-card">
      <img id="user-avatar" src={Check} alt="avatar" />
      <p>
        Your request for access has been receieved. <br />
        An administrator will review it shortly.
      </p>
      <button id="login-button" onClick={logout}>
        <span>Sign Out</span>
      </button>
    </div>
  </div>
);

export default withRouter(Pending);
