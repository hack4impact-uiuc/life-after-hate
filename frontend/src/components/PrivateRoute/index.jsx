import React from "react";
import { Route, Redirect } from "react-router-dom";

function PrivateRoute({ component: Component, authed, ...rest }) {
  console.log(authed);
  return (
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
        return <h3>hi</h3>;
      }}
    />
  );
}
export default PrivateRoute;
