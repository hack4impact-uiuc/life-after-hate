import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./pages/Login";
import MapView from "./pages/MapView";
import { API_URI } from "./utils/api";

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
    console.log("Yo");
    this.checkAuthenticated();
  }

  checkAuthenticated = async () => {
    const res = await fetch(`${API_URI}/api/users/current`, {
      credentials: "include"
    });
    this.setState({ authenticated: res.status === 200 });
  };

  render() {
    return (
      <div className="App">
        <Router>
          <Route path="/login" component={Login} />
          <PrivateRoute
            authed={this.state.authenticated}
            path="/map"
            component={MapView}
          />
        </Router>
      </div>
    );
  }
}

export default App;
