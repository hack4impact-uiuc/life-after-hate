import React from "react";
import { Button } from "reactstrap";
import { useForm } from "react-hook-form";
import SearchIcon from "../../../assets/images/search.svg";
import LocationIcon from "../../../assets/images/location-icon.svg";
import { filterAndRefreshResource } from "../../../utils/api";

import "./styles.scss";

const SearchBar = ({
  tags,
  removeTag
}) => {
  const { register, handleSubmit } = useForm();
  const onSubmit = data => {
    filterAndRefreshResource(data.keyword, data.location);
  };

  function clearLocation() {
    document.getElementById("locationInput").value = "";
  }
  function clearSearch() {
    document.getElementById("searchInput").value = "";
  }

  return (
    <div className="search">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="searchLocation">
          <img className="locationIcon" src={LocationIcon} alt="Location" />
          <div className="underlineField" id="underlineLocation">
            <input
              id="locationInput"
              name="location"
              ref={register}
              type="text"
              placeholder="Location"
              tabIndex="0"
            />
            <Button
              className="closeButtons"
              close
              onClick={clearLocation}
              tabIndex="-1"
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
              ref={register}
              list="suggestionsList"
              placeholder="Search"
              tabIndex="0"
            />
            <Button
              className="closeButtons"
              close
              onClick={clearSearch}
              tabIndex="-1"
            />
          </div>
          <button className="submitSearch" type="submit">
            Go
          </button>
        </div>
        {tags.length > 0 && (<div className="card-tags-search">  
          {tags.map(tag => (
            <div className="card-tag-search" key={tag}>
              <span className="search-tag">
                {tag}
              </span>
              <Button
                className="close-tag closeButtons"
                close
                onClick={() => removeTag(tag)}
              />
            </div>
          ))}
        </div>)}
      </form>
    </div>
  );
}; //DONT OPEN CARD AND REMOVE SEARCG TAG CALLBACK

export default SearchBar;
