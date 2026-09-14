import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Button, Modal, ModalHeader, ModalBody } from "reactstrap";
import Close from "../../assets/images/close.svg";
import { connect } from "react-redux";
import { closeModal } from "../../redux/actions/modal";
import { titleSelector } from "../../redux/selectors/modal";
import "./styles.scss";

export const LAHModal = ({
  isOpen,
  closeModal,
  title,
  children,
  modalClassName = "",
  headerTitle,
  subtitle,
  onClosed,
  busy = false,
}) => {
  const [reducedMotion, setReducedMotion] = useState(
    () =>
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
  );
  useEffect(() => {
    const preference = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!preference) return;
    const update = () => setReducedMotion(preference.matches);
    update();
    preference.addEventListener?.("change", update);
    return () => preference.removeEventListener?.("change", update);
  }, []);
  return (
    <Modal
      fade={!reducedMotion}
      isOpen={isOpen}
      onClosed={onClosed}
      toggle={busy ? undefined : closeModal}
      keyboard={!busy}
      backdrop={busy ? "static" : true}
      modalTransition={{ timeout: reducedMotion ? 0 : 280 }}
      backdropTransition={{ timeout: reducedMotion ? 0 : 200 }}
      className={`lah-modal ${modalClassName}`}
    >
      <ModalHeader>
        <span>
          {headerTitle ?? title}
          {subtitle && (
            <small className="resource-editor-subtitle">{subtitle}</small>
          )}
        </span>
        <Button
          color="link"
          className="close-button"
          aria-label="Close dialog"
          onClick={closeModal}
          disabled={busy}
        >
          <img id="close-image" src={Close} alt="close" />
        </Button>
      </ModalHeader>
      <ModalBody>{children}</ModalBody>
    </Modal>
  );
};

const mapStateToProps = (state, ownProps) => ({
  isOpen: state.modal.isOpen,
  title: ownProps.headerTitle ? ownProps.headerTitle : titleSelector(state),
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
  onClosed: PropTypes.func,
  busy: PropTypes.bool,
};
export default connect(mapStateToProps, mapDispatchToProps)(LAHModal);
