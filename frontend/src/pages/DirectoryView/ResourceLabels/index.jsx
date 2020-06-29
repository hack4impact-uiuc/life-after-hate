import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import AdminView from "../../../components/Auth/AdminView";
import { sortFieldEnum } from "../../../utils/enums";
import { CSVExporter } from "../../../components/CSVExporter/CSVExporter";
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
      <div className="resource-labels row">
        <div
          className="col my-auto"
          onClick={() => updateSort(sortFieldEnum.RESOURCE_NAME)}
        >
          <h3 className="resource-label">
            Resource Name {sortIcon(sortFieldEnum.RESOURCE_NAME)}
          </h3>
        </div>
        <div
          className="col d-none d-md-block my-auto"
          onClick={() => updateSort(sortFieldEnum.LOCATION)}
        >
          <h3 className="resource-label">
            Location {sortIcon(sortFieldEnum.LOCATION)}
          </h3>
        </div>
        <div
          className="col d-none d-sm-block my-auto"
          onClick={() => updateSort(sortFieldEnum.VOLUNTEER_ROLE)}
        >
          <h3 className="resource-label">
            Volunteer Role {sortIcon(sortFieldEnum.VOLUNTEER_ROLE)}
          </h3>
        </div>
        <div
          className="col my-auto"
          onClick={() => updateSort(sortFieldEnum.DESCRIPTION)}
        >
          <h3 className="resource-label">
            Description {sortIcon(sortFieldEnum.DESCRIPTION)}
          </h3>
        </div>
        <div
          className="col my-auto d-none d-sm-block"
          onClick={() => updateSort(sortFieldEnum.AVAILABILITY)}
        >
          <h3 className="resource-label">
            Availability {sortIcon(sortFieldEnum.AVAILABILITY)}
          </h3>
        </div>
        <AdminView>
          <div className="col">
            <CSVExporter data={resources}></CSVExporter>
          </div>
        </AdminView>
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
};

export default connect(mapStateToProps, mapDispatchToProps)(ResourceLabels);
