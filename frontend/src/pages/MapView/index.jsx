import React from "react";

import CardView from "./CardView";
import SearchBar from "./SearchBar";
import Map from "./Map";
import "./styles.scss";

const MapView = () => (
  <div>
    <div className="fixed-height-container">
      <div className="search-content">
        <div className="search-bar">
          <SearchBar />
        </div>
      </div>
      <CardView />
    </div>
    <Map></Map>
  </div>
);

export default MapView;
