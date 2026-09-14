import React from "react";
import PropTypes from "prop-types";
import { Button, Modal, ModalHeader, ModalBody } from "reactstrap";
import Close from "../../assets/images/close.svg";
import { connect } from "react-redux";
import { closeModal } from "../../redux/actions/modal";
import { titleSelector } from "../../redux/selectors/modal";
import "./styles.scss";

const LAHModal = ({ isOpen, closeModal, title, children, modalClassName = "", headerTitle, subtitle }) => (
  <Modal fade isOpen={isOpen} toggle={closeModal} className={`lah-modal ${modalClassName}`}>
    <ModalHeader>
      <span>{headerTitle ?? title}{subtitle && <small className="resource-editor-subtitle">{subtitle}</small>}</span>
      <Button
        color="link"
        className="close-button"
        aria-label="Close dialog"
        onClick={closeModal}
      >
        <img id="close-image" src={Close} alt="close" />
      </Button>
    </ModalHeader>
    <ModalBody>{children}</ModalBody>
  </Modal>
);

const mapStateToProps = (state) => ({
  isOpen: state.modal.isOpen,
  title: titleSelector(state),
});

const mapDispatchToProps = {
  closeModal,
};

LAHModal.propTypes = {
  isOpen: PropTypes.bool,
  closeModal: PropTypes.func,
  title: PropTypes.string,
  children: PropTypes.element,
  modalClassName: PropTypes.string,
  headerTitle: PropTypes.string,
  subtitle: PropTypes.string,
};
export default connect(mapStateToProps, mapDispatchToProps)(LAHModal);
