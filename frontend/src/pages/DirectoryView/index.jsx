import React, { useEffect } from "react";
import { connect } from "react-redux";
import { Button } from "reactstrap";
import ResourceCard from "./ResourceCard";
import SearchBar from "./SearchBar";
import { openResourceModal } from "../../redux/actions/modal";
import { clearResources } from "../../redux/actions/resources";
import { updateSort } from "../../redux/actions/sort";
import { resourceSelector } from "../../redux/selectors/resource";
import "./styles.scss";
import { roleEnum, sortFieldEnum } from "../../utils/enums";

const ResourceManager = ({
  role,
  openResourceModal,
  resources,
  clearResources,
  sort,
  updateSort,
}) => {
  useEffect(() => {
    document.title = "Directory View - Life After Hate";
    clearResources();
  }, [clearResources]);

  const renderCards = (resource) => (
    <ResourceCard key={resource._id} resource={resource} />
  );

  const sortIcon = (field) => {
    if (field === sort.field) {
      return sort.order === "asc" ? <>&#9660;</> : <>&#9650;</>;
    }
    return null;
  };

  return (
    <div className="directory">
      <div className="container-fluid">
        <div className="manager-header row">
          <div className="col mb-3 mb-sm-0">
            <h1 id="page-title">Resource Directory</h1>
          </div>

          {role === roleEnum.ADMIN && (
            <div className="col-xs-12 col-sm-4 col-md-3 col-lg-2 pl-0 pr-0">
              <Button onClick={openResourceModal} id="add-button">
                Add Resource
              </Button>
            </div>
          )}
        </div>
      </div>
      <div className="resources">
        <div className="container-fluid">
          <SearchBar />
          <div className="resource-labels row">
            <div
              className="col"
              onClick={() => updateSort(sortFieldEnum.RESOURCE_NAME)}
            >
              <h3>Resource Name {sortIcon(sortFieldEnum.RESOURCE_NAME)}</h3>
            </div>
            <div
              className="col"
              onClick={() => updateSort(sortFieldEnum.LOCATION)}
            >
              <h3>Location {sortIcon(sortFieldEnum.LOCATION)}</h3>
            </div>
            <div
              className="col"
              onClick={() => updateSort(sortFieldEnum.POINT_OF_CONTACT)}
            >
              <h3>
                Point of Contact {sortIcon(sortFieldEnum.POINT_OF_CONTACT)}
              </h3>
            </div>
            <div
              className="col"
              onClick={() => updateSort(sortFieldEnum.DESCRIPTION)}
            >
              <h3>Description {sortIcon(sortFieldEnum.DESCRIPTION)}</h3>
            </div>

            <div className="col" />
          </div>
          {resources && resources.map(renderCards)}
        </div>
      </div>
    </div>
  );
};

const MapStateToProps = (state) => ({
  resources: resourceSelector(state),
  role: state.auth.role,
  sort: state.sort,
});

const mapDispatchToProps = {
  openResourceModal,
  clearResources,
  updateSort,
};

export default connect(MapStateToProps, mapDispatchToProps)(ResourceManager);
