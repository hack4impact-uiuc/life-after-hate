import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import AdminView from "../../components/Auth/AdminView";
import SearchBar from "./SearchBar";
import { tagFilteredResourceSelector } from "../../redux/selectors/resource";
import { CSVExporter } from "../../components/CSVExporter/CSVExporter";
import { getTags } from "../../utils/api";
import ResourceLabels from "./ResourceLabels";
import ResourceList from "./ResourceList";
import ResourceDetails from "../../components/ResourceDetails";
import "./styles.scss";

const ResourceManager = ({ resources, sort }) => {
  const [searchStatus, setSearchStatus] = useState("searching");
  const [selectedId, setSelectedId] = useState(null);
  const selectedResource = resources.find(
    (resource) => resource._id === selectedId,
  );
  const [density, setDensity] = useState("comfortable");
  const resultsRef = useRef(null);
  const resultsSignature = resources
    .map((resource) => resource.id ?? resource._id)
    .join("|");
  useEffect(() => {
    if (
      searchStatus !== "complete" ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const animation = resultsRef.current?.animate?.(
      [{ opacity: 0.65 }, { opacity: 1 }],
      { duration: 200, easing: "ease-out" },
    );
    return () => animation?.cancel();
  }, [density, resultsSignature, searchStatus]);
  useEffect(() => {
    document.title = "Directory View - Life After Hate";
    getTags();
  }, []);
  return (
    <main
      className={`directory directory--${density}`}
      aria-labelledby="page-title"
    >
      <h1 id="page-title" className="visually-hidden">
        Resource directory
      </h1>
      <SearchBar onSearchStatusChange={setSearchStatus} />
      <div className="directory-results-toolbar">
        <div className="directory-result-summary" aria-live="polite">
          <strong id="result-count">
            {searchStatus === "complete"
              ? `${resources.length} result${resources.length !== 1 ? "s" : ""}`
              : searchStatus === "error"
                ? "Search failed"
                : "Searching…"}
          </strong>
          {searchStatus === "complete" && (
            <span>
              {sort.field
                ? `sorted by ${sort.field === "RESOURCE NAME" ? "name" : sort.field.toLowerCase()}${sort.order === "desc" ? " (descending)" : ""}`
                : "in default order"}
            </span>
          )}
        </div>
        <div className="directory-results-actions">
          <AdminView>
            <CSVExporter data={resources} />
          </AdminView>
          <div
            className={`density-control density-control--${density}`}
            role="group"
            aria-label="Row density"
          >
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
      </div>
      <div
        ref={resultsRef}
        className="directory-table"
        aria-label="Resources"
        aria-busy={searchStatus === "searching"}
      >
        <ResourceLabels resources={resources} />
        <ResourceList
          resources={resources}
          density={density}
          onSelectResource={setSelectedId}
        />
        {!resources.length && (
          <div className="directory-empty">
            {searchStatus === "searching"
              ? "Searching resources…"
              : searchStatus === "error"
                ? "Could not load resources. Try searching again."
                : "No resources found. Try a different search or remove a tag."}
          </div>
        )}
      </div>
      <div className="directory-details">
        <ResourceDetails
          resource={selectedResource}
          onClose={() => setSelectedId(null)}
        />
      </div>
    </main>
  );
};
const mapStateToProps = (state) => ({
  resources: tagFilteredResourceSelector(state),
  sort: state.sort,
});
ResourceManager.propTypes = {
  resources: PropTypes.arrayOf(PropTypes.object).isRequired,
  sort: PropTypes.object.isRequired,
};
export default connect(mapStateToProps)(ResourceManager);
