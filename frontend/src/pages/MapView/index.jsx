import React, { Component } from "react";
import ReactMapGL, { Marker, Popup } from "react-map-gl";

import Pin from "../../components/Pin";
import ResourceCard from "../../components/ResourceCard";
import Search from "../../components/SearchBar";
import "./styles.scss";

const pin_size = 25;
const searchResults = [
  {
    latitude: 38.2,
    longitude: -122.4,
    name: "Tattoo Removal",
    description: "Remove tattoos here"
  },
  {
    latitude: 38.9,
    longitude: -123.1,
    name: "Career Center",
    description: "Get career advice here"
  },
  {
    latitude: 38.9,
    longitude: -123.2,
    name: "Career Center",
    description: "Get career advice here"
  },
  {
    latitude: 38.9,
    longitude: -123.3,
    name: "Career Center",
    description: "Get career advice here"
  },
  {
    latitude: 38.9,
    longitude: -123.4,
    name: "Career Center",
    description: "Get career advice here"
  },
  {
    latitude: 38.9,
    longitude: -123.5,
    name: "Career Center",
    description: "Get career advice here"
  },
  {
    latitude: 38.9,
    longitude: -123.6,
    name: "Career Center",
    description: "Get career advice here"
  },
  {
    latitude: 40,
    longitude: -123.1,
    name: "Career Center",
    description: "Get career advice here"
  },
  {
    latitude: 43,
    longitude: -123.2,
    name: "Career Center",
    description: "Get career advice here"
  },
  {
    latitude: 41,
    longitude: -126,
    name: "Career Center",
    description: "Get career advice here"
  },
  {
    latitude: 44,
    longitude: -123.4,
    name: "Career Center",
    description: "Get career advice here"
  }
];

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
      input_value: "",
      searchResults: null,
      showResults: false
    };
  }

  renderCards = card => (
    <ResourceCard name={card.name} description={card.description} />
  );

  renderMarkers = marker => (
    <Marker
      key={marker.id}
      longitude={marker.longitude}
      latitude={marker.latitude}
    >
      <Pin
        size={pin_size}
        onClick={() => {
          this.setState({ popup: marker });
        }}
      />
    </Marker>
  );

  searchHandler = () => {
    this.setState({ searchResults: searchResults, showResults: true });
  };

  changeHandler = input => {
    this.setState({ input_value: input });
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
                input_value={this.state.input_value}
              />
            </div>
          </div>
          <div className="cardContent">
            {this.state.showResults && searchResults.map(this.renderCards)}
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
            this.state.searchResults.map(this.renderMarkers)}
          {this.state.popup && (
            <Popup
              latitude={this.state.popup.latitude}
              longitude={this.state.popup.longitude}
              tipSize={5}
              anchor="top"
              closeOnClick={false}
              onClose={() => this.setState({ popup: null })}
            >
              <p>{this.state.popup.name}</p>
            </Popup>
          )}
        </ReactMapGL>
      </div>
    );
  }
}

export default MapView;
