import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Button } from "reactstrap";
import AdminView from "../../components/Auth/AdminView";
import SearchBar from "./SearchBar";
import { openResourceModal } from "../../redux/actions/modal";
import { tagFilteredResourceSelector } from "../../redux/selectors/resource";
import "./styles.scss";
import { getTags } from "../../utils/api";
import ResourceLabels from "./ResourceLabels";
import ResourceList from "./ResourceList";

const ResourceManager = ({ openResourceModal, resources }) => {
  useEffect(() => {
    document.title = "Directory View - Life After Hate";
    getTags();
  }, []);

  return (
    <div className="directory">
      <div className="container-fluid">
        <div className="manager-header row">
          <div className="col text-center text-sm-left mb-3 mb-sm-0">
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
          {resources.length > 0 && (
            <label id="result-count" className="mb-2">
              {resources.length} result{resources.length !== 1 && `s`}
            </label>
          )}
          <ResourceLabels resources={resources} />
          <ResourceList resources={resources} />
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

ResourceManager.propTypes = {
  openResourceModal: PropTypes.func,
  resources: PropTypes.arrayOf(PropTypes.object),
};

export default connect(MapStateToProps, mapDispatchToProps)(ResourceManager);
