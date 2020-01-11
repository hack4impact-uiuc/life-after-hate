import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Provider } from "react-redux";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./pages/Login";
import MapView from "./pages/MapView";
import DirectoryView from "./pages/DirectoryView";
import MiniLoader from "./components/Loader/mini-loader";
import Modal from "./components/Modal";
import store from "./redux/store";
import { refreshGlobalAuth } from "./utils/api";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

class App extends Component {
  componentDidMount() {
    refreshGlobalAuth();
  }

  render() {
    return (
      <Provider store={store}>
        <div className="App">
          <MiniLoader />
          <ToastContainer />
          <Modal modalName="Add Resource" />
          <Router>
            <Route path="/login" component={Login} />
            <PrivateRoute exact path="/" component={MapView} />
            <PrivateRoute exact path="/directory" component={DirectoryView} />
          </Router>
        </div>
      </Provider>
    );
  }
}

export default App;
