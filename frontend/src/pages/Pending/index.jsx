import React from "react";
import Logo from "../../assets/images/lah-logo-2.png";

import "./styles.scss";

const Pending = () => (
  <div className="pending">
    <img id="lah-logo" data-cy="logo" src={Logo} alt="LAH Logo" />
    <p data-cy="pending">Your request is pending.</p>
  </div>
);

export default Pending;
