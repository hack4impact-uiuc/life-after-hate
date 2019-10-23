import React from "react";
import ReactMapGL, { Marker, Popup } from "react-map-gl";

import Pin from "../components/pin";

const pin_size = 25;

class MapView extends React.Component {
  state = {
    viewport: {
      latitude: 37.7577,
      longitude: -122.4376,
      zoom: 8
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
    );
  }
}

export default MapView;
