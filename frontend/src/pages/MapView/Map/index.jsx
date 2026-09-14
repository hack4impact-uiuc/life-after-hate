import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
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
  clearMapCenter,
  updateSearchLocation,
  updateSearchQuery,
} from "../../../redux/actions/map";
import { clearResources } from "../../../redux/actions/resources";
import { ScatterplotLayer } from "@deck.gl/layers";

import "mapbox-gl/dist/mapbox-gl.css";

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

const Map = ({
  center,
  selectedId,
  resources,
  selectMapResource,
  clearMapResource,
  clearResources,
  clearMapCenter,
  updateSearchLocation,
  updateSearchQuery,
}) => {
  const [viewport, setViewport] = useState(INITIAL_VIEW_STATE);
  const [hovered, setHovered] = useState(false);
  const handleCenterChange = () => {
    if (center?.length === 2 && center.every(Number.isFinite)) {
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
  useEffect(() => {
    clearResources();
    clearMapCenter();
    updateSearchLocation("");
    updateSearchQuery("");
    setViewport(INITIAL_VIEW_STATE);
  }, [clearResources, clearMapCenter, updateSearchLocation, updateSearchQuery]);

  const _onViewportChange = ({ viewState }) => {
    setViewport(viewState);
  };

  const getMarkerPoints = () => {
    // If the location information came back correct, display on the map
    if (center?.length === 2 && center.every(Number.isFinite)) {
      return [
        ...resources,
        { location: { type: "Center", coordinates: center } },
      ];
    }
    return resources;
  };

  const getLayers = () => {
    const data = getMarkerPoints();
    const layer = new ScatterplotLayer({
      id: "resources",
      data,
      pickable: true,
      wrapLongitude: true,
      getPosition: (d) => d.location.coordinates,
      radiusUnits: "pixels",
      getRadius: (d) => (d._id && d._id === selectedId ? 13 : 7),
      stroked: true,
      getLineColor: [255, 255, 255],
      lineWidthUnits: "pixels",
      getLineWidth: 2,
      getFillColor: (d) =>
        d.location.type === "Center" || d._id === selectedId
          ? [247, 146, 48]
          : {
              GROUP: [86, 113, 170],
              INDIVIDUAL: [17, 132, 135],
              TANGIBLE: [73, 132, 87],
            }[d.type] || [86, 113, 170],
      updateTriggers: { getRadius: [selectedId], getFillColor: [selectedId] },
    });

    return [layer];
  };

  const handlePopupClick = (e) => {
    // Don't show a popup if hovering over the current (searched) location
    if (e.object && e.object.location.type !== "Center") {
      selectMapResource(resources[e.index]._id);
    } else {
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
        mapStyle={import.meta.env.VITE_MAP_STYLE || undefined}
        width="100%"
        height="100%"
        mapboxApiAccessToken={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}
        reuseMap
        preventStyleDiffing
      ></StaticMap>
    </DeckGL>
  );
};

const mapStateToProps = (state, ownProps) => ({
  resources: ownProps.resources ?? mappableResourceSelector(state),
  selectedId: state.map.selectedId,
  center: state.map.center,
});

const mapDispatchToProps = {
  selectMapResource,
  clearMapResource,
  clearResources,
  clearMapCenter,
  updateSearchLocation,
  updateSearchQuery,
};

Map.propTypes = {
  selectedId: PropTypes.string,
  center: PropTypes.arrayOf(PropTypes.number),
  resources: PropTypes.arrayOf(PropTypes.object).isRequired,
  selectMapResource: PropTypes.func.isRequired,
  clearMapResource: PropTypes.func.isRequired,
  clearResources: PropTypes.func.isRequired,
  clearMapCenter: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(Map);
