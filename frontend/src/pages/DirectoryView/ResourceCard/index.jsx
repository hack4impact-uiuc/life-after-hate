import React, { Component } from "react";
import { Button } from "reactstrap";
import { connect } from "react-redux";
import { openModal } from "../../../redux/actions/modal";
import Edit from "../../../assets/images/edit.svg";
import "../styles.scss";

class ResourceCard extends Component {
  state = {
    showModal: false,
    cardClicked: false
  };

  toggleModal = event => {
    event.stopPropagation();
    this.props.openModal({ resourceId: this.props.resource._id });
  };

  toggleViewOnlyModal = event => {
    event.stopPropagation();
    this.props.openModal({
      resourceId: this.props.resource._id,
      editable: false
    });
  };

  render() {
    return (
      <div
        className="card-click"
        role="button"
        tabIndex="0"
        onClick={this.toggleViewOnlyModal}
        onKeyPress={this.toggleViewOnlyModal}
      >
        <div className="card-wrapper">
          <div className="col">
            <p>{this.props.resource.companyName}</p>
          </div>
          <div className="col">
            <p>{this.props.resource.address}</p>
          </div>
          <div className="col">
            <p>{this.props.resource.contactEmail}</p>
          </div>
          <div className="col col-desc col-desc-collapsed">
            <p>{this.props.resource.description}</p>
          </div>
          <div className="col col-edit">
            <Button onClick={this.toggleModal} className="edit-button">
              <img id="edit-icon" src={Edit} alt="edit icon" />
              Edit
            </Button>
          </div>
        </div>
        {/* <Modal
          toggleModal={
            this.state.cardClicked ? this.toggleCardModal : this.toggleModal
          }
          cardClicked={this.state.cardClicked}
          showModal={this.state.showModal}
          modalName={
            this.state.cardClicked
              ? this.props.resource.companyName
              : "Edit Resource"
          }
          id={this.props.resource._id}
          companyName={this.props.resource.companyName}
          resourceContact={this.props.resource.contactName}
          resourcePhone={this.props.resource.contactPhone}
          resourceEmail={this.props.resource.contactEmail}
          resourceDescription={this.props.resource.description}
          resourceAddress={this.props.resource.address}
          resourceNotes={this.props.resource.notes}
        /> */}
      </div>
    );
  }
}

const mapDispatchToProps = {
  openModal
};

export default connect(
  null,
  mapDispatchToProps
)(ResourceCard);
