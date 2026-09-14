import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { sortFieldEnum } from "../../../utils/enums";
import { updateSort } from "../../../redux/actions/sort";

const ResourceLabels = ({ sort, updateSort, resources }) => {
  const sortIcon = (field) => {
    if (field === sort.field) {
      return sort.order === "asc" ? <>&#9660;</> : <>&#9650;</>;
    }
    return null;
  };

  return (
    resources.length > 0 && (
      <div className="resource-toolbar">
        <div className="mobile-sort">
          <select
            aria-label="Sort resources"
            value={sort.field || ""}
            onChange={(event) => updateSort(event.target.value)}
          >
            <option value="" disabled>
              Sort resources
            </option>
            {Object.values(sortFieldEnum).map((field) => (
              <option key={field} value={field}>
                {field.charAt(0) + field.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
          <button
            type="button"
            aria-label="Change sort order"
            disabled={!sort.field}
            onClick={() => updateSort(sort.field)}
          >
            {sort.order === "desc" ? "↓" : "↑"}
          </button>
        </div>
        <div className="resource-labels">
          {[
            ["Resource", sortFieldEnum.RESOURCE_NAME],
            ["Location", sortFieldEnum.LOCATION],
            ["Tags", null],
            ["Description", sortFieldEnum.DESCRIPTION],
            ["Availability", sortFieldEnum.AVAILABILITY],
          ].map(([label, field]) => (
            <div key={label}>
              {field ? (
                <button
                  type="button"
                  className="resource-label"
                  onClick={() => updateSort(field)}
                  aria-label={`Sort by ${label.toLowerCase()}`}
                >
                  {label} {sortIcon(field)}
                </button>
              ) : (
                <span>Tags</span>
              )}
            </div>
          ))}
          <span aria-hidden="true" />
        </div>
      </div>
    )
  );
};

const mapStateToProps = (state) => ({ sort: state.sort });

const mapDispatchToProps = { updateSort };

ResourceLabels.propTypes = {
  sort: PropTypes.shape({
    field: PropTypes.oneOf(Object.values(sortFieldEnum)),
    order: PropTypes.string,
  }),
  updateSort: PropTypes.func.isRequired,
  resources: PropTypes.arrayOf(PropTypes.object),
};

export default connect(mapStateToProps, mapDispatchToProps)(ResourceLabels);
