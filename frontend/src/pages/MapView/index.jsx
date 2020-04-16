import React, { useState } from "react";

import CardView from "./CardView";
import SearchBar from "./SearchBar";
import Map from "./Map";
import "./styles.scss";

const MapView = () => {
  const [searchTags, setSearchTags] = useState([])
  
  const addTagToSearch = tagName => {
    if (!searchTags.includes(tagName)) {
      setSearchTags([...searchTags, tagName]);
    }
  }

  const removeTagFromSearch = tagName => {
    setSearchTags(searchTags.filter(val => (val !== tagName)));
  }

  return (
    <div>
      <div className="fixed-height-container">
        <div className="search-content">
          <div className="search-bar">
            <SearchBar tags={searchTags} removeTag={removeTagFromSearch} />
          </div>
        </div>
        <CardView addTagToSearch={addTagToSearch} ></CardView>
      </div>
      <Map></Map>
    </div>
  )
};

export default MapView;
