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

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          <input
            className="searchInput"
            type="text"
            value={this.props.input_value}
            onChange={this.handleChange}
          />
        </label>
        <Button className="submitSearch" color="info">
          Search
        </Button>
      </form>
    );
  }
}

export default Search;
