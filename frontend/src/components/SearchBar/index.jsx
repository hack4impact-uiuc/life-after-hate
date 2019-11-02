import React, { Component } from "react";
import { Button } from "reactstrap";

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
        <label>
          <input
            className="searchInput"
            type="text"
            value={this.props.inputValue}
            onChange={this.handleChange}
            list="suggestionsList"
          />
          <table className="dropdownStyle">
            {this.props.searchSuggestions &&
              this.props.searchSuggestions.map(this.renderSuggestions)}
          </table>
        </label>
        <Button className="submitSearch" color="info">
          Search
        </Button>
      </form>
    );
  }
}

export default Search;
