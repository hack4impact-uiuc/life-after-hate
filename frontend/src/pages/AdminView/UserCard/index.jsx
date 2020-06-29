import React from "react";
import PropTypes from "prop-types";
import { Button } from "reactstrap";
import { connect } from "react-redux";
import { roleEnum } from "../../../utils/enums";
import AdminView from "../../../components/Auth/AdminView";
import { openUserModalWithPayload } from "../../../redux/actions/modal";
import Edit from "../../../assets/images/pencil-edit-button-black.svg";

const UserCard = ({ user, openUserModalWithPayload }) => {
  const toggleModal = (event) => {
    event.stopPropagation();
    openUserModalWithPayload({ userId: user.id });
  };

  const toggleViewOnlyModal = (event) => {
    event.stopPropagation();
    openUserModalWithPayload({
      userId: user.id,
      editable: false,
    });
  };

  return (
    <div
      className="card-click row card-wrapper"
      role="button"
      tabIndex="0"
      onClick={toggleViewOnlyModal}
      onKeyPress={toggleViewOnlyModal}
    >
      <div className="col">
        <p>{`${user.firstName} ${user.lastName}`}</p>
      </div>
      <div className="col">
        <p className="text-truncate">{user.email}</p>
      </div>
      <div className="col">
        <p>{user.role}</p>
      </div>
      <div className="col d-none d-md-block">
        <p>{user.title}</p>
      </div>
      <AdminView>
        <div className="col col-edit">
          <Button
            onClick={toggleModal}
            className="edit-button"
            color="transparent"
          >
            <img id="edit-icon" src={Edit} alt="edit icon" />
            Edit
          </Button>
        </div>
      </AdminView>
    </div>
  );
};

const mapDispatchToProps = {
  openUserModalWithPayload,
};

UserCard.propTypes = {
  user: PropTypes.shape({
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    email: PropTypes.string,
    role: PropTypes.oneOf(Object.values(roleEnum)).isRequired,
    title: PropTypes.string,
  }),
};

export default connect(null, mapDispatchToProps)(UserCard);
