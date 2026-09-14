/* eslint-disable react/jsx-filename-extension */
import React, { Component, lazy, Suspense } from "react";
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
                <PrivateRoute exact path="/" component={MapView} />
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
