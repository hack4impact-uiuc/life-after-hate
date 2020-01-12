import React from "react";
import { Popup } from "react-map-gl";
import MaximizeImg from "../../../assets/images/maximize-white.svg";
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
        onClose={() => this.setState({ popup: null })}
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
            onClick={() => this.toggleModal(props.resource.idxInResults)}
          >
            See More{" "}
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

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MapPopup);
