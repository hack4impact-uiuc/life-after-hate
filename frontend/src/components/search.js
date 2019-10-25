import React, { Component } from "react";
import { Button } from "reactstrap";
import "./../styles/search.scss";

class Search extends Component {
  constructor(props) {
    super(props);
    this.state = { value: "" };
  }

  render() {
    return (
      <div className="searchBar">
        <form onSubmit={this.handleSubmit}>
          <label>
            <input
              className="searchInput"
              type="text"
              value={this.state.value}
              onChange={this.handleChange}
            />
          </label>
          <Button className="submitSearch" color="info">
            Search
          </Button>{" "}
        </form>
      </div>
    );
  }
}

export default Search;
