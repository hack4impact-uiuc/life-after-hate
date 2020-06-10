import React from "react";
import { Button } from "reactstrap";
import { connect } from "react-redux";
import { openUserModalWithPayload } from "../../../redux/actions/modal";
import Edit from "../../../assets/images/pencil-edit-button-black.svg";
import { roleEnum } from "../../../utils/enums";

const UserCard = ({ user, role, openUserModalWithPayload }) => {
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
        <p>{user.email}</p>
      </div>
      <div className="col">
        <p>{user.role}</p>
      </div>
      <div className="col">
        <p>{user.title}</p>
      </div>
      {role === roleEnum.ADMIN && (
        <div className="col-md-2 col-edit">
          <Button onClick={toggleModal} className="edit-button">
            <img id="edit-icon" src={Edit} alt="edit icon" />
            Edit
          </Button>
        </div>
      )}
    </div>
  );
};

const mapStateToProps = (state) => ({
  role: state.auth.role,
});

const mapDispatchToProps = {
  openUserModalWithPayload,
};

export default connect(mapStateToProps, mapDispatchToProps)(UserCard);
