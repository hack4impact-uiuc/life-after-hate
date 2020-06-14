import React from "react";
import { withRouter } from "react-router-dom";
import Logo from "../../../assets/images/lah-logo-2.png";
import Check from "../../../assets/images/pending-check.svg";
import "../styles.scss";
import { logout } from "../../../utils/api";
const Pending = () => (
  <div className="login-wrapper">
    <div className="container-fluid">
      <div className="row">
        <div className="col col-sm-9 col-md-6 col-lg-4 mx-auto">
          <img id="lah-logo" src={Logo} alt="LAH Logo" data-cy="logo" />
        </div>
      </div>
      <div className="row">
        <div className="col col-sm-9 col-md-6 col-lg-4 mx-auto">
          <div className="login-card">
            <img id="user-avatar" src={Check} alt="avatar" />
            <p data-cy="pending">
              Your request for access has been receieved. <br />
              An administrator will review it shortly.
            </p>
            <button className="action-button orange" onClick={logout}>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default withRouter(Pending);
