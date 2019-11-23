import React, { Component } from "react";
import { Button } from "reactstrap";

import "../styles.scss";

class SearchBar extends Component {
  render() {
    return (
      <div className="searchbar-wrapper">
        <form className="search">
          <label>
            <input id="search-general" type="text" />
          </label>
          <label>
            <input id="search-location" type="text" />
          </label>
          <label>
            <input id="search-tag" type="text" />
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
