import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { createStore, applyMiddleware, compose } from "redux";
import { Provider } from "react-redux";
import logger from "redux-logger";

import PrivateRoute from "./components/PrivateRoute";
import Login from "./pages/Login";
import MapView from "./pages/MapView";
import DirectoryView from "./pages/DirectoryView";
import MiniLoader from "./components/Loader/mini-loader";

import { isAuthenticated } from "./utils/api";
import rootReducer from "./redux/reducers";

// Add Redux DevTools support
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(logger))
);

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      authenticated: null
    };
    store.dispatch({ type: "LOADER_START" });
    setTimeout(() => store.dispatch({ type: "LOADER_END" }), 1000);
  }

  componentDidMount() {
    this.checkAuthenticated();
  }

  checkAuthenticated = async () => {
    this.setState({
      authenticated: await isAuthenticated()
    });
  };

  render() {
    return (
      <Provider store={store}>
        <div className="App">
          <MiniLoader />
          <Router>
            <Route path="/login" component={Login} />
            <PrivateRoute
              exact
              authed={this.state.authenticated}
              path="/"
              component={MapView}
            />
            <PrivateRoute
              exact
              authed={this.state.authenticated}
              path="/directory"
              component={DirectoryView}
            />
          </Router>
        </div>
      </Provider>
    );
  }
}

export default App;
