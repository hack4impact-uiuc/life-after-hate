import React, { Component } from "react";
import StaticMap, { Popup, FlyToInterpolator } from "react-map-gl";

import { filterAndRefreshResource } from "../../utils/api";
import ResourceCard from "./ResourceCard";
import Search from "./SearchBar";
import Modal from "../../components/Modal";
import "./styles.scss";
import DeckGL from "@deck.gl/react";
import { IconLayer } from "@deck.gl/layers";
import MarkerImg from "../../assets/images/marker-atlas.png";
import MaximizeImg from "../../assets/images/maximize-white.svg";

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
      cardCache: [],
      showSearchSuggestions: true,
      showModal: false,
      modalResource: null
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
      getIcon: d =>
        d.location.type === "Center" ? "currentLocation" : "marker",
      sizeUnits: "meters",
      sizeMinPixels: pinSize
    });

    return [layer];
  };
  closeCard = () => {
    this.setState(state => ({
      selectedIdx: -1,
      cardCache: state.searchResults.map(this.renderCards(-1))
    }));
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
      closeCard={this.closeCard}
      toggleModal={this.toggleModal}
    />
  );

  searchHandler = async () => {
    let resources, center;
    try {
      ({ resources, center } = await filterAndRefreshResource(
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
      showSearchSuggestions: false,
      cardCache: resources.map(this.renderCards(-1))
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

  toggleModal = idx => {
    this.setState(prevState => ({
      showModal: !prevState.showModal,
      modalResource:
        prevState.showModal === false ? prevState.searchResults[idx] : null
    }));
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
              {this.state.searchResults && this.state.cardCache}
            </div>
          )}
        </div>
        <DeckGL
          layers={this.getLayers()}
          initialViewState={INITIAL_VIEW_STATE}
          onViewStateChange={this._onViewportChange}
          viewState={this.state.viewport}
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
                  <button
                    tabIndex="0"
                    className="popup-max"
                    onClick={() =>
                      this.toggleModal(this.state.popup.idxInResults)
                    }
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
        {this.state.showModal && (
          <Modal
            toggleModal={this.toggleModal}
            cardClicked={true}
            showModal={this.state.showModal}
            modalName={this.state.modalResource.companyName}
            companyName={this.state.modalResource.companyName}
            resourceContact={this.state.modalResource.contactName}
            resourcePhone={this.state.modalResource.contactPhone}
            resourceEmail={this.state.modalResource.contactEmail}
            resourceDescription={this.state.modalResource.description}
            resourceAddress={this.state.modalResource.address}
            resourceNotes={this.state.modalResource.notes}
          />
        )}
      </div>
    );
  }
}

export default MapView;
