import React from "react";
import { useForm } from "react-hook-form";
import SearchIcon from "../../../assets/images/search.svg";
import LocationIcon from "../../../assets/images/location-icon.svg";
import { filterAndRefreshResource } from "../../../utils/api";

import "./styles.scss";

const SearchBar = () => {
  const { register, handleSubmit } = useForm();
  const onSubmit = data => {
    filterAndRefreshResource(data.keyword, data.location);
  };

  return (
    <div className="search">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="searchLocation">
          <img className="locationIcon" src={LocationIcon} alt="Location" />
          <input
            className="locationInput"
            name="location"
            ref={register}
            type="text"
            placeholder="Location"
          />
        </div>
        <div className="searchKeyword">
          <img className="searchIcon" src={SearchIcon} alt="Search" />
          <input
            className="searchInput"
            type="text"
            name="keyword"
            ref={register}
            list="suggestionsList"
            placeholder="Search"
          />
          <button className="submitSearch" type="submit">
            Go
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;
