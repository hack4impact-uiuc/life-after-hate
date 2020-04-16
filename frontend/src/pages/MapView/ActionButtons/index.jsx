import React from "react";
import { connect } from "react-redux";
import { openResourceModalWithPayload } from "../../../redux/actions/modal";
import { roleEnum } from "../../../utils/enums";
import Edit from "../../../assets/images/edit.svg";
import Expand from "../../../assets/images/expand.svg";

const ActionButtons = ({ role, resource, openResourceModalWithPayload }) => (
    <div className="card-action">
      <button
        tabIndex="0"
        className="popup-max"
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
          className="popup-max edit"
          onClick={() =>
            openResourceModalWithPayload({
              resourceId: resource._id,
              editable: false,
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
