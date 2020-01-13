import React from "react";
import "./styles.scss";
import Maximize from "../../../assets/images/maximize.svg";
import { connect } from "react-redux";
import {
  selectMapResource,
  clearMapResource
} from "../../../redux/actions/map";
import { openModalWithPayload } from "../../../redux/actions/modal";

// Using PureComponent to reduce re-rendering since this is a pure function
const ResourceCard = ({
  resource,
  isSelected,
  selectMapResource,
  openModalWithPayload,
  clearMapResource,
  myRef
}) => {
  const renderTags = tag => <div className="card-tag">{tag}</div>;
  return (
    <div className="resource-card" ref={myRef}>
      <div className={isSelected ? "expanded" : "collapsed"}>
        <div className="clearfix">
          <div
            className="card-title"
            role="button"
            tabIndex="0"
            onClick={() => selectMapResource(resource._id)}
            onKeyPress={() => "noop"}
          >
            {resource.companyName}
          </div>
          <div
            className="card-maximize"
            role="button"
            tabIndex="0"
            onKeyPress={() => "noop"}
            onClick={() => openModalWithPayload({ resourceId: resource._id })}
          >
            <img src={Maximize} alt="Maximize" className="maximize-icon" />
          </div>
        </div>
        <div
          role="button"
          tabIndex="0"
          onClick={() => selectMapResource(resource._id)}
          onKeyPress={() => "noop"}
          className="card-wrap"
        >
          {resource.distanceFromSearchLoc && (
            <div className="card-distance">
              {Math.round(resource.distanceFromSearchLoc * 10) / 10} miles away
            </div>
          )}

          <div className="card-desc">{resource.description}</div>

          <div className="card-details">
            <div className="detail-section">
              <p className="detail-title">Point of Contact</p>
              <p className="detail-content">{resource.contactName}</p>
              <a
                className="detail-content"
                href={`mailto:${resource.contactEmail}`}
              >
                {resource.contactEmail}
              </a>
              <p className="detail-content">Phone: {resource.contactPhone}</p>
            </div>

            <div className="detail-section">
              <p className="detail-title">Address</p>
              <p className="detail-content">{resource.address}</p>
            </div>

            <div className="detail-section">
              <p className="detail-title">Notes</p>
              <p className="detail-content">{resource.notes}</p>
            </div>
          </div>

          <div className="card-tags">{resource.tags.map(renderTags)}</div>
        </div>
        <button tabIndex="0" className="card-close" onClick={clearMapResource}>
          Close
        </button>
      </div>
    </div>
  );
};
const mapDispatchToProps = {
  selectMapResource,
  openModalWithPayload,
  clearMapResource
};

export default connect(
  null,
  mapDispatchToProps
)(ResourceCard);
