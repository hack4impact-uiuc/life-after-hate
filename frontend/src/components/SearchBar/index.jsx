import React, { Component } from "react";
import { Button } from "reactstrap";

import ResourceCard from "../../components/ResourceCard";
import "./styles.scss";

class Search extends Component {
  constructor(props) {
    super(props);
    this.state = { value: "", showResults: false };
  }

  renderCards = card => <ResourceCard title={card.title} text={card.text} />;

  handleSubmit = e => {
    this.setState({ showResults: true });
    e.preventDefault();
  };

  render() {
    return (
      <div className="FixedHeightContainer">
        <div className="searchContent">
          <div className="searchBar">
            <form onSubmit={this.handleSubmit}>
              <label>
                <input className="searchInput" type="text" />
              </label>
              <Button className="submitSearch" color="info">
                Search
              </Button>{" "}
            </form>
          </div>
        </div>
        <div className="cardContent">
          {this.state.showResults &&
            this.props.searchResults.map(this.renderCards)}
        </div>
      </div>
    );
  }
}

export default Search;
