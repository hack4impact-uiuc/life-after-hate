import React, { Component } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

// import MapView from "./pages/MapView";
import Login from "./pages/Login";
import MapView from "./pages/MapView";

const markers = [
  { latitude: 38.2, longitude: -122.4, name: "Tattoo Removal" },
  { latitude: 38.9, longitude: -123.1, name: "Career Center" }
];

class App extends Component {
  state = {
    authenticated: false
  };

  componentDidMount() {
    this.checkAuthenticated();
  }

  checkAuthenticated = async () => {
    let res = await fetch("api/users/current");
    if (res.status === 200) {
      this.setState({
        authenticated: true
      });
    } else {
      this.setState({
        authenticated: false
      });
    }
  };

  render() {
    console.log(this.state.authenticated);
    return (
      <Router>
        <div className="App">
          <Switch>
            <Route path="/login" component={Login} />
            {this.state.authenticated && (
              <Route path="/map">
                <MapView markers={markers} />
              </Route>
            )}
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;
