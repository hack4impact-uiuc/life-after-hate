import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { updateSearchQuery } from "../../../redux/actions/map";
import { searchQuerySelector } from "../../../redux/selectors/map";

const MapSearchInput = ({ query, updateSearchQuery }) => (
  <div className="map-search-autocomplete" data-cy="searchInput">
    <input
      id="map-keyword-input"
      type="text"
      aria-label="Search resources"
      placeholder="Search names, skills, notes…"
      autoComplete="off"
      value={query}
      onChange={(event) => updateSearchQuery(event.target.value)}
    />
  </div>
);

MapSearchInput.propTypes = {
  query: PropTypes.string,
  updateSearchQuery: PropTypes.func.isRequired,
};

export default connect((state) => ({ query: searchQuerySelector(state) }), {
  updateSearchQuery,
})(MapSearchInput);
