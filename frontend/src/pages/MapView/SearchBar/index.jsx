import React from "react";
import { connect } from "react-redux";
import { Button } from "reactstrap";
import SearchIcon from "../../../assets/images/search.svg";
import LocationIcon from "../../../assets/images/location-icon.svg";
import { filterAndRefreshResource, removeFilterTag } from "../../../utils/api";
import {
  updateSearchLocation,
  updateSearchQuery,
} from "../../../redux/actions/map";
import { tagSelector } from "../../../redux/selectors/tags";
import {
  searchLocationSelector,
  searchQuerySelector,
} from "../../../redux/selectors/map";
import "./styles.scss";

const SearchBar = (props) => {
  const onSubmit = (e) => {
    e.preventDefault();
    filterAndRefreshResource(props.query, props.location);
  };

  const clearLocation = () => props.updateSearchLocation("");
  const clearSearch = () => props.updateSearchQuery("");

  return (
    <div className="search">
      <form onSubmit={onSubmit}>
        <div className="searchLocation">
          <img className="locationIcon" src={LocationIcon} alt="Location" />
          <div className="underlineField" id="underlineLocation">
            <input
              id="locationInput"
              name="location"
              type="text"
              placeholder="Location"
              tabIndex="0"
              value={props.location}
              onChange={(e) => props.updateSearchLocation(e.target.value)}
            />
            <Button
              className="closeButtons"
              close
              onClick={clearLocation}
              tabIndex="-1"
              data-cy="clear-location"
            />
          </div>
        </div>
        <div className="searchKeyword">
          <img className="searchIcon" src={SearchIcon} alt="Search" />
          <div className="underlineField">
            <input
              id="searchInput"
              type="text"
              name="keyword"
              list="suggestionsList"
              placeholder="Search"
              tabIndex="0"
              value={props.query}
              onChange={(e) => props.updateSearchQuery(e.target.value)}
            />
            <Button
              className="closeButtons"
              close
              onClick={clearSearch}
              tabIndex="-1"
              data-cy="clear-search"
            />
          </div>
          <button className="submitSearch" type="submit">
            Go
          </button>
        </div>
        {props.tags.length > 0 && (
          <div className="card-tags-search">
            {props.tags.map((tag) => (
              <div className="card-tag-search" key={tag}>
                <span className="search-tag">{tag}</span>
                <Button
                  className="close-tag closeButtons"
                  close
                  onClick={() => removeFilterTag(tag)}
                />
              </div>
            ))}
          </div>
        )}
      </form>
    </div>
  );
};

const mapStateToProps = (state) => ({
  tags: tagSelector(state),
  query: searchQuerySelector(state),
  location: searchLocationSelector(state),
});

const mapDispatchToProps = { updateSearchLocation, updateSearchQuery };

export default connect(mapStateToProps, mapDispatchToProps)(SearchBar);
