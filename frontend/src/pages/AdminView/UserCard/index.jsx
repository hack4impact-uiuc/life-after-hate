import React from "react";
import { Button } from "reactstrap";
import { connect } from "react-redux";
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

export default connect(null, mapDispatchToProps)(UserCard);
