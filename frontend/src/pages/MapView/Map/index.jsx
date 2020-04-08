import React, { useState, useEffect } from "react";
import StaticMap, { FlyToInterpolator } from "react-map-gl";
import DeckGL from "@deck.gl/react";
import { connect } from "react-redux";
import { resourceSelector } from "../../../redux/selectors/resource";
import {
  selectMapResource,
  clearMapResource
} from "../../../redux/actions/map";
import { IconLayer, GeoJsonLayer } from "@deck.gl/layers";
import MarkerImg from "../../../assets/images/marker-atlas.png";
import Popup from "../Popup";
import "mapbox-gl/dist/mapbox-gl.css";

const PIN_SIZE = 45;

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
  longitude: -98,
  latitude: 39.82,
  zoom: 3.5,
  maxZoom: 20,
  minZoom: 2.7,
  pitch: 0,
  bearing: 0
};

const ZOOMED_IN_CONSTANT = 5;
const TRANSITION_LENGTH = 1500;

const Map = props => {
  const [viewport, setViewport] = useState(INITIAL_VIEW_STATE);

  const handleCenterChange = () => {
    if (props.center && props.center[0]) {
      // If we received a new center point, focus the map
      setViewport(prevState => ({
        ...prevState,
        latitude: props.center[1],
        longitude: props.center[0],
        zoom: ZOOMED_IN_CONSTANT,
        transitionInterpolator: new FlyToInterpolator({ speed: 2 }),
        transitionDuration: TRANSITION_LENGTH
      }));
    }
  };

  useEffect(handleCenterChange, [props.center]);

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

    const iconLayer = new IconLayer({
      ...layerProps,
      id: "icon-layer",
      getIcon: d =>
        d.location.type === "Center" ? "currentLocation" : "marker",
      sizeUnits: "meters",
      sizeMinPixels: PIN_SIZE
    });

    const stateLayer = new GeoJsonLayer({
      ...layerProps,
      id: "state-lines",
      data: "https://docs.mapbox.com/mapbox-gl-js/assets/us_states.geojson",
      pickable: true,
      stroked: true,
      filled: true,
      extruded: false,
      lineWidthScale: 20,
      lineWidthMinPixels: 2,
      getFillColor: [247, 146, 48, 0],
      getLineColor: [247, 146, 48, 255],
      getLineWidth: 1,
      updateTriggers: {
        getFillColor: []
      }
    });

    return [stateLayer, iconLayer];
  };

  const handlePopupClick = e => {
    console.log(e);
    // Don't show a popup if hovering over the current (searched) location
    if (e.layer.id === "icon-layer") {
      if (e.object && e.object.location.type !== "Center") {
        props.selectMapResource(props.resources[e.index]._id);
      } else {
        props.clearMapResource();
      }
    }
  };

  return (
    <DeckGL
      layers={getLayers()}
      initialViewState={INITIAL_VIEW_STATE}
      onViewStateChange={_onViewportChange}
      viewState={viewport}
      controller={{ dragRotate: false }}
      onClick={handlePopupClick}
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
