import { useEffect } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import nProgress from "nprogress";
import "nprogress/nprogress.css";

// Shows progress bar at top when things are loading...
const MiniLoader = ({ shouldShowLoader }) => {
  useEffect(() => {
    if (shouldShowLoader) {
      nProgress.start();
    } else {
      nProgress.done();
    }
  });

  return null;
};
const MapStateToProps = (state) => ({
  shouldShowLoader: state.isLoading,
});

MiniLoader.propTypes = {
  shouldShowLoader: PropTypes.bool,
};

export default connect(MapStateToProps)(MiniLoader);
