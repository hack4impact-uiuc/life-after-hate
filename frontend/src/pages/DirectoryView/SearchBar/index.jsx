import React from "react";
import { connect } from "react-redux";
import { Button } from "reactstrap";
import { useForm } from "react-hook-form";
import { filterAndRefreshResource } from "../../../utils/api";

import "../styles.scss";

const SearchBar = ({ isLoading }) => {
  const { register, handleSubmit } = useForm();
  const onSubmit = (data) => {
    filterAndRefreshResource(data.keyword, data.location, data.tag);
  };

  return (
    <div className="searchbar-wrapper">
      <form className="search row" onSubmit={handleSubmit(onSubmit)}>
        <label className="col">
          <input
            id="search-general"
            type="text"
            name="keyword"
            ref={register}
            placeholder="Search"
          />
        </label>
        <label className="col">
          <input
            id="search-location"
            type="text"
            name="location"
            placeholder="Location"
            ref={register}
          />
        </label>
        <label className="col">
          <input
            id="search-tag"
            placeholder="Tags"
            type="text"
            name="tag"
            ref={register}
          />
        </label>

        <div className="col-2">
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
