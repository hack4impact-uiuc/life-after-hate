import React from "react";
import { connect } from "react-redux";
import { modalEnum } from "../../../utils/enums";
import ResourceModal from "../ResourceModal";
import UserModal from "../UserModal";
const ModalManager = ({ modalType, isOpen }) => {
  if (!isOpen) {
    return <div className="modal-wrap-ee"></div>;
  }
  return (
    <div className="modal-wrap-ee">
      {modalType === modalEnum.RESOURCE ? <ResourceModal /> : <UserModal />}
    </div>
  );
};
const mapStateToProps = (state) => ({
  modalType: state.modal.modalType,
  isOpen: state.modal.isOpen,
});
export default connect(mapStateToProps)(ModalManager);
