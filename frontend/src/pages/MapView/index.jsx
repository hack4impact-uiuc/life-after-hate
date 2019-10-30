import React, { Component } from "react";
import ReactMapGL, { Marker, Popup } from "react-map-gl";

import Pin from "../../components/Pin";
import Search from "../../components/SearchBar";

const pin_size = 25;

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

class MapView extends Component {
  state = {
    viewport: {
      latitude: 37.785164,
      longitude: -100,
      zoom: 3.5
    },
    popup: null
  };

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

  render() {
    return (
      <div>
        <Search searchResults={searchResults} />
        <ReactMapGL
          {...this.state.viewport}
          width="100%"
          height="100vh"
          onViewportChange={viewport => this.setState({ viewport })}
          mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
        >
          {this.props.markers.map(this.renderMarkers)}
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
