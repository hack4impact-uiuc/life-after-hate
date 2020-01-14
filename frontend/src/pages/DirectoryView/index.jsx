import React, { useEffect } from "react";
import { connect } from "react-redux";
import { Button } from "reactstrap";
import ResourceCard from "./ResourceCard";
import SearchBar from "./SearchBar";
import { openModal } from "../../redux/actions/modal";
import { resourceSelector } from "../../redux/selectors/resource";
import "./styles.scss";
import { refreshAllResources } from "../../utils/api";

const ResourceManager = props => {
  useEffect(() => {
    refreshAllResources();
  }, []);

  const renderCards = resource => (
    <ResourceCard key={resource._id} resource={resource} />
  );

  return (
    <div className="directory">
      <div className="manager-header">
        <h1>Resource Directory</h1>
        <Button onClick={props.openModal} id="add-button">
          Add Resource
        </Button>
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
        {props.resources && props.resources.map(renderCards)}
      </div>
    </div>
  );
};

const MapStateToProps = state => ({
  resources: resourceSelector(state)
});

const mapDispatchToProps = {
  openModal
};

export default connect(
  MapStateToProps,
  mapDispatchToProps
)(ResourceManager);
