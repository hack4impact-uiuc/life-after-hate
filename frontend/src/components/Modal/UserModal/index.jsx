import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import { connect } from "react-redux";
import { Button } from "reactstrap";
import { closeModal } from "../../../redux/actions/modal";
import { roleEnum } from "../../../utils/enums";
import { editAndRefreshUser } from "../../../utils/api";
import { currentUserSelector } from "../../../redux/selectors/modal";
import ModalInput from "../ModalInput";
import LAHModal from "../../Modal";
import "./styles.scss";

export const UserModal = ({ closeModal, user, editable, isOpen, onClosed }) => {
  const { register, handleSubmit } = useForm();

  const [pending, setPending] = useState(false);
  const [requestError, setRequestError] = useState("");
  const inFlight = useRef(false);
  const active = useRef(isOpen);
  active.current = isOpen;
  useEffect(
    () => () => {
      active.current = false;
    },
    [],
  );

  const handleEditUser = async (data) => {
    if (inFlight.current || !editable) return;
    inFlight.current = true;
    setPending(true);
    setRequestError("");
    const reqBody = {
      role: data.role,
      title: data.title,
    };
    try {
      await editAndRefreshUser(reqBody, user.id);
      if (active.current) closeModal();
    } catch {
      if (active.current)
        setRequestError(
          "We couldn’t complete the save. Your entries are still here. Please try again.",
        );
    } finally {
      inFlight.current = false;
      if (active.current) setPending(false);
    }
  };

  // eslint-disable-next-line react/prop-types
  const createInput = ({ required, shortName, ...props }) => (
    <ModalInput
      registration={register(shortName, { required: required ?? false })}
      resource={user}
      disabled={!editable || pending}
      key={shortName}
      tag={"input"}
      {...{ required, shortName, ...props }}
    ></ModalInput>
  );

  const onSubmit = handleEditUser;
  const makeOption = (option, idx) => <option key={idx}>{option}</option>;

  return (
    <LAHModal
      isOpen={isOpen}
      onClosed={onClosed}
      busy={pending}
      headerTitle={`${user.firstName} ${user.lastName}`}
      modalClassName="user-editor-modal"
      subtitle={
        editable
          ? "Manage profile details and account access."
          : "Profile details and account access."
      }
    >
      <form
        aria-busy={pending}
        onSubmit={handleSubmit(onSubmit)}
        className="user-editor-form"
      >
        <div className="user-editor-scroll">
          <section
            className="user-editor-profile"
            aria-label="Account information"
          >
            <div className="user-editor-avatar" aria-hidden="true">
              {`${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`}
            </div>
            <div className="user-editor-identity">
              <h3>
                {user.firstName} {user.lastName}
              </h3>
              <p>{user.email}</p>
            </div>
          </section>
          <div className="user-editor-section-title">Profile</div>
          <p className="user-editor-help">Name and email are read-only.</p>
          <div className="user-editor-fields">
            {createInput({
              labelText: "Full name",
              shortName: "name",
              disabled: true,
              defaultValue: `${user.firstName} ${user.lastName}`,
            })}
            {createInput({
              labelText: "Email",
              shortName: "email",
              disabled: true,
            })}
          </div>
          <div className="user-editor-section-title user-editor-access-title">
            Account details
          </div>
          <label className="modal-lab">
            <p>Role</p>
            <select
              {...register("role")}
              data-cy="modal-role"
              defaultValue={user.role}
              className="modal-select-field"
              disabled={!editable || pending}
            >
              {Object.values(roleEnum).map(makeOption) /* Enum to options */}
            </select>
          </label>
          {createInput({
            labelText: "Job title",
            shortName: "title",
          })}
        </div>
        {requestError && (
          <p className="modal-request-error" role="alert">
            {requestError}
          </p>
        )}
        {editable && (
          <div className="user-editor-footer">
            <Button
              type="button"
              className="user-editor-cancel"
              onClick={closeModal}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button
              id="submit-form-button"
              type="submit"
              data-cy="modal-submit"
              disabled={pending}
            >
              {pending ? "Saving…" : "Save changes"}
            </Button>
          </div>
        )}
      </form>
    </LAHModal>
  );
};

const mapStateToProps = (state, ownProps) => ({
  user: ownProps.user ?? currentUserSelector(state),
  editable: ownProps.editable ?? state.modal.editable,
});

const mapDispatchToProps = {
  closeModal,
};

UserModal.propTypes = {
  closeModal: PropTypes.func.isRequired,
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    email: PropTypes.string,
    role: PropTypes.oneOf(Object.values(roleEnum)),
  }).isRequired,
  editable: PropTypes.bool.isRequired,
  isOpen: PropTypes.bool,
  onClosed: PropTypes.func,
};

export default connect(mapStateToProps, mapDispatchToProps)(UserModal);
