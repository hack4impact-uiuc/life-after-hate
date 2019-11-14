import React, { Component } from "react";
import { Input, Button } from "reactstrap";
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
        <h1>Resource Management</h1>
        <div className="toggles">
          <Input type="select" name="select" id="location_toggle">
            <option>Location 1</option>
            <option>Location 2</option>
            <option>Location 3</option>
          </Input>
          <Input type="select" name="select" id="tag_toggle">
            <option>Tag 1</option>
            <option>Tag 2</option>
            <option>Tag 3</option>
          </Input>
        </div>
        <div className="resources">
          <div className="labels">
            <h3>Name</h3>
            <h3>Location</h3>
            <h3>Tags</h3>
            <Button color="info" onClick={this.toggleModal}>
              Add Resource
            </Button>
            <Modal
              toggleModal={this.toggleModal}
              showModal={this.state.showModal}
              modalName="Add Resource"
            />
          </div>
          <ResourceCard />
        </div>
      </div>
    );
  }
}

export default ResourceManager;
