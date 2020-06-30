import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { modalEnum } from "../../../utils/enums";
import ResourceModal from "../ResourceModal";
import UserModal from "../UserModal";

const getComponent = (modalType) => {
  switch (modalType) {
    case modalEnum.RESOURCE:
      return <ResourceModal />;
    case modalEnum.USER:
      return <UserModal />;
    default:
      return <></>;
  }
};

const ModalManager = ({ isOpen, modalType }) => (
  <div className="modal-wrap-ee">{isOpen && getComponent(modalType)}</div>
);

const mapStateToProps = (state) => ({
  modalType: state.modal.modalType,
  isOpen: state.modal.isOpen,
});

ModalManager.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  modalType: PropTypes.oneOf(Object.values(modalEnum)),
};

export default connect(mapStateToProps)(ModalManager);
