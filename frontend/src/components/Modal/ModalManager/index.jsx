import React from "react";
import { connect } from "react-redux";
import { modalEnum } from "../../../utils/enums";
import ResourceModal from "../ResourceModal";
import UserModal from "../UserModal";
const ModalManager = ({ modalType, isOpen }) => {
  const getComponent = () => {
    switch (modalType) {
      case modalEnum.RESOURCE:
        return <ResourceModal />;
      case modalEnum.USER:
        return <UserModal />;
      default:
        return <></>;
    }
  };

  return <div className="modal-wrap-ee">{isOpen && getComponent()}</div>;
};
const mapStateToProps = (state) => ({
  modalType: state.modal.modalType,
  isOpen: state.modal.isOpen,
});
export default connect(mapStateToProps)(ModalManager);
