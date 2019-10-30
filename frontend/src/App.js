import React from "react";
import "./styles/App.scss";

import MapView from "./pages/mapView.js";

const markers = [
  { latitude: 38.2, longitude: -122.4, name: "Tattoo Removal" },
  { latitude: 38.9, longitude: -123.1, name: "Career Center" }
];

const searchResults = [
  { title: "hello", text: "this is a message" },
  { title: "tattoo place", text: "this is a tattooooo place" },
  { title: "tattoo place", text: "this is a tattooooo place" },
  { title: "tattoo place", text: "this is a tattooooo place" },
  { title: "tattoo place", text: "this is a tattooooo place" },
  { title: "tattoo place", text: "this is a tattooooo place" },
  { title: "tattoo place", text: "this is a tattooooo place" },
  { title: "tattoo place", text: "this is a tattooooo place" },
  { title: "tattoo place", text: "this is a tattooooo place" },
  { title: "tattoo place", text: "this is a tattooooo place" },
  { title: "tattoo place", text: "this is a tattooooo place" }
];

function App() {
  return (
    <div className="App">
      <MapView markers={markers} searchResults={searchResults} />
    </div>
  );
}

export default App;
