import React, { Component } from "react";

import SearchIcon from "../../assets/images/search.svg";
import "./styles.scss";

class Search extends Component {
  handleChange = e => {
    this.props.changeHandler(e.target.value);
  };

  handleLocationChange = e => {
    this.props.locationChangeHandler(e.target.value);
  };

  handleSubmit = e => {
    this.props.searchHandler();
    e.preventDefault();
  };

  handleSuggestionClick = suggestion => {
    this.props.changeHandler(suggestion);
    this.props.searchHandler();
  };

  renderSuggestions = suggestion => (
    <tr onClick={() => this.handleSuggestionClick(suggestion)}>{suggestion}</tr>
  );

  render() {
    return (
      <div className="search">
        <form onSubmit={this.handleSubmit}>
          <div className="searchLocation">
            <input
              className="locationInput"
              type="text"
              value={this.props.locationValue}
              onChange={this.handleLocationChange}
              placeholder="Location"
            />
          </div>
          <div className="searchKeyword">
            <img className="searchIcon" src={SearchIcon} alt="Search" />
            <input
              className="searchInput"
              type="text"
              value={this.props.inputValue}
              onChange={this.handleChange}
              list="suggestionsList"
              placeholder="Search"
            />
            <table className="dropdownStyle">
              {this.props.showSearchSuggestions &&
                this.props.searchSuggestions &&
                this.props.searchSuggestions.map(this.renderSuggestions)}
            </table>
            <button className="submitSearch" type="submit">
              Go
            </button>
          </div>
        </form>
      </div>
    );
  }
}

export default Search;
