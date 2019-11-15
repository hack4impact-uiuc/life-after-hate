import React, { Component } from "react";
import { Button } from "reactstrap";
import ResourceCard from "./ResourceCard";
import Modal from "../../components/Modal";

import "./styles.scss";

class ResourceManager extends Component {
  state = {
    showModal: false
  };

  toggleModal = () => {
    this.setState({
      showModal: !this.state.showModal
    });
  };

  render() {
    return (
      <div className="ResourceManager">
        <div className="manager-header">
          <h1>Resource Management</h1>
          <Button color="info" onClick={this.toggleModal} id="add-button">
            Add Resource
          </Button>
        </div>

        <div className="resources">
          <div className="resource-labels">
            <div>
              <h3>RESOURCE NAME</h3>
            </div>
            <div>
              <h3>LOCATION</h3>
            </div>
            <div>
              <h3>POINT OF CONTACT</h3>
            </div>
            <div>
              <h3>DESCRIPTION</h3>
            </div>
            <div />
          </div>
          <ResourceCard />
          <ResourceCard />
          <ResourceCard />
          <ResourceCard />
        </div>
        <Modal
          toggleModal={this.toggleModal}
          showModal={this.state.showModal}
          modalName="Add Resource"
        />
      </div>
    );
  }
}

export default ResourceManager;
