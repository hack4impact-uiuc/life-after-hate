import React, { useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import "./styles.scss";
import Slider from "@mui/material/Slider";
import { filterAndRefreshResource } from "../../../utils/api";

const RadiusFilter = ({ hasCenter, search }) => {
  const [searchRadius, updateSearchRadius] = useState(500);
  const runSearch = (newRadius) => {
    updateSearchRadius(newRadius);
    filterAndRefreshResource(
      search.keyword,
      search.address,
      search.tags,
      newRadius,
    );
  };

  return (
    <div className={`radius-filter ${hasCenter ? "" : "radius-filter-hidden"}`}>
      <Slider
        min={10}
        max={1000}
        value={searchRadius}
        onChange={(_, value) => updateSearchRadius(value)}
        onChangeCommitted={(_, value) => runSearch(value)}
        valueLabelFormat={(value) => `${value}mi`}
        valueLabelDisplay="auto"
        aria-label="Search radius in miles"
        sx={{ color: "#f79230" }}
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
