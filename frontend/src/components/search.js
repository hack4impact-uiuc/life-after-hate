import React from "react";
import "./../styles/search.scss";

class Search extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: "" };
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          <input
            className="searchInput"
            type="text"
            value={this.state.value}
            onChange={this.handleChange}
          />
        </label>
        <input className="submitSearch" type="submit" />
      </form>
    );
  }
}

export default Search;
