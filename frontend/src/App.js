import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./pages/Login";
import MapView from "./pages/MapView";
import ResourceManager from "./pages/ResourceManager";
import { isAuthenticated } from "./utils/api";

// const markers = [
//   { latitude: 38.2, longitude: -122.4, name: "Tattoo Removal" },
//   { latitude: 38.9, longitude: -123.1, name: "career Center" }
// ];

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
      <div className="App">
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
            path="/resource-manager"
            component={ResourceManager}
          />
        </Router>
      </div>
    );
  }
}

export default App;
