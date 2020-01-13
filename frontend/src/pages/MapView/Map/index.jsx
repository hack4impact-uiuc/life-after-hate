import React, { useState } from "react";
import StaticMap from "react-map-gl";
import DeckGL from "@deck.gl/react";
import { connect } from "react-redux";
import { resourceSelector } from "../../../redux/selectors/resource";
import {
  selectMapResource,
  clearMapResource
} from "../../../redux/actions/map";
import { IconLayer } from "@deck.gl/layers";
import MarkerImg from "../../../assets/images/marker-atlas.png";
import Popup from "../Popup";
import "mapbox-gl/dist/mapbox-gl.css";

const pinSize = 45;

// Mapping used for IconAtlas, which is not really being used fully currently,
// As we're only rendering two types of icons: searched location and regular marker
const mapping = {
  marker: {
    x: 0,
    y: 0,
    width: 360,
    height: 512,
    anchorY: 512
  },
  markerSelect: {
    x: 360,
    y: 0,
    width: 360,
    height: 512,
    anchorY: 512
  },
  currentLocation: {
    x: 720,
    y: 0,
    width: 360,
    height: 512,
    anchorY: 512
  }
};

const INITIAL_VIEW_STATE = {
  longitude: -35,
  latitude: 36.7,
  zoom: 1.8,
  maxZoom: 20,
  pitch: 0,
  bearing: 0
};

const Map = props => {
  const [viewport, setViewport] = useState(INITIAL_VIEW_STATE);

  const _onViewportChange = ({ viewState }) => {
    setViewport(viewState);
  };

  const getMarkerPoints = () => {
    // If the location information came back correct, display on the map
    if (props.center && props.center[0]) {
      return [
        ...props.resources,
        { location: { type: "Center", coordinates: props.center } }
      ];
    }
    return props.resources;
  };
  const getLayers = () => {
    const data = getMarkerPoints();
    const layerProps = {
      data,
      pickable: true,
      wrapLongitude: true,
      getPosition: d => d.location.coordinates,
      iconAtlas: MarkerImg,
      iconMapping: mapping
    };

    const layer = new IconLayer({
      ...layerProps,
      id: "icon",
      getIcon: d =>
        d.location.type === "Center" ? "currentLocation" : "marker",
      sizeUnits: "meters",
      sizeMinPixels: pinSize
    });

    return [layer];
  };

  return (
    <DeckGL
      layers={getLayers()}
      initialViewState={INITIAL_VIEW_STATE}
      onViewStateChange={_onViewportChange}
      viewState={viewport}
      controller={{ dragRotate: false }}
      onClick={e => {
        // Don't show a popup if hovering over the current (searched) location
        if (e.object && e.object.location.type !== "Center") {
          props.selectMapResource(props.resources[e.index]._id);
        } else {
          props.clearMapResource();
        }
      }}
    >
      <StaticMap
        width="100%"
        height="100vh"
        mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
        reuseMap
        preventStyleDiffing={true}
      >
        <Popup></Popup>
      </StaticMap>
    </DeckGL>
  );
};

const mapStateToProps = state => ({
  resources: resourceSelector(state),
  center: state.map.center
});

const mapDispatchToProps = {
  selectMapResource,
  clearMapResource
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Map);
