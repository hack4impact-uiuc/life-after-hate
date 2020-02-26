import React from "react";
import { Button } from "reactstrap";
//import { connect } from "react-redux";
//import { openUserModalWithPayload } from "../../../redux/actions/userModal"; TODO: add userModal
import Edit from "../../../assets/images/edit.svg";
import "../styles.scss";

//TODO: Add usercard modal funnction
const UserCard = props => (
  <div
    className="card-click"
    role="button"
    tabIndex="0"
    onClick={null /*toggleViewOnlyModal*/}
    onKeyPress={null /*toggleViewOnlyModal*/}
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
        <p>{props.user.role /* TODO: Get correct title? */}</p>
      </div>
      <div className="col col-edit">
        <Button onClick={null /*TODO: toggleModal*/} className="edit-button">
          <img id="edit-icon" src={Edit} alt="edit icon" />
          Edit
        </Button>
      </div>
    </div>
  </div>
);

// const mapStateToProps = state => ({
//     role: state.auth.role
//   });

//   const mapDispatchToProps = {
//     openUserModalWithPayload
//   };

export default UserCard;
