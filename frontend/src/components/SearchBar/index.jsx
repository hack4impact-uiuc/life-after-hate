import React, { Component } from "react";

import "./styles.scss";

class Search extends Component {
  handleChange = e => {
    this.props.changeHandler(e.target.value);
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
      <form onSubmit={this.handleSubmit}>
        <label className="search">
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
        </label>
        <button className="submitSearch" type="submit">
          Go
        </button>
      </form>
    );
  }
}

export default Search;
