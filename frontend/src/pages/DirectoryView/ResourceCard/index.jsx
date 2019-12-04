import React, { Component } from "react";
import { Button } from "reactstrap";
import Modal from "../../../components/Modal";

import { editResource } from "../../../utils/api";
import Edit from "../../../assets/images/edit.svg";
import "../styles.scss";

class ResourceCard extends Component {
  state = {
    showModal: false
  };

  toggleModal = () => {
    this.setState(prevState => ({
      showModal: !prevState.showModal
    }));
  };

  handleEditResource = async event => {
    const formData = {
      companyName: event.target[0].value,
      contactName: event.target[1].value,
      contactPhone: event.target[2].value,
      contactEmail: event.target[3].value,
      description: event.target[4].value,
      address: event.target[5].value,
      location: {
        coordinates: [-88.2434, 40.1164]
      }
    };

    // Remove non-empty string fields from the object
    const filteredData = Object.keys(formData).reduce((accum, key) => {
      if (formData[key] !== "") {
        accum[key] = formData[key];
      }
      return accum;
    }, {});

    try {
      await editResource(filteredData, this.props.id);
      await this.props.updateResource();
    } catch (error) {
      console.error(error);
    }
  };

  render() {
    return (
      <div>
        <div className="card-wrapper">
          <div className="col">
            <p>{this.props.name}</p>
          </div>
          <div className="col">
            <p>{this.props.location}</p>
          </div>
          <div className="col">
            <p>{this.props.contact}</p>
          </div>
          <div className="col">
            <p>{this.props.description}</p>
          </div>
          <div className="col">
            <Button onClick={this.toggleModal} className="edit-button">
              <img id="edit-icon" src={Edit} alt="edit icon" />
              Edit
            </Button>
          </div>
        </div>
        <Modal
          toggleModal={this.toggleModal}
          showModal={this.state.showModal}
          modalName="Edit Resource"
          handleSubmit={this.handleEditResource}
        />
      </div>
    );
  }
}

export default ResourceCard;
