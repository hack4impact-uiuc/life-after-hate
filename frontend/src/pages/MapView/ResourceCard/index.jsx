import React from "react";
import "./styles.scss";
import Maximize from "../../../assets/images/expand-black.svg";
import Close from "../../../assets/images/close3.svg";
import { connect } from "react-redux";
import {
  selectMapResource,
  clearMapResource,
} from "../../../redux/actions/map";
import { openResourceModalWithPayload } from "../../../redux/actions/modal";
import ActionButtons from "../ActionButtons";
import { resourceEnum } from "../../../utils/enums";

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
  const renderTags = (tag, idx) => (
    <div className="card-tag" key={idx}>
      {tag}
    </div>
  );

  const isIndividualResource = resource.type === resourceEnum.INDIVIDUAL;
  return (
    <div className="resource-card" ref={myRef} style={style}>
      <div className={isSelected ? "expanded" : "collapsed"}>
        <div className="clearfix">
          <div
            className="card-title"
            role="button"
            tabIndex="0"
            onClick={() => selectMapResource(resource._id)}
            onKeyPress={() => "noop"}
          >
            {isIndividualResource ? resource.contactName : resource.companyName}
          </div>
          <div
            className="card-maximize"
            role="button"
            tabIndex="0"
            onKeyPress={() => "noop"}
            onClick={() =>
              openResourceModalWithPayload({
                resourceId: resource._id,
                editable: false,
              })
            }
          >
            <img src={Maximize} alt="Maximize" className="maximize-icon" />
          </div>
          <div
            className="top-card-close"
            role="button"
            tabIndex="0"
            onKeyPress={() => "noop"}
            onClick={() => clearMapResource({ resourceId: resource._id })}
          >
            <img src={Close} alt="Close" className="top-close-icon" />
          </div>
        </div>
        <div
          role="button"
          tabIndex="0"
          onClick={() => selectMapResource(resource._id)}
          onKeyPress={() => "noop"}
          className="card-wrap"
        >
          {"distanceFromSearchLoc" in resource && (
            <div className="card-distance">
              {Math.round(resource.distanceFromSearchLoc * 10) / 10} miles away
            </div>
          )}

          <div className="card-desc">
            {isIndividualResource ? resource.skills : resource.description}
          </div>

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

export default connect(null, mapDispatchToProps)(ResourceCard);
