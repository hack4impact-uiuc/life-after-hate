import React, { useEffect } from "react";
import { connect } from "react-redux";
import { Button } from "reactstrap";
import ResourceCard from "./ResourceCard";
import AdminView from "../../components/Auth/AdminView";
import SearchBar from "./SearchBar";
import { openResourceModal } from "../../redux/actions/modal";
import { tagFilteredResourceSelector } from "../../redux/selectors/resource";
import "./styles.scss";
import { getTags } from "../../utils/api";
import ResourceLabels from "./ResourceLabels";

const ResourceManager = ({ openResourceModal, resources }) => {
  useEffect(() => {
    document.title = "Directory View - Life After Hate";
    getTags();
  }, []);

  const renderCards = (resource) => (
    <ResourceCard key={resource._id} resource={resource} />
  );

  return (
    <div className="directory">
      <div className="container-fluid">
        <div className="manager-header row">
          <div className="col text-center text-md-left mb-3 mb-sm-0">
            <h1 id="page-title">Resource Directory</h1>
          </div>

          <AdminView>
            <div className="col-12 col-sm-4 col-md-3 col-lg-2 pl-0 pr-0">
              <Button onClick={openResourceModal} id="add-button">
                Add Resource
              </Button>
            </div>
          </AdminView>
        </div>
      </div>
      <div className="resources">
        <div className="container-fluid">
          <SearchBar />
          <ResourceLabels resources={resources} />
          {resources && resources.map(renderCards)}
        </div>
      </div>
    </div>
  );
};

const MapStateToProps = (state) => ({
  resources: tagFilteredResourceSelector(state),
});

const mapDispatchToProps = {
  openResourceModal,
};

export default connect(MapStateToProps, mapDispatchToProps)(ResourceManager);
