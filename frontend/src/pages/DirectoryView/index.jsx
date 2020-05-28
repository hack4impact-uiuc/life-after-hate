import React, { useEffect } from "react";
import { connect } from "react-redux";
import { Button } from "reactstrap";
import ResourceCard from "./ResourceCard";
import SearchBar from "./SearchBar";
import { openResourceModal } from "../../redux/actions/modal";
import { clearResources } from "../../redux/actions/resources";
import { resourceSelector } from "../../redux/selectors/resource";
import "./styles.scss";
import { roleEnum } from "../../utils/enums";

const ResourceManager = ({
  role,
  openResourceModal,
  resources,
  clearResources,
}) => {
  useEffect(() => {
    document.title = "Directory View - Life After Hate";
    clearResources();
  }, [clearResources]);

  const renderCards = (resource) => (
    <ResourceCard key={resource._id} resource={resource} />
  );

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
          <div className="col">
            <h3>Resource Name</h3>
          </div>
          <div className="col">
            <h3>Location</h3>
          </div>
          <div className="col">
            <h3>Point of Contact</h3>
          </div>
          <div className="col">
            <h3>Description</h3>
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
});

const mapDispatchToProps = {
  openResourceModal,
  clearResources,
};

export default connect(MapStateToProps, mapDispatchToProps)(ResourceManager);
