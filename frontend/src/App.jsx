/* eslint-disable react/jsx-filename-extension */
import React, { Component, lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch,
  useLocation,
} from "react-router-dom";
import { Provider, useSelector } from "react-redux";
import Navbar from "./components/Navbar";
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

function WorkspaceNavbar() {
  const { pathname } = useLocation();
  const auth = useSelector((state) => state.auth);
  return auth.authenticated &&
    !auth.isFetchingAuth &&
    auth.role !== roleEnum.PENDING &&
    ["/", "/directory", "/users"].includes(pathname) ? (
    <Navbar />
  ) : null;
}

function WorkspacePage({ children }) {
  const { pathname } = useLocation();
  // A new boundary prevents a fast return from reusing a page whose search
  // was cancelled while the next route's lazy module was still loading.
  return (
    <Suspense key={pathname} fallback={<Loader />}>
      {children}
    </Suspense>
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
            <WorkspaceNavbar />
            <WorkspacePage>
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
            </WorkspacePage>
          </Router>
        </div>
      </Provider>
    );
  }
}

export default App;
