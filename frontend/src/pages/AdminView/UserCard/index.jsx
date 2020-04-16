import React from "react";
import { Button } from "reactstrap";
import { connect } from "react-redux";
import { openUserModalWithPayload } from "../../../redux/actions/modal";
import Edit from "../../../assets/images/edit-black.svg";
import { roleEnum } from "../../../utils/enums";
import "../styles.scss";

const UserCard = (props) => {
  const toggleModal = (event) => {
    event.stopPropagation();
    props.openUserModalWithPayload({ userId: props.user.id });
  };

  const toggleViewOnlyModal = (event) => {
    event.stopPropagation();
    props.openUserModalWithPayload({
      userId: props.user.id,
      editable: false,
    });
  };

  return (
    <div
      className="card-click"
      role="button"
      tabIndex="0"
      onClick={toggleViewOnlyModal}
      onKeyPress={toggleViewOnlyModal}
    >
      <div className="card-wrapper">
        <div className="col">
          <p>{`${props.user.firstName} ${props.user.lastName}`}</p>
        </div>
        <div className="col">
          <p>{props.user.email}</p>
        </div>
        <div className="col">
          <p>{props.user.role}</p>
        </div>
        <div className="col">
          <p>{props.user.title}</p>
        </div>
        {props.role === roleEnum.ADMIN && (
          <div className="col col-edit">
            <Button onClick={toggleModal} className="edit-button">
              <img id="edit-icon" src={Edit} alt="edit icon" />
              Edit
            </Button>
          </div>
        )}
      </div>
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
