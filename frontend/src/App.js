import React, { Component } from "react";
import Auth from "./components/Auth";
import Router from "./components/Router";

const API_URI = process.env.REACT_APP_API_URI
  ? process.env.REACT_APP_API_URI
  : "";

// const markers = [
//   { latitude: 38.2, longitude: -122.4, name: "Tattoo Removal" },
//   { latitude: 38.9, longitude: -123.1, name: "career Center" }
// ];

class App extends Component {
  componentDidMount() {
    this.checkAuthenticated();
  }

  checkAuthenticated = async () => {
    const res = await fetch(`${API_URI}/api/users/current`);
    if (res.status === 200) {
      Auth.authenticate();
    } else {
      Auth.signout();
    }
  };

  render() {
    console.log(Auth.getAuth());
    return (
      <div className="App">
        <Router />
      </div>
    );
  }
}

export default App;
