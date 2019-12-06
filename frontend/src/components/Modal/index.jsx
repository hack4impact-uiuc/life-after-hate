import React, { Component } from "react";
import { Button, Modal, ModalHeader, ModalBody } from "reactstrap";
import Close from "../../assets/images/close.svg";
import "./styles.scss";

class LAHModal extends Component {
  handleSubmit = e => {
    e.preventDefault();
    this.props.handleSubmit(e);
  };

  handleChange = e => {
    console.log(e.target.value);
  };

  render() {
    return (
      <div className="modal-wrap-ee">
        <Modal fade={false} isOpen={this.props.showModal}>
          <ModalHeader>
            {this.props.modalName}
            <Button
              color="link"
              className="close-button"
              onClick={this.props.toggleModal}
            >
              <img id="close-image" src={Close} alt="close" />
            </Button>
          </ModalHeader>
          <ModalBody
            style={{
              "max-height": "calc(100vh - 210px)",
              "overflow-y": "auto"
            }}
          >
            <form
              onSubmit={this.handleSubmit}
              className="add-edit-resource-form"
            >
              <label className="modal-lab">
                <p>Resource Name</p>
                <input
                  type="text"
                  onChange={this.handleChange}
                  defaultValue={this.props.resourceName}
                  className="modal-input-field"
                />
              </label>
              <label className="modal-lab">
                <p>Contact Name</p>
                <input
                  type="text"
                  onChange={this.handleChange}
                  defaultValue={this.props.resourceContact}
                  className="modal-input-field"
                />
              </label>
              <label className="modal-lab">
                <p>Contact Phone</p>
                <input
                  type="text"
                  onChange={this.handleChange}
                  defaultValue={this.props.resourcePhone}
                  className="modal-input-field"
                />
              </label>
              <label className="modal-lab">
                <p>Contact Email</p>
                <input
                  type="text"
                  onChange={this.handleChange}
                  defaultValue={this.props.resourceEmail}
                  className="modal-input-field"
                />
              </label>
              <label className="modal-lab">
                <p>Description</p>
                <input
                  type="text"
                  onChange={this.handleChange}
                  defaultValue={this.props.resourceDescription}
                  className="modal-input-field"
                />
              </label>
              <label className="modal-lab">
                <p>Address</p>
                <input
                  type="text"
                  onChange={this.handleChange}
                  defaultValue={this.props.resourceAddress}
                  className="modal-input-field"
                />
              </label>
              <Button
                id="submit-form-button"
                type="submit"
                onClick={this.props.toggleModal}
              >
                Save
              </Button>
            </form>
          </ModalBody>
        </Modal>
      </div>
    );
  }
}

export default LAHModal;
