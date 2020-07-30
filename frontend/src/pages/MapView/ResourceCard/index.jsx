import React from "react";
import PropTypes from "prop-types";
import "./styles.scss";
import Maximize from "../../../assets/images/expand-black.svg";
import Close from "../../../assets/images/close3.svg";
import { connect } from "react-redux";
import { addFilterTag } from "../../../utils/api";
import {
  selectMapResource,
  clearMapResource,
} from "../../../redux/actions/map";
import { openResourceModalWithPayload } from "../../../redux/actions/modal";
import ActionButtons from "../ActionButtons";
import { distanceToString } from "../../../utils/formatters";
import {
  resourceName,
  resourceDescription,
  resourceLogo,
} from "../../../redux/selectors/resource";

// Using PureComponent to reduce re-rendering since this is a pure function
const ResourceCard = ({
  resource,
  isSelected,
  selectMapResource,
  openResourceModalWithPayload,
  clearMapResource,
  myRef,
  style,
}) => {
  const addSearchTag = (e, tag) => {
    e.stopPropagation();
    addFilterTag(tag);
  };

  const renderTags = (tag, idx) => (
    <div className="card-tag" key={idx} onClick={(e) => addSearchTag(e, tag)}>
      {tag}
    </div>
  );

  return (
    <div className="resource-card" ref={myRef} style={style}>
      <div className={isSelected ? "expanded" : "collapsed"}>
        <div
          className="card-top"
          onClick={() => {
            selectMapResource(resource._id);
          }}
        >
          <img
            src={resourceLogo(resource.type)}
            alt=""
            className="resource-type-logo"
          ></img>
          <div className="card-title">{resourceName(resource)}</div>
          <div
            className="card-maximize"
            role="button"
            tabIndex="0"
            onClick={(e) => {
              e.stopPropagation();
              openResourceModalWithPayload({
                resourceId: resource._id,
                editable: false,
              });
            }}
          >
            <img src={Maximize} alt="Maximize" className="maximize-icon" />
          </div>
          <div
            className="top-card-close"
            role="button"
            tabIndex="0"
            onClick={(e) => {
              e.stopPropagation();
              clearMapResource({ resourceId: resource._id });
            }}
          >
            <img src={Close} alt="Close" className="top-close-icon" />
          </div>
        </div>
        <div
          role="button"
          tabIndex="0"
          onClick={() => selectMapResource(resource._id)}
          className="card-wrap"
        >
          {"distanceFromSearchLoc" in resource && (
            <div className="card-distance">
              {distanceToString(resource.distanceFromSearchLoc)}
            </div>
          )}

          <div className="card-desc">{resourceDescription(resource)}</div>

          <div className="card-details">
            {resource.contactEmail && (
              <div className="detail-section">
                <p className="detail-title">Contact Info</p>
                <a
                  className="detail-content"
                  href={`mailto:${resource.contactEmail}`}
                >
                  {resource.contactEmail}
                </a>
              </div>
            )}

            {resource.websiteURL && (
              <div className="detail-section">
                <p className="detail-title">Website</p>
                <a
                  className="detail-content"
                  target="_blank"
                  rel="noreferrer noopener"
                  href={resource.websiteURL}
                >
                  {resource.websiteURL}
                </a>
              </div>
            )}

            {resource.address && (
              <div className="detail-section">
                <p className="detail-title">Address</p>
                <p className="detail-content">{resource.address}</p>
              </div>
            )}

            {resource.notes && (
              <div className="detail-section">
                <p className="detail-title">Notes</p>
                <p className="detail-content">{resource.notes}</p>
              </div>
            )}
          </div>

          <div className="card-tags">{resource.tags.map(renderTags)}</div>
        </div>
        <ActionButtons resource={resource}></ActionButtons>
      </div>
    </div>
  );
};

const mapDispatchToProps = {
  selectMapResource,
  openResourceModalWithPayload,
  clearMapResource,
};

ResourceCard.propTypes = {
  resource: PropTypes.object.isRequired,
  isSelected: PropTypes.bool,
  selectMapResource: PropTypes.func.isRequired,
  openResourceModalWithPayload: PropTypes.func.isRequired,
  clearMapResource: PropTypes.func.isRequired,
  myRef: PropTypes.elementType,
  style: PropTypes.object,
};

export default connect(null, mapDispatchToProps)(ResourceCard);
