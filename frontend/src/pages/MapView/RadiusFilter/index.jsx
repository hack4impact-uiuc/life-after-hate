import React, { useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import "./styles.scss";
import InputRange from "react-input-range";
import { filterAndRefreshResource } from "../../../utils/api";

const RadiusFilter = ({ hasCenter, search }) => {
  const [searchRadius, updateSearchRadius] = useState(500);
  const runSearch = (newRadius) => {
    updateSearchRadius(newRadius);
    filterAndRefreshResource(
      search.keyword,
      search.address,
      search.tags,
      newRadius
    );
  };

  return (
    <div className={`radius-filter ${hasCenter ? "" : "radius-filter-hidden"}`}>
      <InputRange
        minValue={10}
        maxValue={1000}
        value={searchRadius}
        onChange={updateSearchRadius}
        onChangeComplete={runSearch}
        formatLabel={(value) => `${value}mi`}
      />
    </div>
  );
};

const mapStateToProps = (state) => ({
  hasCenter: !!state.map.center,
  search: state.search,
});

RadiusFilter.propTypes = {
  hasCenter: PropTypes.bool,
  search: PropTypes.shape({
    keyword: PropTypes.string,
    address: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
  }),
};

export default connect(mapStateToProps)(RadiusFilter);
