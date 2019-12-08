import React, { Component } from "react";
import { Button } from "reactstrap";

import "../styles.scss";

class SearchBar extends Component {
  handleSubmit = e => {
    e.preventDefault();
    this.props.handleSearch();
  };

  onChangeKeyword = e => {
    this.props.onChangeKeyword(e.target.value);
  };

  onChangeLocation = e => {
    this.props.onChangeLocation(e.target.value);
  };

  onChangeTag = e => {
    this.props.onChangeTag(e.target.value);
  };

  render() {
    return (
      <div className="searchbar-wrapper">
        <form className="search" onSubmit={this.handleSubmit}>
          <label>
            <input
              id="search-general"
              type="text"
              onChange={this.onChangeKeyword}
            />
          </label>
          <label>
            <input
              id="search-location"
              type="text"
              onChange={this.onChangeLocation}
            />
          </label>
          <label>
            <input id="search-tag" type="text" onChange={this.onChangeTag} />
          </label>
          <Button
            id="search-button"
            type="submit"
            onClick={this.props.toggleModal}
          >
            SEARCH
          </Button>
        </form>
      </div>
    );
  }
}

export default SearchBar;
