import React from "react";
import ReactMapGL, { Marker } from "react-map-gl";

import Pin from "../components/pin";

class MapView extends React.Component {
  state = {
    viewport: {
      width: "100%",
      height: "100vh",
      latitude: 37.7577,
      longitude: -122.4376,
      zoom: 8
    }
  };

  render() {
    return (
      <div className="App">
        <ReactMapGL
          {...this.state.viewport}
          onViewportChange={viewport => this.setState({ viewport })}
          mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
        >
          {this.props.markers.map(item => (
            <Marker
              key={item.id}
              longitude={item.longitude}
              latitude={item.latitude}
            >
              <Pin size={25} />
            </Marker>
          ))}
        </ReactMapGL>
      </div>
    );
  }
}

export default MapView;
