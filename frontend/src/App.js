/* eslint-disable react/jsx-filename-extension */
import React, { Component } from "react";
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch,
} from "react-router-dom";
import { Provider } from "react-redux";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./pages/Auth/Login";
import MapView from "./pages/MapView";
import DirectoryView from "./pages/DirectoryView";
import AdminView from "./pages/AdminView";
import MiniLoader from "./components/Loader/mini-loader";
import ModalManager from "./components/Modal/ModalManager";
import { roleEnum } from "./utils/enums";
import store from "./redux/store";
import { refreshGlobalAuth } from "./utils/api";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Analytics from "./components/Analytics";
class App extends Component {
  componentDidMount = refreshGlobalAuth;

  render() {
    return (
      <Provider store={store}>
        <div className="App">
          <Analytics />
          <MiniLoader />
          <ToastContainer />
          <ModalManager />
          <Router>
            <Switch>
              <Route path="/login" component={Login} />
              <PrivateRoute exact path="/" component={MapView} />
              <PrivateRoute exact path="/directory" component={DirectoryView} />
              <PrivateRoute
                exact
                path="/users"
                component={AdminView}
                roleRequired={roleEnum.ADMIN}
              />
              <Redirect to="/login"></Redirect>
            </Switch>
          </Router>
        </div>
      </Provider>
    );
  }
}

export default App;
