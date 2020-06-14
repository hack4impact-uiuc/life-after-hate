import React from "react";
import { Popup } from "react-map-gl";
import { openResourceModalWithPayload } from "../../../redux/actions/modal";
import { resourceEnum } from "../../../utils/enums";
import { clearMapResource } from "../../../redux/actions/map";
import { connect } from "react-redux";
import {
  currentResourceSelector,
  mapResourceIdSelector,
} from "../../../redux/selectors/map";
import { distanceToString } from "../../../utils/formatters";
import ActionButtons from "../ActionButtons";

const isIndividualResource = (resource) =>
  resource.type === resourceEnum.INDIVIDUAL;
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
            {isIndividualResource(resource)
              ? resource.contactName
              : resource.companyName}
          </div>
          {"distanceFromSearchLoc" in resource && (
            <div className="popup-distance">
              {distanceToString(resource.distanceFromSearchLoc)}
            </div>
          )}
          <div className="popup-desc">
            {isIndividualResource(resource)
              ? resource.skills
              : resource.description}
          </div>

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

const mapDispatchToProps = { openResourceModalWithPayload, clearMapResource };

export default connect(mapStateToProps, mapDispatchToProps)(MapPopup);
