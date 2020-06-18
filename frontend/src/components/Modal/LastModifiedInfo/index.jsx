import React from "react";
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

export default LastModifiedInfo;
