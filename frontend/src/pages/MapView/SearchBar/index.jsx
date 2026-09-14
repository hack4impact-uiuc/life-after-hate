import React, { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import SearchIcon from "../../../assets/images/search.svg";
import LocationIcon from "../../../assets/images/location-icon.svg";
import { filterAndRefreshResource } from "../../../utils/api";
import {
  updateSearchLocation,
  updateSearchQuery,
} from "../../../redux/actions/map";
import {
  searchLocationSelector,
  searchQuerySelector,
} from "../../../redux/selectors/map";
import "./styles.scss";
import MapSearchAutocomplete from "./MapSearchAutocomplete";

const ClearIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
    <path
      d="m3 3 8 8M11 3l-8 8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);
const SearchBar = ({
  query,
  location,
  updateSearchLocation,
  updateSearchQuery,
  onStatusChange,
}) => {
  const [radius, setRadius] = useState(500);
  const appliedLocation = useRef("");
  const timer = useRef();
  const revision = useRef(0);
  const [composing, setComposing] = useState(false);
  const runSearch = useCallback(
    async (keyword, address, distance) => {
      clearTimeout(timer.current);
      const current = ++revision.current;
      onStatusChange("updating");
      try {
        await filterAndRefreshResource(keyword, address, undefined, distance, {
          withLoader: false,
          shouldApply: () => current === revision.current,
        });
        if (current === revision.current) onStatusChange("idle");
      } catch {
        if (current === revision.current) onStatusChange("error");
      }
    },
    [onStatusChange],
  );

  useEffect(() => {
    clearTimeout(timer.current);
    ++revision.current;
    if (
      composing ||
      radius === "" ||
      radius < 10 ||
      radius > 1000 ||
      radius % 10 !== 0
    ) {
      onStatusChange("idle");
      return;
    }
    onStatusChange("pending");
    timer.current = setTimeout(
      () => runSearch(query, appliedLocation.current, radius),
      300,
    );
  }, [query, radius, composing, runSearch, onStatusChange]);

  useEffect(
    () => () => {
      clearTimeout(timer.current);
      ++revision.current;
    },
    [],
  );

  const onSubmit = (e) => {
    e.preventDefault();
    if (composing) return;
    appliedLocation.current = location.trim();
    runSearch(query, appliedLocation.current, radius);
  };

  const clearLocation = () => {
    updateSearchLocation("");
    appliedLocation.current = "";
    if (radius !== "" && radius >= 10 && radius <= 1000 && radius % 10 === 0) {
      runSearch(query, "", radius);
    }
    document.getElementById("locationInput")?.focus();
  };
  const clearQuery = () => {
    updateSearchQuery("");
    document.getElementById("map-keyword-input")?.focus();
  };

  return (
    <div className="map-search">
      <form
        onSubmit={onSubmit}
        onCompositionStart={() => setComposing(true)}
        onCompositionEnd={() => setComposing(false)}
      >
        <div className="searchLocation">
          <img className="locationIcon" src={LocationIcon} alt="Location" />
          <div className="underlineField" id="underlineLocation">
            <input
              id="locationInput"
              name="location"
              type="text"
              placeholder="Location"
              aria-label="Search location"
              title="Press Enter or Search to apply a location"
              tabIndex="0"
              value={location}
              onChange={(e) => updateSearchLocation(e.target.value)}
            />
            {Boolean(location) && (
              <button
                className="workspace-clear-button"
                type="button"
                aria-label="Clear location"
                onClick={clearLocation}
                data-cy="clear-location"
              >
                <ClearIcon />
              </button>
            )}
          </div>
        </div>
        <div className="searchKeyword">
          <img className="searchIcon" src={SearchIcon} alt="Search" />
          <MapSearchAutocomplete />
          {Boolean(query) && (
            <button
              className="workspace-clear-button"
              type="button"
              aria-label="Clear search"
              onClick={clearQuery}
            >
              <ClearIcon />
            </button>
          )}
        </div>
        <label className="workspace-radius">
          <span>Within</span>
          <span className="radius-value">
            <input
              style={{ width: `${Math.max(2, String(radius).length) + 0.5}ch` }}
              type="number"
              min="10"
              max="1000"
              step="10"
              aria-label="Search radius in miles"
              value={radius}
              onChange={(e) =>
                setRadius(e.target.value === "" ? "" : Number(e.target.value))
              }
              required
            />
            <span>mi</span>
          </span>
        </label>
        <button className="submitSearch" type="submit">
          Search
        </button>
      </form>
    </div>
  );
};

const mapStateToProps = (state) => ({
  query: searchQuerySelector(state),
  location: searchLocationSelector(state),
});

const mapDispatchToProps = { updateSearchLocation, updateSearchQuery };

SearchBar.propTypes = {
  onStatusChange: PropTypes.func.isRequired,
  query: PropTypes.string,
  location: PropTypes.string,
  updateSearchLocation: PropTypes.func.isRequired,
  updateSearchQuery: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(SearchBar);
