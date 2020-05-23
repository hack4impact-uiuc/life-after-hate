import React from "react";
import { Route, Redirect } from "react-router-dom";
import Loader from "../Loader";
import Navbar from "../Navbar";
import Pending from "../../pages/Auth/Pending";
import { connect } from "react-redux";
import { roleEnum } from "../../utils/enums";

function PrivateRoute({
  component: Component,
  authed,
  role,
  showLoader,
  roleRequired,
  ...rest
}) {
  const pending = role === roleEnum.PENDING;
  return (
    <div>
      <Route
        {...rest}
        render={(props) => {
          if (showLoader) {
            return <Loader></Loader>;
          }
          if (authed === true) {
            if (!pending) {
              if (!roleRequired || roleRequired === role) {
                return (
                  <div>
                    {authed && !pending && <Navbar />}
                    <Component {...props} />
                  </div>
                );
              }
              return (
                <Redirect
                  to={{ pathname: "/", state: { from: props.location } }}
                />
              );
            }
            return <Pending {...props} />;
          }
          return (
            <Redirect
              to={{ pathname: "/login", state: { from: props.location } }}
            />
          );
        }}
      />
    </div>
  );
}
const mapStateToProps = (state) => ({
  authed: state.auth.authenticated,
  role: state.auth.role,
  showLoader: state.auth.isFetchingAuth,
});

export default connect(mapStateToProps)(PrivateRoute);
