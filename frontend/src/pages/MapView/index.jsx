import React, { Component } from "react";
import StaticMap, { Popup, FlyToInterpolator } from "react-map-gl";

import { getSearchResults } from "../../utils/api";
import ResourceCard from "../../components/ResourceCard";
import Search from "../../components/SearchBar";
import "./styles.scss";
import DeckGL from "@deck.gl/react";
import { IconLayer } from "@deck.gl/layers";
import MarkerImg from "../../assets/images/marker-atlas.png";

const pinSize = 45;
const searchSuggestions = [];
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
      selectedIdx: -1,
      showResults: false,
      searchSuggestions: [],
      showSearchSuggestions: true
    };
  }

  _onViewportChange = ({ viewState }) => {
    this.setState({
      viewport: viewState
    });
  };

  _goToViewport = ({ longitude, latitude }) => {
    this._onViewportChange({
      viewState: {
        longitude,
        latitude,
        zoom: 8,
        transitionInterpolator: new FlyToInterpolator({ speed: 2 }),
        transitionDuration: 2000
      }
    });
  };

  selectCard = selectedIdx => {
    this.setState(state => ({
      selectedIdx,
      cardCache: state.searchResults.map(this.renderCards(selectedIdx))
    }));
    this._goToViewport({
      latitude: this.state.searchResults[selectedIdx].location.coordinates[1],
      longitude: this.state.searchResults[selectedIdx].location.coordinates[0]
    });
  };

  getLayers = () => {
    const data = this.state.markers;
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
      getIcon: d => {
        console.log(d);
        return d.location.type === "Center" ? "currentLocation" : "marker";
      },
      sizeUnits: "meters",
      sizeMinPixels: pinSize
    });

    return [layer];
  };
  renderCards = selectedIdx => (card, idx) => (
    <ResourceCard
      key={card._id}
      name={card.companyName}
      description={card.description}
      tags={card.tags}
      contactName={card.contactName}
      contactPhone={card.contactPhone}
      contactEmail={card.contactEmail}
      address={card.address}
      notes={card.notes}
      distanceFromSearchLoc={card.distanceFromSearchLoc}
      indexInList={idx}
      selectCard={this.selectCard}
      expanded={idx === selectedIdx}
      closeCard={() => this.setState({ selectedIdx: -1 })}
    />
  );

  searchHandler = async () => {
    let resources, center;
    try {
      ({ resources, center } = await getSearchResults(
        this.state.inputValue,
        this.state.locationValue
      ));
    } catch (error) {
      console.error(error);
      alert(error);
    }

    this.setState({
      searchResults: resources,
      markers: [
        ...resources,
        {
          location: { type: "Center", coordinates: center }
        }
      ],
      searchCenter: center,
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
                this.state.searchResults.map(
                  this.renderCards(this.state.selectedIdx)
                )}
            </div>
          )}
        </div>
        <DeckGL
          layers={this.getLayers()}
          initialViewState={INITIAL_VIEW_STATE}
          onViewStateChange={this._onViewportChange}
          viewState={this.state.viewport}
          controller={{ dragRotate: false }}
          onHover={e => {
            if (e.object && e.object.location.type !== "Center") {
              // Don't show a popup if hovering over the current (searched) location
              this.setState({ popup: e.object });
            } else {
              this.setState({ popup: null });
            }
          }}
        >
          <StaticMap
            width="100%"
            height="100vh"
            mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
          >
            {this.state.popup && (
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
                  <div className="popup-desc">
                    {this.state.popup.description}
                  </div>
                </div>
              </Popup>
            )}
          </StaticMap>
        </DeckGL>
      </div>
    );
  }
}

export default MapView;
