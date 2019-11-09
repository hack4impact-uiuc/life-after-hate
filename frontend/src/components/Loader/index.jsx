import React from "react";
import Logo from "../../assets/images/lah-logo.png";
import ClipLoader from "react-spinners/ClipLoader";
import "./styles.scss";
function Loader() {
  return (
    <div className="loading-spinner">
      <img src={Logo} alt="LAH Logo"></img>
      <ClipLoader sizeUnit={"px"} size={200} color={"#123abc"} loading />
    </div>
  );
}
export default Loader;
