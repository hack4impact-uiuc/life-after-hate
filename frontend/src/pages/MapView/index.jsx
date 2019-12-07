import React, { Component } from "react";
import StaticMap, { Popup } from "react-map-gl";

import { getSearchResults } from "../../utils/api";
import ResourceCard from "../../components/ResourceCard";
import Search from "../../components/SearchBar";
import "./styles.scss";
import DeckGL from "@deck.gl/react";
import { IconLayer } from "@deck.gl/layers";
import MarkerImg from "../../assets/images/marker.png";

const pinSize = 45;
const searchSuggestions = [];
// Mapping used for IconAtlas, which is not really being used fully currently,
// As we're only rendering one type of custom icon for all points of interest
const mapping = {
  marker: {
    x: 0,
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
      showResults: false,
      searchSuggestions: [],
      showSearchSuggestions: true
    };
  }

  getLayers = () => {
    const data = this.state.searchResults;
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
      getIcon: () => "marker",
      sizeUnits: "meters",
      sizeMinPixels: pinSize
    });

    return [layer];
  };
  renderCards = card => (
    <ResourceCard
      name={card.companyName}
      description={card.description}
      tags={card.tags}
      contactName={card.contactName}
      contactPhone={card.contactPhone}
      contactEmail={card.contactEmail}
      address={card.address}
      notes={card.notes}
      distanceFromSearchLoc={card.distanceFromSearchLoc}
    />
  );

  searchHandler = async () => {
    let searchResults;
    try {
      searchResults = await getSearchResults(
        this.state.inputValue,
        this.state.locationValue
      );
    } catch (error) {
      console.error(error);
      alert(error);
    }

    this.setState({
      searchResults,
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
                this.state.searchResults.map(this.renderCards)}
            </div>
          )}
        </div>
        <DeckGL
          layers={this.getLayers()}
          initialViewState={INITIAL_VIEW_STATE}
          controller={{ dragRotate: false }}
          onHover={e => {
            this.setState({ popup: e.object });
          }}
        >
          <StaticMap
            {...this.state.viewport}
            width="100%"
            height="100vh"
            onViewportChange={viewport => this.setState({ viewport })}
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
