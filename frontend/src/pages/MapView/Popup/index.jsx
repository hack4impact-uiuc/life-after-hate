import React from "react";
import { Popup } from "react-map-gl";
import MaximizeImg from "../../../assets/images/maximize-white.svg";
import { openModalWithPayload } from "../../../redux/actions/modal";
import { clearMapResource } from "../../../redux/actions/map";
import { connect } from "react-redux";
import {
  currentResourceSelector,
  mapResourceIdSelector
} from "../../../redux/selectors/map";

const MapPopup = props => (
  <div>
    {props.isResourceSelected && (
      <Popup
        latitude={props.resource.location.coordinates[1]}
        longitude={props.resource.location.coordinates[0]}
        tipSize={5}
        closeOnClick={false}
        dynamicPosition={true}
        offsetTop={-27}
        captureScroll={false}
        onClose={props.clearMapResource}
      >
        <div className="popup">
          <div className="popup-title">{props.resource.companyName}</div>
          {props.resource.distanceFromSearchLoc && (
            <div className="popup-distance">
              {Math.round(props.resource.distanceFromSearchLoc * 10) / 10} miles
              away
            </div>
          )}
          <div className="popup-desc">{props.resource.description}</div>
          <button
            tabIndex="0"
            className="popup-max"
            onClick={() =>
              props.openModalWithPayload({ resourceId: props.resource._id })
            }
          >
            See More / Edit{" "}
            <img src={MaximizeImg} alt="icon" className="popup-button-icon" />
          </button>
        </div>
      </Popup>
    )}
  </div>
);

const mapStateToProps = state => ({
  resource: currentResourceSelector(state),
  isResourceSelected: mapResourceIdSelector(state) !== undefined
});

const mapDispatchToProps = { openModalWithPayload, clearMapResource };

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MapPopup);
