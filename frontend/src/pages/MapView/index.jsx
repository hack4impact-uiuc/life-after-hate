import React, { Component } from "react";
import ReactMapGL, { Marker, Popup } from "react-map-gl";

import { getSearchResults } from "../../utils/api";
import Pin from "../../components/Pin";
import ResourceCard from "../../components/ResourceCard";
import Search from "../../components/SearchBar";
import "./styles.scss";

const pinSize = 35;

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
      locationValue: "",
      searchResults: [],
      showResults: false,
      searchSuggestions: [],
      showSearchSuggestions: true
    };
  }

  renderCards = card => (
    <ResourceCard
      name={card.companyName}
      description={card.description}
      tags={card.tags}
      contactName={card.contactName}
      contactPhone={card.contactPhone}
      contactEmail={card.contactEmail}
      address={card.address}
      notes={card.notes}
      distanceFromSearchLoc={card.distanceFromSearchLoc}
    />
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
    let searchResults;
    try {
      searchResults = await getSearchResults(
        this.state.inputValue,
        this.state.locationValue
      );
    } catch (error) {
      console.error(error);
      alert(error);
    }

    this.setState({
      searchResults,
      showResults: true,
      showSearchSuggestions: false
    });
  };

  changeHandler = input => {
    this.setState({
      inputValue: input,
      searchSuggestions,
      showSearchSuggestions: true
    });
  };

  locationChangeHandler = input => {
    this.setState({ locationValue: input });
  };

  render() {
    return (
      <div>
        <div className="fixed-height-container">
          <div className="search-content">
            <div className="search-bar">
              <Search
                searchHandler={this.searchHandler}
                changeHandler={this.changeHandler}
                locationChangeHandler={this.locationChangeHandler}
                searchSuggestions={this.state.searchSuggestions}
                showSearchSuggestions={this.state.showSearchSuggestions}
                inputValue={this.state.inputValue}
              />
            </div>
          </div>
          {this.state.showResults && (
            <div className="card-content">
              {this.state.searchResults &&
                this.state.searchResults.map(this.renderCards)}
            </div>
          )}
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
              latitude={this.state.popup.location.coordinates[1]}
              longitude={this.state.popup.location.coordinates[0]}
              tipSize={5}
              closeOnClick={false}
              dynamicPosition={true}
              offsetTop={-27}
              onClose={() => this.setState({ popup: null })}
            >
              <div className="popup">
                <div className="popup-title">
                  {this.state.popup.companyName}
                </div>
                {this.state.popup.distanceFromSearchLoc && (
                  <div className="popup-distance">
                    {Math.round(this.state.popup.distanceFromSearchLoc * 10) /
                      10}{" "}
                    miles away
                  </div>
                )}

                <div className="popup-desc">{this.state.popup.description}</div>
              </div>
            </Popup>
          )}
        </ReactMapGL>
      </div>
    );
  }
}

export default MapView;
