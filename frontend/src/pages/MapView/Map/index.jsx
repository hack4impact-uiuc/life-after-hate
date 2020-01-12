import React, { useState } from "react";
import StaticMap, { Popup } from "react-map-gl";
import DeckGL from "@deck.gl/react";
import { connect } from "react-redux";
import { resourceSelector } from "../../../redux/selectors/resource";
import { IconLayer } from "@deck.gl/layers";
import MaximizeImg from "../../../assets/images/maximize-white.svg";
import MarkerImg from "../../../assets/images/marker-atlas.png";
const pinSize = 45;

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
  // Mapping used for IconAtlas, which is not really being used fully currently,
  // As we're only rendering two types of icons: searched location and regular marker

  const [viewport, setViewport] = useState(INITIAL_VIEW_STATE);

  const _onViewportChange = ({ viewState }) => {
    setViewport(viewState);
  };

  // const _goToViewport = ({ longitude, latitude }) => {
  //   _onViewportChange({
  //     viewState: {
  //       longitude,
  //       latitude,
  //       zoom: 8,
  //       transitionInterpolator: new FlyToInterpolator({ speed: 2 }),
  //       transitionDuration: 2000
  //     }
  //   });
  // };

  const getLayers = () => {
    const data = [
      ...props.resources,
      {
        location: { type: "Center", coordinates: props.center }
      }
    ];
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
        if (e.object && e.object.location.type !== "Center") {
          // Don't show a popup if hovering over the current (searched) location
          this.setState({ popup: { ...e.object, idxInResults: e.index } });
        } else {
          this.setState({ popup: null });
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
        {false && (
          <Popup
            latitude={this.state.popup.location.coordinates[1]}
            longitude={this.state.popup.location.coordinates[0]}
            tipSize={5}
            closeOnClick={false}
            dynamicPosition={true}
            offsetTop={-27}
            captureScroll={false}
            onClose={() => this.setState({ popup: null })}
          >
            <div className="popup">
              <div className="popup-title">{this.state.popup.companyName}</div>
              {this.state.popup.distanceFromSearchLoc && (
                <div className="popup-distance">
                  {Math.round(this.state.popup.distanceFromSearchLoc * 10) / 10}{" "}
                  miles away
                </div>
              )}
              <div className="popup-desc">{this.state.popup.description}</div>
              <button
                tabIndex="0"
                className="popup-max"
                onClick={() => this.toggleModal(this.state.popup.idxInResults)}
              >
                See More{" "}
                <img
                  src={MaximizeImg}
                  alt="icon"
                  className="popup-button-icon"
                />
              </button>
            </div>
          </Popup>
        )}
      </StaticMap>
    </DeckGL>
  );
};

const mapStateToProps = state => ({
  resources: resourceSelector(state),
  center: state.map.center
});

export default connect(mapStateToProps)(Map);
