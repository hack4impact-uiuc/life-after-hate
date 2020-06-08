import React from "react";
import { Button, Modal, ModalHeader, ModalBody } from "reactstrap";
import Close from "../../assets/images/close.svg";
import { connect } from "react-redux";
import { openModal, closeModal } from "../../redux/actions/modal";
import { titleSelector } from "../../redux/selectors/modal";
import "./styles.scss";

const LAHModal = ({ isOpen, closeModal, title, children }) => (
  <Modal fade={false} isOpen={isOpen} toggle={closeModal}>
    <ModalHeader>
      {title}
      <Button color="link" className="close-button" onClick={closeModal}>
        <img id="close-image" src={Close} alt="close" />
      </Button>
    </ModalHeader>
    <ModalBody
      style={{
        maxHeight: "calc(100vh - 210px)",
        overflowY: "auto",
      }}
    >
      {children}
    </ModalBody>
  </Modal>
);

const mapStateToProps = (state) => ({
  isOpen: state.modal.isOpen,
  title: titleSelector(state),
});

const mapDispatchToProps = {
  openModal,
  closeModal,
};

export default connect(mapStateToProps, mapDispatchToProps)(LAHModal);
