import React from "react";
import PropTypes from "prop-types";
import { Popup } from "react-map-gl";
import { openResourceModalWithPayload } from "../../../redux/actions/modal";
import { clearMapResource } from "../../../redux/actions/map";
import { connect } from "react-redux";
import {
  currentResourceSelector,
  mapResourceIdSelector,
} from "../../../redux/selectors/map";
import { distanceToString } from "../../../utils/formatters";
import {
  resourceName,
  resourceDescription,
} from "../../../redux/selectors/resource";
import ActionButtons from "../ActionButtons";

const MapPopup = ({ isResourceSelected, resource, clearMapResource }) => (
  <div>
    {isResourceSelected && (
      <Popup
        latitude={resource.location.coordinates[1]}
        longitude={resource.location.coordinates[0]}
        tipSize={5}
        closeOnClick={false}
        dynamicPosition
        offsetTop={-27}
        captureScroll={false}
        onClose={clearMapResource}
      >
        <div className="popup">
          <div data-cy="popup-title" className="popup-title">
            {resourceName(resource)}
          </div>
          {"distanceFromSearchLoc" in resource && (
            <div className="popup-distance">
              {distanceToString(resource.distanceFromSearchLoc)}
            </div>
          )}
          <div className="popup-desc">{resourceDescription(resource)}</div>
          <ActionButtons resource={resource}></ActionButtons>
        </div>
      </Popup>
    )}
  </div>
);

const mapStateToProps = (state) => ({
  resource: currentResourceSelector(state),
  isResourceSelected: mapResourceIdSelector(state) !== undefined,
  role: state.auth.role,
});

MapPopup.propTypes = {
  isResourceSelected: PropTypes.bool,
  resource: PropTypes.shape({
    location: PropTypes.PropTypes.shape({
      coordinates: PropTypes.arrayOf(PropTypes.number),
    }),
    distanceFromSearchLoc: PropTypes.number,
  }),
  clearMapResource: PropTypes.func,
};

const mapDispatchToProps = { openResourceModalWithPayload, clearMapResource };

export default connect(mapStateToProps, mapDispatchToProps)(MapPopup);
