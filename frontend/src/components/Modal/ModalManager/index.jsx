import React, { useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { modalEnum } from "../../../utils/enums";
import ResourceModal from "../ResourceModal";
import UserModal from "../UserModal";
import {
  currentResourceSelector,
  currentUserSelector,
  isAddingResourceSelector,
} from "../../../redux/selectors/modal";

// Keep the opening snapshot until Reactstrap finishes its exit. The Redux
// close action clears the selected record immediately, before the fade ends.
export const ModalManager = ({
  isOpen,
  modalType,
  resource,
  user,
  editable,
  isAddingResource,
  authenticated = true,
}) => {
  const [session, setSession] = useState(null);
  const [wasOpen, setWasOpen] = useState(false);
  const shouldOpen = authenticated && isOpen;
  if (!authenticated && session) setSession(null);
  if (shouldOpen !== wasOpen) {
    setWasOpen(shouldOpen);
    if (shouldOpen)
      setSession({
        key: (session?.key ?? 0) + 1,
        modalType,
        resource,
        user,
        editable,
        isAddingResource,
      });
  }
  const onClosed = () => {
    // A late exit callback must never remove a dialog that has reopened.
    setSession((current) => (current === session && !isOpen ? null : current));
  };
  const Component =
    session?.modalType === modalEnum.USER ? UserModal : ResourceModal;
  return (
    <div className="modal-wrap-ee">
      {authenticated && session && (
        <Component
          key={session.key}
          {...session}
          isOpen={isOpen}
          onClosed={onClosed}
        />
      )}
    </div>
  );
};

const mapStateToProps = (state) => ({
  authenticated: state.auth.authenticated,
  modalType: state.modal.modalType,
  isOpen: state.modal.isOpen,
  resource: state.modal.isOpen ? currentResourceSelector(state) : null,
  user: state.modal.isOpen ? currentUserSelector(state) : null,
  editable: state.modal.editable,
  isAddingResource: isAddingResourceSelector(state),
});

ModalManager.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  authenticated: PropTypes.bool,
  modalType: PropTypes.oneOf(Object.values(modalEnum)),
  resource: PropTypes.object,
  user: PropTypes.object,
  editable: PropTypes.bool,
  isAddingResource: PropTypes.bool,
};

export default connect(mapStateToProps)(ModalManager);
