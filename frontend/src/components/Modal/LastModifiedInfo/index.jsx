import React from "react";
import PropTypes from "prop-types";
import { formatDistance } from "date-fns";

import "./styles.scss";
const LastModifiedInfo = ({ resource }) => {
  const { dateLastModified, lastModifiedUser, dateCreated } = resource;
  return (
    <label className="last-modified">
      <i>
        {dateLastModified ? "Last modified" : "Created"}
        {` ${formatDistance(
          new Date(dateLastModified ?? dateCreated),
          Date.now()
        )} `}
        ago
        {lastModifiedUser && ` by ${lastModifiedUser}`}.
      </i>
    </label>
  );
};

LastModifiedInfo.propTypes = {
  resource: PropTypes.shape({
    dateLastModified: PropTypes.string,
    lastModifiedUser: PropTypes.string,
    dateCreated: PropTypes.string,
  }).isRequired,
};

export default LastModifiedInfo;
