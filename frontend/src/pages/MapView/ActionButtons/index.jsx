import React from "react";
import { connect } from "react-redux";
import { openResourceModalWithPayload } from "../../../redux/actions/modal";
import { roleEnum } from "../../../utils/enums";
import Edit from "../../../assets/images/pencil-edit-button.svg";
import Expand from "../../../assets/images/expand.svg";

const ActionButtons = ({ role, resource, openResourceModalWithPayload }) => (
  <div className="card-action">
    <button
      tabIndex="0"
      className="card-action-btn"
      data-cy="card-resource-view-btn"
      onClick={() =>
        openResourceModalWithPayload({
          resourceId: resource._id,
          editable: false,
        })
      }
    >
      <img src={Expand} alt="icon" className="popup-button-icon" />
      <span> View</span>
    </button>
    {role === roleEnum.ADMIN && (
      <button
        tabIndex="0"
        className="card-action-btn edit"
        data-cy="card-resource-edit-btn"
        onClick={() =>
          openResourceModalWithPayload({
            resourceId: resource._id,
            editable: true,
          })
        }
      >
        <img src={Edit} alt="icon" className="popup-button-icon" />
        Edit
      </button>
    )}
  </div>
);

const mapStateToProps = (state) => ({
  role: state.auth.role,
});

const mapDispatchToProps = {
  openResourceModalWithPayload,
};

export default connect(mapStateToProps, mapDispatchToProps)(ActionButtons);
