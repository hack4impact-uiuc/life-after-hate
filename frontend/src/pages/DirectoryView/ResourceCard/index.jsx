import React from "react";
import PropTypes from "prop-types";
import { Button } from "reactstrap";
import { connect } from "react-redux";
import AdminView from "../../../components/Auth/AdminView";
import { openResourceModalWithPayload } from "../../../redux/actions/modal";
import Edit from "../../../assets/images/pencil-edit-button-black.svg";

import { distanceToString } from "../../../utils/formatters";
import {
  resourceName,
  resourceDescription,
  resourceLogo,
} from "../../../redux/selectors/resource";
import "../styles.scss";
import "./styles.scss";

const ResourceCard = ({
  resource,
  openResourceModalWithPayload,
  style,
  measure,
}) => {
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
        onKeyDown={(event) => {
          if (
            event.target === event.currentTarget &&
            ["Enter", " "].includes(event.key)
          ) {
            event.preventDefault();
            toggleViewOnlyModal(event);
          }
        }}
      >
        <div className="resource-type-logo">
          <img src={resourceLogo(resource.type)} onLoad={measure} alt=""></img>
        </div>
        <div className="col resource-name">
          <p data-cy="card-companyName">{resourceName(resource)}</p>
        </div>
        <div className="col resource-location">
          <p data-cy="card-address">{resource.address}</p>
          {"distanceFromSearchLoc" in resource && (
            <p data-cy="card-distance" className="card-distance">
              {distanceToString(resource.distanceFromSearchLoc)}
            </p>
          )}
        </div>
        <div className="col resource-role">
          <p>{resource.volunteerRoles}</p>
        </div>
        <div className="col col-desc col-desc-collapsed resource-description">
          <p>{resourceDescription(resource)}</p>
        </div>
        <div className="col col-desc col-desc-collapsed resource-availability">
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

ResourceCard.propTypes = {
  resource: PropTypes.object.isRequired,
  openResourceModalWithPayload: PropTypes.func.isRequired,
  style: PropTypes.object,
  measure: PropTypes.func.isRequired,
};

export default connect(null, mapDispatchToProps)(ResourceCard);
