import React, { useEffect } from "react";

import CardView from "./CardView";
import SearchBar from "./SearchBar";
import Map from "./Map";
import RadiusFilter from "./RadiusFilter";
import "./styles.scss";
import { getTags } from "../../utils/api";

const MapView = () => {
  useEffect(() => {
    document.title = "Map View - Life After Hate";
    getTags();
  }, []);

  return (
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
      <RadiusFilter />
    </div>
  );
};

export default MapView;
