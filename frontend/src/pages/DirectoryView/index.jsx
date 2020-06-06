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
      <div className="manager-header">
        <h1>Resource Directory</h1>
        {role === roleEnum.ADMIN && (
          <Button onClick={openResourceModal} id="add-button">
            Add Resource
          </Button>
        )}
      </div>

      <div className="resources">
        <SearchBar />
        <div className="resource-labels clearfix">
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
            onClick={() => updateSort(sortFieldEnum.DESCRIPTION)}
          >
            <h3>Description {sortIcon(sortFieldEnum.DESCRIPTION)}</h3>
          </div>
          <div />
        </div>
        {resources && resources.map(renderCards)}
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
