import React from "react";
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
import Login from "../../pages/Login";
import MapView from "../../pages/MapView";
import Auth from "../Auth";

const LAHRouter = () => (
  <Router>
    <Route path="/login" component={Login} />
    <PrivateRoute path="/map" component={MapView} />
  </Router>
);

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      Auth.getAuth() ? <Component {...props} /> : <Redirect to="/login" />
    }
  />
);

export default LAHRouter;
