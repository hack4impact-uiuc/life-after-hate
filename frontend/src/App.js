import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./pages/Login";
import MapView from "./pages/MapView";
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
      <div className="App">
        <Router>
          <Route path="/login" component={Login} />
          <PrivateRoute
            exact
            authed={this.state.authenticated}
            path="/"
            component={MapView}
          />
        </Router>
      </div>
    );
  }
}

export default App;
