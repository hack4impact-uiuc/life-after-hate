import React from "react";
import { Button } from "reactstrap";
import { connect } from "react-redux";
import { openResourceModalWithPayload } from "../../../redux/actions/modal";
import Edit from "../../../assets/images/pencil-edit-button-black.svg";
import { resourceEnum, roleEnum } from "../../../utils/enums";
import "../styles.scss";

const ResourceCard = ({ resource, role, openResourceModalWithPayload }) => {
  const toggleModal = (event) => {
    event.stopPropagation();
    openResourceModalWithPayload({ resourceId: resource._id });
  };

  const toggleViewOnlyModal = (event) => {
    event.stopPropagation();
    openResourceModalWithPayload({
      resourceId: resource._id,
      editable: false,
    });
  };

  const isIndividualResource = resource.type === resourceEnum.INDIVIDUAL;
  return (
    <div
      className="card-click row card-wrapper"
      role="button"
      tabIndex="0"
      onClick={toggleViewOnlyModal}
      onKeyPress={toggleViewOnlyModal}
    >
      <div className="col">
        <p data-cy="card-companyName">
          {isIndividualResource ? resource.contactName : resource.companyName}
        </p>
      </div>
      <div className="col">
        <p data-cy="card-address">{resource.address}</p>
      </div>
      <div className="col">
        <p>{resource.contactEmail}</p>
      </div>
      <div className="col col-desc col-desc-collapsed">
        <p>{isIndividualResource ? resource.skills : resource.description}</p>
      </div>
      {role === roleEnum.ADMIN && (
        <div className="col-2 col-edit">
          <Button
            onClick={toggleModal}
            className="edit-button"
            color="transparent"
          >
            <img id="edit-icon" src={Edit} alt="edit icon" />
            Edit
          </Button>
        </div>
      )}
    </div>
  );
};

const mapStateToProps = (state) => ({
  role: state.auth.role,
});

const mapDispatchToProps = {
  openResourceModalWithPayload,
};

export default connect(mapStateToProps, mapDispatchToProps)(ResourceCard);
