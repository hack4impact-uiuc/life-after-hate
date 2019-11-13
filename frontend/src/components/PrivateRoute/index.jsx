import React from "react";
import { Route, Redirect } from "react-router-dom";
import Loader from "../Loader";
import Navbar from "../Navbar";

function PrivateRoute({ component: Component, authed, ...rest }) {
  return (
    <div>
      <Navbar />
      <Route
        {...rest}
        render={props => {
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
          return <Loader></Loader>;
        }}
      />
    </div>
  );
}
export default PrivateRoute;
