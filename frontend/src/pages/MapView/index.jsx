import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import CardView from "./CardView";
import TagFilters from "../../components/TagFilters";
import SortMenu from "./SortMenu";
import SearchBar from "./SearchBar";
import Map from "./Map";
import { getTags } from "../../utils/api";
import {
  mappableResourceSelector,
  currentResourceSelector,
} from "../../redux/selectors/map";
import { resourceName } from "../../redux/selectors/resource";
import { clearMapResource } from "../../redux/actions/map";
import ResourceDetails, { typeLabels } from "../../components/ResourceDetails";
import "./styles.scss";

const MapView = () => {
  const dispatch = useDispatch();
  const allResources = useSelector(mappableResourceSelector);
  const selected = useSelector(currentResourceSelector);
  const address = useSelector((state) => state.search.address);
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [searchStatus, setSearchStatus] = useState("idle");
  const [sort, setSort] = useState("nearest");
  const resources = React.useMemo(
    () =>
      allResources
        .filter((r) => typeFilter === "ALL" || r.type === typeFilter)
        .sort((a, b) =>
          sort === "name"
            ? resourceName(a).localeCompare(resourceName(b))
            : (a.distanceFromSearchLoc ?? Infinity) -
              (b.distanceFromSearchLoc ?? Infinity),
        ),
    [allResources, typeFilter, sort],
  );
  const resource =
    selected?._id && resources.some((r) => r._id === selected._id)
      ? selected
      : null;
  useEffect(() => {
    document.title = "Map View - Life After Hate";
    getTags();
  }, []);
  return (
    <div className="map-view">
      <div className="search-content">
        <SearchBar onStatusChange={setSearchStatus} />
      </div>
      <div className="workspace-filters">
        <TagFilters />
        <span className="filter-divider" />
        <div className="type-filters" role="group" aria-label="Resource type">
          {[["ALL", "All"], ...Object.entries(typeLabels)].map(
            ([type, label]) => (
              <button
                key={type}
                aria-pressed={typeFilter === type}
                onClick={() => setTypeFilter(type)}
              >
                {type !== "ALL" && <span className={`type-dot ${type}`} />}
                {type === "ALL"
                  ? "All"
                  : label === "Resource"
                    ? "Resources"
                    : `${label}s`}
              </button>
            ),
          )}
        </div>
        <span className="filter-hint">
          Find the right support, in the right place.
        </span>
      </div>
      <div className={`map-workspace ${resource ? "has-detail" : ""}`}>
        <section
          className="results-rail"
          aria-label="Resource results"
          aria-busy={searchStatus === "updating" || searchStatus === "pending"}
        >
          <div className="results-heading">
            <strong className="results-count" aria-live="polite">
              {resources.length} resources
              <span className="search-progress-slot" aria-hidden="true">
                {searchStatus === "updating" && (
                  <span className="search-progress" />
                )}
              </span>
            </strong>
            {address && <span>near {address}</span>}
            <SortMenu value={sort} onChange={setSort} />
          </div>
          {searchStatus === "error" && (
            <div className="search-error" role="alert">
              Search failed. Please try again.
            </div>
          )}
          {resources.length ? (
            <CardView resources={resources} />
          ) : (
            <div className="results-empty">
              <h2>Find a place to start</h2>
              <p>
                Search a location, name, or skill to find support. Adjust your
                filters to see more resources.
              </p>
            </div>
          )}
        </section>
        <div className="map-canvas">
          <Map resources={resources} />
          <div className="map-legend">
            <span className="type-dot GROUP" /> Groups{" "}
            <span className="type-dot INDIVIDUAL" /> Individuals{" "}
            <span className="type-dot TANGIBLE" /> Resources
          </div>
        </div>
        <ResourceDetails
          resource={resource}
          onClose={() => dispatch(clearMapResource())}
        />
      </div>
    </div>
  );
};
export default MapView;
