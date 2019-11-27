import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Provider } from "react-redux";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./pages/Login";
import MapView from "./pages/MapView";
import DirectoryView from "./pages/DirectoryView";
import MiniLoader from "./components/Loader/mini-loader";
import store from "./redux/store";
import { isAuthenticated } from "./utils/api";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      authenticated: null
    };
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
