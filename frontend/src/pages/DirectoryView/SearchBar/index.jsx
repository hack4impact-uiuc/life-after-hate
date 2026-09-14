import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Button } from "reactstrap";
import { useForm } from "react-hook-form";
import { filterAndRefreshResource } from "../../../utils/api";
import DirectoryTagSearch from "../DirectoryTagSearch";
import "../styles.scss";

const SearchBar = ({ isLoading }) => {
  const { register, handleSubmit, watch } = useForm({
    defaultValues: { keyword: "", location: "" },
  });
  const pendingSearch = useRef(null);
  const revision = useRef(0);
  const runSearch = (data, searchRevision) => {
    // The API reports failures; catch here so timer callbacks do not reject unhandled.
    filterAndRefreshResource(
      data.keyword,
      data.location,
      undefined,
      undefined,
      {
        shouldApply: () => revision.current === searchRevision,
      },
    ).catch(() => {});
  };
  useEffect(() => {
    const subscription = watch((data, { name }) => {
      if (name !== "keyword" && name !== "location") return;
      clearTimeout(pendingSearch.current);
      const searchRevision = ++revision.current;
      pendingSearch.current = setTimeout(() => {
        runSearch(data, searchRevision);
      }, 350);
    });
    return () => {
      subscription.unsubscribe();
      clearTimeout(pendingSearch.current);
      revision.current += 1;
    };
  }, [watch]);
  const onSubmit = (data) => {
    clearTimeout(pendingSearch.current);
    runSearch(data, ++revision.current);
  };

  return (
    <div className="searchbar-wrapper">
      <form className="search row" onSubmit={handleSubmit(onSubmit)}>
        <label className="col-md mt-2 mb-3 mb-md-0 mt-md-0">
          <input
            id="search-general"
            aria-label="Search resources"
            type="text"
            {...register("keyword")}
            className="search-input"
            placeholder="Search names, skills, notes…"
          />
        </label>
        <label className="col-md mb-3 mb-md-0 ps-md-0">
          <input
            id="search-location"
            aria-label="Location"
            type="text"
            {...register("location")}
            placeholder="Location"
            className="search-input"
          />
        </label>
        <div className="col-md mb-3 mb-md-0 ps-md-0">
          <DirectoryTagSearch></DirectoryTagSearch>
        </div>

        <div className="col-6 mx-auto col-sm-6 col-md-2 ps-md-0">
          <Button id="search-button" type="submit" disabled={isLoading}>
            Search
          </Button>
        </div>
      </form>
    </div>
  );
};

const mapStateToProps = (state) => ({
  isLoading: state.isLoading,
});

SearchBar.propTypes = {
  isLoading: PropTypes.bool,
};

export default connect(mapStateToProps)(SearchBar);
