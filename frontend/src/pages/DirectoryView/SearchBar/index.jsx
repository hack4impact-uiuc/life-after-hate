import React from "react";
import { Button } from "reactstrap";
import { useForm } from "react-hook-form";
import { filterAndRefreshResource } from "../../../utils/api";

import "../styles.scss";

const SearchBar = () => {
  const { register, handleSubmit } = useForm();
  const onSubmit = data => {
    console.log(data);
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
            type="text"
            name="location"
            ref={register}
          />
        </label>
        <label>
          <input id="search-tag" type="text" name="tag" ref={register} />
        </label>
        <Button id="search-button" type="submit">
          SEARCH
        </Button>
      </form>
    </div>
  );
};

export default SearchBar;
