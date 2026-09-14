import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { openResourceModalWithPayload } from "../../../redux/actions/modal";
import AdminView from "../../../components/Auth/AdminView";
import Edit from "../../../assets/images/pencil-edit-button.svg";

const ActionButtons = ({ resource, openResourceModalWithPayload }) => (
  <AdminView>
    <div className="card-action">
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
    </div>
  </AdminView>
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
