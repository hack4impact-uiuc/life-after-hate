import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { openResourceModalWithPayload } from "../../../redux/actions/modal";
import AdminView from "../../../components/Auth/AdminView";
import Edit from "../../../assets/images/pencil-edit-button.svg";
import Expand from "../../../assets/images/expand.svg";

const ActionButtons = ({ resource, openResourceModalWithPayload }) => (
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
    <AdminView>
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
    </AdminView>
  </div>
);

const mapDispatchToProps = {
  openResourceModalWithPayload,
};

ActionButtons.propTypes = {
  resource: PropTypes.shape({
    _id: PropTypes.string.isRequired,
  }),
  openResourceModalWithPayload: PropTypes.func,
};

export default connect(null, mapDispatchToProps)(ActionButtons);
