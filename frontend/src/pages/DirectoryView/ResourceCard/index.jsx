import React from "react";
import PropTypes from "prop-types";
import { Button } from "reactstrap";
import { connect } from "react-redux";
import AdminView from "../../../components/Auth/AdminView";
import { openResourceModalWithPayload } from "../../../redux/actions/modal";

import { distanceToString } from "../../../utils/formatters";
import {
  resourceName,
  resourceDescription,
} from "../../../redux/selectors/resource";
import "../styles.scss";
import "./styles.scss";

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
        <span
          className={`resource-type-dot resource-type-dot--${resource.type.toLowerCase()}`}
          aria-hidden="true"
        />
        <div className="col resource-name">
          <p data-cy="card-companyName">{resourceName(resource)}</p>
          <span className="resource-type-label">
            {resource.type === "TANGIBLE" ? "Resource" : resource.type}
          </span>
        </div>
        <div className="col resource-location">
          <p data-cy="card-address">{resource.address}</p>
          {"distanceFromSearchLoc" in resource && (
            <p data-cy="card-distance" className="card-distance">
              {distanceToString(resource.distanceFromSearchLoc)}
            </p>
          )}
        </div>
        <div className="col resource-tags">
          {(resource.tags || []).slice(0, 3).map((tag) => (
            <span className="resource-tag" key={tag}>
              {tag}
            </span>
          ))}
          {resource.tags?.length > 3 && (
            <span
              className="resource-tag resource-tag-more"
              title={resource.tags.slice(3).join(", ")}
            >
              +{resource.tags.length - 3}
            </span>
          )}
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
};

export default connect(null, mapDispatchToProps)(ResourceCard);
