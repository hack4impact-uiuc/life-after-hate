import React, { Component } from "react";
import { Button } from "reactstrap";
import Modal from "../../../components/Modal";

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
      <div className="card-wrapper">
        <p>Resource Name</p>
        <p>Resource Location</p>
        <p>Resource Tags</p>
        <Button color="info" onClick={this.toggleModal}>
          Edit
        </Button>
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
