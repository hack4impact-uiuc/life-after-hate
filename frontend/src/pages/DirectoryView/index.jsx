import React, { Component } from "react";
import { Button } from "reactstrap";
import ResourceCard from "./ResourceCard";
import SearchBar from "./SearchBar";
import Modal from "../../components/Modal";

import "./styles.scss";
import { addResource, getAllResources } from "../../utils/api";

class ResourceManager extends Component {
  state = {
    showModal: false,
    resources: null
  };

  componentDidMount = async () => {
    await this.updateResources();
  };

  updateResources = async () => {
    const resources = await getAllResources();
    this.setState({
      resources: resources
    });
  };

  toggleModal = () => {
    this.setState(prevState => ({
      showModal: !prevState.showModal
    }));
  };

  handleAddResource = async event => {
    const formData = {
      companyName: event.target[0].value,
      contactName: event.target[1].value,
      contactPhone: event.target[2].value,
      contactEmail: event.target[3].value,
      description: event.target[4].value,
      address: event.target[5].value,
      location: {
        coordinates: [-88.2434, 40.1164]
      },
      notes: event.target[6].value
    };
    try {
      await addResource(formData);
      await this.updateResources();
    } catch (error) {
      console.error(error);
    }
  };

  renderCards = resource => (
    <ResourceCard resource={resource} updateResources={this.updateResources} />
  );

  render() {
    return (
      <div className="directory">
        <div className="manager-header">
          <h1>Resource Directory</h1>
          <Button onClick={this.toggleModal} id="add-button">
            Add Resource
          </Button>
        </div>

        <div className="resources">
          <SearchBar />
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
          {this.state.resources && this.state.resources.map(this.renderCards)}
        </div>
        <Modal
          toggleModal={this.toggleModal}
          showModal={this.state.showModal}
          modalName="Add Resource"
          handleSubmit={this.handleAddResource}
        />
      </div>
    );
  }
}

export default ResourceManager;
