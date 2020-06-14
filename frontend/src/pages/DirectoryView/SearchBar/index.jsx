import React from "react";
import { connect } from "react-redux";
import { Button } from "reactstrap";
import { useForm } from "react-hook-form";
import { filterAndRefreshResource } from "../../../utils/api";
import TagAutocomplete from "../TagAutocomplete";
import "../styles.scss";

const SearchBar = ({ isLoading }) => {
  const { register, handleSubmit } = useForm();
  const onSubmit = (data) => {
    filterAndRefreshResource(data.keyword, data.location, data.tag);
  };

  return (
    <div className="searchbar-wrapper">
      <form className="search row" onSubmit={handleSubmit(onSubmit)}>
        <label className="col-md mt-2 mb-3 mb-md-0 mt-md-0">
          <input
            id="search-general"
            type="text"
            name="keyword"
            ref={register}
            className="search-input"
            placeholder="Search"
          />
        </label>
        <label className="col-md mb-3 mb-md-0 pl-md-0">
          <input
            id="search-location"
            type="text"
            name="location"
            placeholder="Location"
            className="search-input"
            ref={register}
          />
        </label>
        <div className="col-md mb-3 mb-md-0 pl-md-0">
          <TagAutocomplete></TagAutocomplete>
        </div>

        <div className="col-6 mx-auto col-sm-6 col-md-2 pl-md-0">
          <Button id="search-button" type="submit" disabled={isLoading}>
            SEARCH
          </Button>
        </div>
      </form>
    </div>
  );
};

const mapStateToProps = (state) => ({
  isLoading: state.isLoading,
});

export default connect(mapStateToProps)(SearchBar);
