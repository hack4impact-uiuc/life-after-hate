import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import CardView from "./CardView";
import TagPicker from "./TagPicker";
import TagToggle from "./TagToggle";
import SortMenu from "./SortMenu";
import SearchBar from "./SearchBar";
import Map from "./Map";
import ActionButtons from "./ActionButtons";
import LastModifiedInfo from "../../components/Modal/LastModifiedInfo";
import { getTags, removeFilterTag } from "../../utils/api";
import {
  mappableResourceSelector,
  currentResourceSelector,
} from "../../redux/selectors/map";
import {
  resourceName,
  resourceDescription,
} from "../../redux/selectors/resource";
import { tagSelector, globalTagListSelector } from "../../redux/selectors/tags";
import { clearMapResource } from "../../redux/actions/map";
import { distanceToString } from "../../utils/formatters";
import "./styles.scss";

export const typeLabels = {
  GROUP: "Group",
  INDIVIDUAL: "Individual",
  TANGIBLE: "Resource",
};
const MapView = () => {
  const dispatch = useDispatch();
  const allResources = useSelector(mappableResourceSelector);
  const selected = useSelector(currentResourceSelector);
  const tags = useSelector(tagSelector);
  const globalTags = useSelector(globalTagListSelector) || [];
  const address = useSelector((state) => state.search.address);
  const [typeFilter, setTypeFilter] = useState("ALL");
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
  const [closingResource, setClosingResource] = useState(null);
  const drawerResource = resource || closingResource;
  useEffect(() => {
    if (resource) {
      setClosingResource(resource);
      return;
    }
    const timer = window.setTimeout(() => setClosingResource(null), 300);
    return () => window.clearTimeout(timer);
  }, [resource]);
  useEffect(() => {
    document.title = "Map View - Life After Hate";
    getTags();
  }, []);
  useEffect(() => {
    const close = (e) => {
      if (e.key === "Escape") dispatch(clearMapResource());
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [dispatch]);
  return (
    <div className="map-view">
      <div className="search-content">
        <SearchBar />
      </div>
      <div className="workspace-filters">
        <span className="eyebrow">Filters</span>
        {tags.map((tag) => (
          <button
            className="filter-tag"
            key={tag}
            onClick={() => removeFilterTag(tag)}
            aria-label={`Remove ${tag} filter`}
          >
            {tag} <span>×</span>
          </button>
        ))}
        <TagPicker tags={globalTags} selectedTags={tags} />
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
        <section className="results-rail" aria-label="Resource results">
          <div className="results-heading">
            <strong aria-live="polite">{resources.length} resources</strong>
            {address && <span>near {address}</span>}
            <SortMenu value={sort} onChange={setSort} />
          </div>
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
        {drawerResource && (
          <div
            className={`drawer-shell ${resource ? "is-open" : "is-closing"}`}
            inert={!resource ? "" : undefined}
            aria-hidden={!resource || undefined}
          >
            <aside className="resource-drawer" aria-label="Resource details">
              <header>
                <div>
                  <h2>
                    <span className={`type-dot ${drawerResource.type}`} />
                    {resourceName(drawerResource)}
                  </h2>
                  <p>
                    {typeLabels[drawerResource.type]}
                    {drawerResource.distanceFromSearchLoc != null &&
                      ` · ${distanceToString(drawerResource.distanceFromSearchLoc)}`}
                  </p>
                </div>
                <button
                  aria-label="Close resource details"
                  onClick={() => dispatch(clearMapResource())}
                >
                  ×
                </button>
              </header>
              <ActionButtons resource={drawerResource} />
              <div className="drawer-body">
                {resourceDescription(drawerResource) && (
                  <div className="drawer-description">
                    {drawerResource.type === "INDIVIDUAL" && (
                      <div className="eyebrow">Skills & qualifications</div>
                    )}
                    <p>{resourceDescription(drawerResource)}</p>
                  </div>
                )}
                <dl>
                  {[
                    ["Contact", drawerResource.contactName],
                    ["Email", drawerResource.contactEmail],
                    ["Phone", drawerResource.contactPhone],
                    ["Address", drawerResource.address],
                    ["Availability", drawerResource.availability],
                    ["Volunteer roles", drawerResource.volunteerRoles],
                    ["Quantity", drawerResource.quantity],
                    ["Website", drawerResource.websiteURL],
                  ]
                    .filter(([, value]) => value != null && value !== "")
                    .map(([label, value]) => (
                      <div key={label}>
                        <dt>{label}</dt>
                        <dd>
                          {label === "Email" ? (
                            <a href={`mailto:${value}`}>{value}</a>
                          ) : label === "Phone" ? (
                            <a href={`tel:${value}`}>{value}</a>
                          ) : (
                            value
                          )}
                        </dd>
                      </div>
                    ))}
                </dl>
                {drawerResource.volunteerReason && (
                  <div className="drawer-section">
                    <div className="eyebrow">Why volunteer?</div>
                    <p>{drawerResource.volunteerReason}</p>
                  </div>
                )}
                {drawerResource.howDiscovered && (
                  <div className="drawer-section">
                    <div className="eyebrow">How discovered</div>
                    <p>{drawerResource.howDiscovered}</p>
                  </div>
                )}
                <div className="eyebrow">Tags</div>
                <div className="drawer-tags">
                  {drawerResource.tags?.map((tag) => (
                    <TagToggle key={tag} tag={tag} />
                  ))}
                </div>
                {drawerResource.notes && (
                  <div className="drawer-notes">
                    <div className="eyebrow">Notes</div>
                    <p>{drawerResource.notes}</p>
                  </div>
                )}
                {(drawerResource.dateLastModified || drawerResource.dateCreated) && (
                  <div className="drawer-history">
                    <LastModifiedInfo resource={drawerResource} />
                  </div>
                )}
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};
export default MapView;
