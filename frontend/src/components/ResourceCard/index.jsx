import React from "react";
import "./styles.scss";
import Maximize from "../../assets/images/maximize.svg";

// Using PureComponent to reduce re-rendering since this is a pure function
const ResourceCard = ({
  expanded,
  selectCard,
  closeCard,
  name,
  description,
  tags,
  contactName,
  contactPhone,
  contactEmail,
  address,
  notes,
  distanceFromSearchLoc,
  indexInList,
  toggleModal
}) => {
  const renderTags = tag => <div className="card-tag">{tag}</div>;

  return (
    <div className="resource-card">
      <div className={expanded ? "expanded" : "collapsed"}>
        <div className="clearfix">
          <div
            className="card-title"
            role="button"
            tabIndex="0"
            onClick={() => selectCard(indexInList)}
            onKeyPress=""
          >
            {name}
          </div>
          <div
            className="card-maximize"
            role="button"
            tabIndex="0"
            onKeyPress=""
            onClick={() => toggleModal(indexInList)}
          >
            <img src={Maximize} alt="Maximize" className="maximize-icon" />
          </div>
        </div>
        <div
          role="button"
          tabIndex="0"
          onClick={() => selectCard(indexInList)}
          onKeyPress=""
          className="card-wrap"
        >
          {distanceFromSearchLoc && (
            <div className="card-distance">
              {Math.round(distanceFromSearchLoc * 10) / 10} miles away
            </div>
          )}

          <div className="card-desc">{description}</div>

          <div className="card-details">
            <div className="detail-section">
              <p className="detail-title">Point of Contact</p>
              <p className="detail-content">{contactName}</p>
              <a className="detail-content" href={`mailto:${contactEmail}`}>
                {contactEmail}
              </a>
              <p className="detail-content">Phone: {contactPhone}</p>
            </div>

            <div className="detail-section">
              <p className="detail-title">Address</p>
              <p className="detail-content">{address}</p>
            </div>

            <div className="detail-section">
              <p className="detail-title">Notes</p>
              <p className="detail-content">{notes}</p>
            </div>
          </div>

          <div className="card-tags">{tags.map(renderTags)}</div>
        </div>
        <button tabIndex="0" className="card-close" onClick={closeCard}>
          Close
        </button>
      </div>
    </div>
  );
};

export default ResourceCard;
