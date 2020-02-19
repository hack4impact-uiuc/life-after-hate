import React from "react";
import Logo from "../../assets/images/lah-logo-2.png";

import "./styles.scss";

const Pending = () => (
  <div className="pending">
    <img id="lah-logo" src={Logo} alt="LAH Logo" />
    <p>Your request is pending.</p>
  </div>
);

export default Pending;
