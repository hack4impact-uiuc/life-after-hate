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
import { searchLocationSelector } from "../../../redux/selectors/map";
import "./styles.scss";
import MapSearchAutocomplete from "./MapSearchAutocomplete";

const SearchBar = ({ query, location, updateSearchLocation, tags }) => {
  const onSubmit = (e) => {
    e.preventDefault();
    filterAndRefreshResource(query, location);
  };

  const clearLocation = () => updateSearchLocation("");

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
              value={location}
              onChange={(e) => updateSearchLocation(e.target.value)}
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
          <MapSearchAutocomplete></MapSearchAutocomplete>
          <button className="submitSearch" type="submit">
            Go
          </button>
        </div>
        {tags.length > 0 && (
          <div className="card-tags-search">
            {tags.map((tag) => (
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
  location: searchLocationSelector(state),
});

const mapDispatchToProps = { updateSearchLocation, updateSearchQuery };

export default connect(mapStateToProps, mapDispatchToProps)(SearchBar);
