import React from "react";
import { Popup } from "react-map-gl";
import { openResourceModalWithPayload } from "../../../redux/actions/modal";
import { clearMapResource } from "../../../redux/actions/map";
import { connect } from "react-redux";
import {
  currentResourceSelector,
  mapResourceIdSelector,
} from "../../../redux/selectors/map";

import ActionButtons from "../ActionButtons";

const MapPopup = (props) => (
  <div>
    {props.isResourceSelected && (
      <Popup
        latitude={props.resource.location.coordinates[1]}
        longitude={props.resource.location.coordinates[0]}
        tipSize={5}
        closeOnClick={false}
        dynamicPosition
        offsetTop={-27}
        captureScroll={false}
        onClose={props.clearMapResource}
      >
        <div className="popup">
          <div data-cy="popup-title" className="popup-title">
            {props.resource.contactName}
          </div>
          {props.resource.distanceFromSearchLoc && (
            <div className="popup-distance">
              {Math.round(props.resource.distanceFromSearchLoc * 10) / 10} miles
              away
            </div>
          )}
          <div className="popup-desc">{props.resource.skills}</div>

          <ActionButtons resource={props.resource}></ActionButtons>
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

const mapDispatchToProps = { openResourceModalWithPayload, clearMapResource };

export default connect(mapStateToProps, mapDispatchToProps)(MapPopup);
