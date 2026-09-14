/* eslint-disable react/jsx-filename-extension */
import React, { Component, lazy, Suspense, useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch,
} from "react-router-dom";
import { Provider } from "react-redux";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./pages/Auth/Login";
const MapView = lazy(() => import("./pages/MapView"));
const DirectoryView = lazy(() => import("./pages/DirectoryView"));
const Shortlists = lazy(() => import("./pages/Shortlists"));
const ResourcePage = lazy(() =>
  import("./pages/Shortlists").then((m) => ({ default: m.ResourcePage })),
);
const AdminView = lazy(() => import("./pages/AdminView"));
import MiniLoader from "./components/Loader/mini-loader";
import Loader from "./components/Loader";
import ModalManager from "./components/Modal/ModalManager";
import { roleEnum } from "./utils/enums";
import store from "./redux/store";
import { refreshGlobalAuth } from "./utils/api";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SessionGuard from "./components/SessionGuard";
function Landing() {
  const [target] = useState(() => {
    try {
      return sessionStorage.getItem("lah.returnTo");
    } catch {
      return null;
    }
  });
  useEffect(() => {
    try {
      sessionStorage.removeItem("lah.returnTo");
    } catch {
      /* Storage can be unavailable. */
    }
  }, []);
  return /^\/(resources|shortlists)\/[a-f0-9]{24}$/i.test(target || "") ? (
    <Redirect to={target} />
  ) : (
    <MapView />
  );
}
class App extends Component {
  componentDidMount = refreshGlobalAuth;

  render() {
    return (
      <Provider store={store}>
        <div className="App">
          <SessionGuard />
          <MiniLoader />
          <ToastContainer />
          <ModalManager />
          <Router>
            <Suspense fallback={<Loader />}>
              <Switch>
                <Route path="/login" component={Login} />
                <PrivateRoute exact path="/" component={Landing} />
                <PrivateRoute
                  exact
                  path="/resources/:id"
                  component={ResourcePage}
                />
                <PrivateRoute
                  exact
                  path="/shortlists/:id?"
                  component={Shortlists}
                />
                <PrivateRoute
                  exact
                  path="/directory"
                  component={DirectoryView}
                />
                <PrivateRoute
                  exact
                  path="/users"
                  component={AdminView}
                  roleRequired={roleEnum.ADMIN}
                />
                <Redirect to="/login"></Redirect>
              </Switch>
            </Suspense>
          </Router>
        </div>
      </Provider>
    );
  }
}

export default App;
