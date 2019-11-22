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
      <div>
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
              <label>
                Resource Name
                <input type="text" onChange={this.handleChange} />
              </label>
              <label>
                Contact Name
                <input type="text" onChange={this.handleChange} />
              </label>
              <label>
                Contact Phone
                <input type="text" onChange={this.handleChange} />
              </label>
              <label>
                Contact Email
                <input type="text" onChange={this.handleChange} />
              </label>
              <label>
                Description
                <input type="text" onChange={this.handleChange} />
              </label>
              <label>
                Address
                <input type="text" onChange={this.handleChange} />
              </label>
              <Button
                id="submit-form-button"
                type="submit"
                onClick={this.props.toggleModal}
              >
                SAVE
              </Button>
            </form>
          </ModalBody>
        </Modal>
      </div>
    );
  }
}

export default LAHModal;
