import React from "react";
import Logo from "../../assets/images/lah-logo-2.png";
import "./styles.scss";
function Loader() {
  return (
    <div
      className="loading-screen"
      role="status"
      aria-label="Loading Life After Hate"
    >
      <div className="loading-screen-content">
        <img className="loading-screen-logo" src={Logo} alt="" />
        <div className="loading-screen-feedback" aria-hidden="true">
          <span className="loading-screen-ring" />
          <span>Loading…</span>
        </div>
      </div>
    </div>
  );
}
export default Loader;
