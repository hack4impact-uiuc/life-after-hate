import React from "react";

import MapView from "./pages/MapView";

const markers = [
  { latitude: 38.2, longitude: -122.4, name: "Tattoo Removal" },
  { latitude: 38.9, longitude: -123.1, name: "Career Center" }
];

function App() {
  return (
    <div className="App">
      <MapView markers={markers} />
    </div>
  );
}

export default App;
