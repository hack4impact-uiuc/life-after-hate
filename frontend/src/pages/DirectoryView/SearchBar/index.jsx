import React from "react";
import { connect } from "react-redux";
import { Button } from "reactstrap";
import { useForm } from "react-hook-form";
import { filterAndRefreshResource } from "../../../utils/api";

import "../styles.scss";

const SearchBar = ({ isLoading }) => {
  const { register, handleSubmit } = useForm();
  const onSubmit = data => {
    filterAndRefreshResource(data.keyword, data.location, data.tag);
  };

  return (
    <div className="searchbar-wrapper">
      <form className="search" onSubmit={handleSubmit(onSubmit)}>
        <label>
          <input
            id="search-general"
            type="text"
            name="keyword"
            ref={register}
          />
        </label>
        <label>
          <input
            id="search-location"
            type="textas"
            name="location"
            ref={register}
          />
        </label>
        <label>
          <input id="search-tag" type="text" name="tag" ref={register} />
        </label>
        <Button
          id="search-button"
          type="submit"
          onSubmit={e => e.preventDefault()}
          disabled={isLoading}
        >
          SEARCH
        </Button>
      </form>
    </div>
  );
};

const mapStateToProps = state => ({
  isLoading: state.isLoading
});

export default connect(mapStateToProps)(SearchBar);
