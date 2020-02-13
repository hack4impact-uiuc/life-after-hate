import React from "react";
import { Button } from "reactstrap";
import { connect } from "react-redux";
import { openModalWithPayload } from "../../../redux/actions/modal";
import Edit from "../../../assets/images/edit.svg";
import { roleEnum } from "../../../utils/enums";
import "../styles.scss";

const ResourceCard = props => {
  const toggleModal = event => {
    event.stopPropagation();
    props.openModalWithPayload({ resourceId: props.resource._id });
  };

  const toggleViewOnlyModal = event => {
    event.stopPropagation();
    props.openModalWithPayload({
      resourceId: props.resource._id,
      editable: false
    });
  };

  return (
    <div
      className="card-click"
      role="button"
      tabIndex="0"
      onClick={toggleViewOnlyModal}
      onKeyPress={toggleViewOnlyModal}
    >
      <div className="card-wrapper">
        <div className="col">
          <p>{props.resource.companyName}</p>
        </div>
        <div className="col">
          <p>{props.resource.address}</p>
        </div>
        <div className="col">
          <p>{props.resource.contactEmail}</p>
        </div>
        <div className="col col-desc col-desc-collapsed">
          <p>{props.resource.description}</p>
        </div>
        {(props.role === roleEnum.ADMIN) && <div className="col col-edit">
          <Button onClick={toggleModal} className="edit-button">
            <img id="edit-icon" src={Edit} alt="edit icon" />
            Edit
          </Button>
        </div>}
      </div>
    </div>
  );
};

const mapStateToProps = state => ({
  role: state.auth.role
})

const mapDispatchToProps = {
  openModalWithPayload
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ResourceCard);
