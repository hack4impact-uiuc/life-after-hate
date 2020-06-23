import React from "react";
import { Button } from "reactstrap";
import { connect } from "react-redux";
import AdminView from "../../../components/Auth/AdminView";
import { openResourceModalWithPayload } from "../../../redux/actions/modal";
import Edit from "../../../assets/images/pencil-edit-button-black.svg";
import { distanceToString } from "../../../utils/formatters";
import {
  resourceName,
  resourceDescription,
} from "../../../redux/selectors/resource";
import "../styles.scss";

const ResourceCard = ({ resource, openResourceModalWithPayload, style }) => {
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

  return (
    <div className="card-wrap" style={style}>
      <div
        className="card-click row card-wrapper"
        role="button"
        tabIndex="0"
        onClick={toggleViewOnlyModal}
        onKeyPress={toggleViewOnlyModal}
      >
        <div className="col">
          <p data-cy="card-companyName">{resourceName(resource)}</p>
        </div>
        <div className="col d-none d-md-block">
          <p data-cy="card-address">{resource.address}</p>
          {"distanceFromSearchLoc" in resource && (
            <p data-cy="card-distance" className="card-distance">
              {distanceToString(resource.distanceFromSearchLoc)}
            </p>
          )}
        </div>
        <div className="col d-none d-sm-block">
          <p>{resource.volunteerRoles}</p>
        </div>
        <div className="col col-desc col-desc-collapsed">
          <p>{resourceDescription(resource)}</p>
        </div>
        <div className="col col-desc col-desc-collapsed d-none d-sm-block">
          <p>{resource.availability}</p>
        </div>
        <AdminView>
          <div className="col col-edit">
            <Button
              onClick={toggleModal}
              className="edit-button"
              color="transparent"
            >
              <img id="edit-icon" src={Edit} alt="edit icon" />
              Edit
            </Button>
          </div>
        </AdminView>
      </div>
    </div>
  );
};

const mapDispatchToProps = {
  openResourceModalWithPayload,
};

export default connect(null, mapDispatchToProps)(ResourceCard);
