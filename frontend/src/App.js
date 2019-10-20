import React from "react";
import "./styles/App.scss";

import MapView from "./pages/mapView.js";

const markers = [
  { latitude: 38.2, longitude: -122.4 },
  { latitude: 38.9, longitude: -123.1 }
];

function App() {
  return (
    <div className="App">
      <MapView markers={markers} />
    </div>
  );
}

export default App;
