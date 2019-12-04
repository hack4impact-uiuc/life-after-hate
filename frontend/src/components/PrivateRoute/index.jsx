import React from "react";
import { Route, Redirect } from "react-router-dom";
import Loader from "../Loader";
import Navbar from "../Navbar";
import { connect } from "react-redux";

function PrivateRoute({ component: Component, authed, showLoader, ...rest }) {
  return (
    <div>
      {authed && <Navbar />}
      <Route
        {...rest}
        render={props => {
          if (showLoader) {
            return <Loader></Loader>;
          }
          if (authed === true) {
            return <Component {...props} />;
          }
          if (authed === false) {
            return (
              <Redirect
                to={{ pathname: "/login", state: { from: props.location } }}
              />
            );
          }
        }}
      />
    </div>
  );
}
const mapStateToProps = state => ({
  authed: state.auth.authenticated,
  showLoader: state.auth.isFetchingAuth
});

export default connect(mapStateToProps)(PrivateRoute);
