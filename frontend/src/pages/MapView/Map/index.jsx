import React, { useState, useEffect } from "react";
import StaticMap, {
  FlyToInterpolator,
  _MapContext as MapContext,
} from "react-map-gl";
import DeckGL from "@deck.gl/react";
import { connect } from "react-redux";
import { mappableResourceSelector } from "../../../redux/selectors/map";
import {
  selectMapResource,
  clearMapResource,
} from "../../../redux/actions/map";
import { IconLayer } from "@deck.gl/layers";
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
    anchorY: 512,
  },
  markerSelect: {
    x: 360,
    y: 0,
    width: 360,
    height: 512,
    anchorY: 512,
  },
  currentLocation: {
    x: 720,
    y: 0,
    width: 360,
    height: 512,
    anchorY: 512,
  },
};

const INITIAL_VIEW_STATE = {
  longitude: -98,
  latitude: 39.82,
  zoom: 3.5,
  maxZoom: 20,
  minZoom: 2.7,
  pitch: 0,
  bearing: 0,
};

const ZOOMED_IN_CONSTANT = 5;
const TRANSITION_LENGTH = 1500;

const Map = ({ center, resources, selectMapResource, clearMapResource }) => {
  console.log(`Num resources: ${resources.length}`);
  const [viewport, setViewport] = useState(INITIAL_VIEW_STATE);
  const [hovered, setHovered] = useState(false);
  const handleCenterChange = () => {
    if (center && center[0]) {
      // If we received a new center point, focus the map
      setViewport((prevState) => ({
        ...prevState,
        latitude: center[1],
        longitude: center[0],
        zoom: ZOOMED_IN_CONSTANT,
        transitionInterpolator: new FlyToInterpolator({ speed: 2 }),
        transitionDuration: TRANSITION_LENGTH,
      }));
    }
  };

  useEffect(handleCenterChange, [center]);

  const _onViewportChange = ({ viewState }) => {
    setViewport(viewState);
  };

  const getMarkerPoints = () => {
    // If the location information came back correct, display on the map
    if (center && center[0]) {
      return [
        ...resources,
        { location: { type: "Center", coordinates: center } },
      ];
    }
    return resources;
  };

  const getLayers = () => {
    const data = getMarkerPoints();
    const layerProps = {
      data,
      pickable: true,
      wrapLongitude: true,
      getPosition: (d) => d.location.coordinates,
      iconAtlas: MarkerImg,
      iconMapping: mapping,
    };

    const layer = new IconLayer({
      ...layerProps,
      id: "icon",
      getIcon: (d) =>
        d.location.type === "Center" ? "currentLocation" : "marker",
      sizeUnits: "meters",
      sizeMinPixels: PIN_SIZE,
    });

    return [layer];
  };

  const handlePopupClick = (e) => {
    // Don't show a popup if hovering over the current (searched) location
    console.log("HANDLING POPUP CLICK");
    console.log(`Click location (${e.x},${e.y})`);
    console.log(`Lnglat: (${e.lngLat[0]}, ${e.lngLat[1]})`);
    console.log(`Index: (${e.index})`);
    console.log(`Num resources: ${resources.length}`);
    console.log(e);
    if (e.object && e.object.location.type !== "Center") {
      console.log("has an object of index:");
      console.log(e.index);
      selectMapResource(resources[e.index]._id);
    } else {
      console.log("POPUP CLICK REGISTERED AS CLEAR");

      clearMapResource();
    }
  };

  const handleHover = ({ picked }) => {
    setHovered(picked);
  };

  const getCursor = ({ isDragging }) => {
    if (hovered) {
      return "pointer";
    }
    return isDragging ? "grabbing" : "grab";
  };

  return (
    <DeckGL
      layers={getLayers()}
      initialViewState={INITIAL_VIEW_STATE}
      onViewStateChange={_onViewportChange}
      viewState={viewport}
      controller={{ dragRotate: false, doubleClickZoom: false }}
      onClick={handlePopupClick}
      onHover={handleHover}
      getCursor={getCursor}
      ContextProvider={MapContext.Provider}
    >
      <StaticMap
        width="100%"
        height="100vh"
        mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
        reuseMap
        preventStyleDiffing
      ></StaticMap>
      <Popup></Popup>
    </DeckGL>
  );
};

const mapStateToProps = (state) => ({
  resources: mappableResourceSelector(state),
  center: state.map.center,
});

const mapDispatchToProps = {
  selectMapResource,
  clearMapResource,
};
export default connect(mapStateToProps, mapDispatchToProps)(Map);
