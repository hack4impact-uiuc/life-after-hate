import React, { Component } from "react";
import ReactMapGL, { Marker, Popup } from "react-map-gl";

import api from "../../utils/api";
import Pin from "../../components/Pin";
import ResourceCard from "../../components/ResourceCard";
import Search from "../../components/SearchBar";
import "./styles.scss";

const pinSize = 25;

const searchSuggestions = [];

class MapView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewport: {
        latitude: 37.785164,
        longitude: -100,
        zoom: 3.5
      },
      popup: null,
      inputValue: "",
      searchResults: [],
      showResults: false,
      searchSuggestions: [],
      showSearchSuggestions: true
    };
  }

  renderCards = card => (
    <ResourceCard name={card.companyName} description={card.description} />
  );

  renderMarkers = marker => (
    <Marker
      key={marker.id}
      longitude={marker.location.coordinates[0]}
      latitude={marker.location.coordinates[1]}
    >
      <Pin
        size={pinSize}
        onClick={() => {
          this.setState({ popup: marker });
        }}
      />
    </Marker>
  );

  searchHandler = async () => {
    const searchResults = await api.getSearchResults(this.state.inputValue);
    this.setState({
      searchResults,
      showResults: true,
      showSearchSuggestions: false
    });
    console.log(this.state.searchResults);
  };

  changeHandler = input => {
    this.state.searchSuggestions.push(input);
    this.setState({ inputValue: input, searchSuggestions });
  };

  render() {
    return (
      <div>
        <div className="FixedHeightContainer">
          <div className="searchContent">
            <div className="searchBar">
              <Search
                searchHandler={this.searchHandler}
                changeHandler={this.changeHandler}
                searchSuggestions={this.state.searchSuggestions}
                showSearchSuggestions={this.state.showSearchSuggestions}
                inputValue={this.state.inputValue}
              />
            </div>
          </div>
          <div className="cardContent">
            {this.state.showResults &&
              this.state.searchResults &&
              this.state.searchResults.map(this.renderCards)}
          </div>
        </div>
        <ReactMapGL
          {...this.state.viewport}
          width="100%"
          height="100vh"
          onViewportChange={viewport => this.setState({ viewport })}
          mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
        >
          {this.state.showResults &&
            this.state.searchResults &&
            this.state.searchResults.map(this.renderMarkers)}
          {this.state.popup && (
            <Popup
              latitude={this.state.popup.location.coordinates[0]}
              longitude={this.state.popup.location.coordinates[1]}
              tipSize={5}
              anchor="top"
              closeOnClick={false}
              onClose={() => this.setState({ popup: null })}
            >
              <p>{this.state.popup.companyName}</p>
            </Popup>
          )}
        </ReactMapGL>
      </div>
    );
  }
}

export default MapView;
