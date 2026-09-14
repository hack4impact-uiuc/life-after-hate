import { useEffect } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import nProgress from "nprogress";
import "nprogress/nprogress.css";

// Shows progress bar at top when things are loading...
const MiniLoader = ({ shouldShowLoader }) => {
  useEffect(() => {
    nProgress.configure({ showSpinner: false });
    if (shouldShowLoader) {
      const timer = window.setTimeout(() => nProgress.start(), 250);
      return () => window.clearTimeout(timer);
    } else {
      nProgress.done();
    }
  }, [shouldShowLoader]);

  useEffect(() => () => nProgress.remove(), []);

  return null;
};
const MapStateToProps = (state) => ({
  shouldShowLoader: state.isLoading,
});

MiniLoader.propTypes = {
  shouldShowLoader: PropTypes.bool,
};

export default connect(MapStateToProps)(MiniLoader);
