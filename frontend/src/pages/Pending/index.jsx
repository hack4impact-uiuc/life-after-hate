import React from "react";
import Logo from "../../assets/images/lah-logo-2.png";

import "./styles.scss";

const Pending = () => (
  <div className="pending">
    <img id="lah-logo" data-cy="logo" src={Logo} alt="LAH Logo" />
    <p data-cy="pending">
      We have received your request to access the platform. <br /> Your request
      is currently pending approval by a Life After Hate administrator.
    </p>
  </div>
);

export default Pending;
