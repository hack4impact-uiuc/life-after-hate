import React, { Component } from "react";
import { Button } from "reactstrap";
import Modal from "../../../components/Modal";

import Edit from "../../../assets/images/edit.svg";
import "../styles.scss";

class ResourceCard extends Component {
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
      <div>
        <div className="card-wrapper">
          <div>
            <p>Resource Name</p>
          </div>
          <div>
            <p>Resource Location</p>
          </div>
          <div>
            <p>Contact</p>
          </div>
          <div>
            <p>Description</p>
          </div>
          <div>
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
        />
      </div>
    );
  }
}

export default ResourceCard;
