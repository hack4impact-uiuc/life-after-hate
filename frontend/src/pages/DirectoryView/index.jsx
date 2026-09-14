import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import AdminView from "../../components/Auth/AdminView";
import SearchBar from "./SearchBar";
import { tagFilteredResourceSelector } from "../../redux/selectors/resource";
import { CSVExporter } from "../../components/CSVExporter/CSVExporter";
import { getTags } from "../../utils/api";
import ResourceLabels from "./ResourceLabels";
import ResourceList from "./ResourceList";
import "./styles.scss";

const ResourceManager = ({ resources, allResources, sort, isLoading }) => {
  const [density, setDensity] = useState("comfortable");
  useEffect(() => {
    document.title = "Directory View - Life After Hate";
    getTags();
  }, []);
  const recentCount = allResources.filter((resource) => {
    const created = new Date(resource.dateCreated).getTime();
    return created <= Date.now() && created >= Date.now() - 90 * 86400000;
  }).length;
  return (
    <main className={`directory directory--${density}`}>
      <header className="manager-header">
        <div>
          <h1 id="page-title">Resource directory</h1>
          <p>
            {allResources.length} resources · {recentCount} added in the last 90
            days
          </p>
        </div>
        <AdminView>
          <CSVExporter data={resources} />
        </AdminView>
      </header>
      <SearchBar />
      <div className="directory-results-toolbar">
        <div className="directory-result-summary" aria-live="polite">
          <strong id="result-count">
            {resources.length} result{resources.length !== 1 ? "s" : ""}
          </strong>
          <span>
            {sort.field
              ? `sorted by ${sort.field === "RESOURCE NAME" ? "name" : sort.field.toLowerCase()}${sort.order === "desc" ? " (descending)" : ""}`
              : "in default order"}
          </span>
        </div>
        <div className="density-control" role="group" aria-label="Row density">
          {["comfortable", "compact"].map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={density === value}
              onClick={() => setDensity(value)}
            >
              {value.charAt(0).toUpperCase() + value.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div
        className="directory-table"
        aria-label="Resources"
        aria-busy={isLoading}
      >
        <ResourceLabels resources={resources} />
        <ResourceList resources={resources} density={density} />
        {!resources.length && (
          <div className="directory-empty">
            {isLoading
              ? "Loading resources…"
              : "No resources found. Try a different search or remove a tag."}
          </div>
        )}
      </div>
    </main>
  );
};
const mapStateToProps = (state) => ({
  resources: tagFilteredResourceSelector(state),
  allResources: state.resources || [],
  sort: state.sort,
  isLoading: state.isLoading,
});
ResourceManager.propTypes = {
  resources: PropTypes.arrayOf(PropTypes.object).isRequired,
  allResources: PropTypes.arrayOf(PropTypes.object).isRequired,
  sort: PropTypes.object.isRequired,
  isLoading: PropTypes.bool,
};
export default connect(mapStateToProps)(ResourceManager);
