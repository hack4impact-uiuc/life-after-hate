import React, { Component } from "react";
import { Button, Modal, ModalHeader, ModalBody } from "reactstrap";
import Close from "../../assets/images/close.svg";
import "./styles.scss";

class LAHModal extends Component {
  handleSubmit = e => {
    e.preventDefault();
    this.props.handleSubmit(e);
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
              maxHeight: "calc(100vh - 210px)",
              overflowY: "auto"
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
                  defaultValue={this.props.resourceName}
                  className="modal-input-field"
                  disabled={this.props.cardClicked}
                />
              </label>
              <label className="modal-lab">
                <p>Contact Name</p>
                <input
                  type="text"
                  defaultValue={this.props.resourceContact}
                  className="modal-input-field"
                  disabled={this.props.cardClicked}
                />
              </label>
              <label className="modal-lab">
                <p>Contact Phone</p>
                <input
                  type="text"
                  defaultValue={this.props.resourcePhone}
                  className="modal-input-field"
                  disabled={this.props.cardClicked}
                />
              </label>
              <label className="modal-lab">
                <p>Contact Email</p>
                <input
                  type="text"
                  defaultValue={this.props.resourceEmail}
                  className="modal-input-field"
                  disabled={this.props.cardClicked}
                />
              </label>
              <label className="modal-lab">
                <p>Description</p>
                <textarea
                  defaultValue={this.props.resourceDescription}
                  className="modal-input-field modal-input-textarea"
                  rows="10"
                  disabled={this.props.cardClicked}
                />
              </label>
              <label className="modal-lab">
                <p>Address</p>
                <input
                  type="text"
                  defaultValue={this.props.resourceAddress}
                  className="modal-input-field"
                  disabled={this.props.cardClicked}
                />
              </label>
              <label className="modal-lab">
                <p>Notes</p>
                <textarea
                  defaultValue={this.props.resourceNotes}
                  className="modal-input-field modal-input-textarea"
                  rows="5"
                  disabled={this.props.cardClicked}
                />
              </label>
              {this.props.cardClicked ? null : (
                <Button
                  id="submit-form-button"
                  type="submit"
                  onClick={this.props.toggleModal}
                >
                  Save
                </Button>
              )}
            </form>
          </ModalBody>
        </Modal>
      </div>
    );
  }
}

export default LAHModal;
