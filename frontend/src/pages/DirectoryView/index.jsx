import React, { Component } from "react";
import { connect } from "react-redux";
import { Button } from "reactstrap";
import ResourceCard from "./ResourceCard";
import SearchBar from "./SearchBar";
import { openModal } from "../../redux/actions/modal";
import "./styles.scss";
import { getSearchResults, refreshAllResources } from "../../utils/api";

class ResourceManager extends Component {
  async componentDidMount() {
    await refreshAllResources();
  }

  handleSearch = async () => {
    let searchResults;
    try {
      ({ resources: searchResults } = await getSearchResults(
        this.state.keywordInput,
        this.state.locationInput,
        this.state.tagInput
      ));
    } catch (error) {
      console.error(error);
      alert(error);
    }

    this.setState({
      searchResults: searchResults,
      showSearchResults: true
    });
    await this.updateResources();
  };

  onChangeKeyword = input => {
    this.setState({
      keywordInput: input
    });
  };

  onChangeLocation = input => {
    this.setState({
      locationInput: input
    });
  };

  onChangeTag = input => {
    this.setState({
      tagInput: input
    });
  };

  renderCards = resource => (
    <ResourceCard
      key={resource._id}
      resource={resource}
      updateResources={this.updateResources}
    />
  );

  render() {
    return (
      <div className="directory">
        <div className="manager-header">
          <h1>Resource Directory</h1>
          <Button onClick={this.props.openModal} id="add-button">
            Add Resource
          </Button>
        </div>

        <div className="resources">
          <SearchBar
            handleSearch={this.handleSearch}
            onChangeKeyword={this.onChangeKeyword}
            onChangeLocation={this.onChangeLocation}
            onChangeTag={this.onChangeTag}
          />
          <div className="resource-labels clearfix">
            <div className="col">
              <h3>Resource Name</h3>
            </div>
            <div className="col">
              <h3>Location</h3>
            </div>
            <div className="col">
              <h3>Point of Contact</h3>
            </div>
            <div className="col">
              <h3>Description</h3>
            </div>
            <div />
          </div>
          {this.props.resources && this.props.resources.map(this.renderCards)}
        </div>
      </div>
    );
  }
}

const MapStateToProps = state => ({
  resources: state.resources
});

const mapDispatchToProps = {
  openModal
};

export default connect(
  MapStateToProps,
  mapDispatchToProps
)(ResourceManager);
