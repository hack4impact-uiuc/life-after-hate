import React, { Component } from "react";

import { filterAndRefreshResource } from "../../utils/api";
import CardView from "./CardView";
import Search from "./SearchBar";
import Map from "./Map";
import "./styles.scss";

const searchSuggestions = [];

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

  searchHandler = async () => {
    try {
      await filterAndRefreshResource(
        this.state.inputValue,
        this.state.locationValue
      );
    } catch (error) {
      console.error(error);
      alert(error);
    }
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
          <CardView></CardView>
        </div>
        <Map></Map>
      </div>
    );
  }
}

export default MapView;
