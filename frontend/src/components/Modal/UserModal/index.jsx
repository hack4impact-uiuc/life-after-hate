import React from "react";
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
import "../styles.scss";

const UserModal = ({ closeModal, user, editable }) => {
  const { register, handleSubmit } = useForm();

  const handleEditUser = async (data) => {
    const reqBody = {
      role: data.role,
      title: data.title,
    };
    await editAndRefreshUser(reqBody, user.id);
    closeModal();
  };

  const createInput = ({ required, shortName, ...props }) => (
    <ModalInput
      componentRef={register({ required: required ?? false })}
      resource={user}
      disabled={!editable}
      key={shortName}
      tag={"input"}
      {...{ required, shortName, ...props }}
    ></ModalInput>
  );

  const onSubmit = handleEditUser;
  const makeOption = (option, idx) => <option key={idx}>{option}</option>;

  return (
    <LAHModal>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="add-edit-resource-form"
      >
        {createInput({
          labelText: "User Name",
          shortName: "name",
          disabled: true,
          defaultValue: `${user.firstName} ${user.lastName}`,
        })}
        {createInput({
          labelText: "Email",
          shortName: "email",
          disabled: true,
        })}
        <label className="modal-lab">
          <p>Role</p>
          <select
            ref={register}
            name="role"
            data-cy="modal-role"
            defaultValue={user.role}
            className="modal-select-field"
            disabled={!editable}
          >
            {Object.values(roleEnum).map(makeOption) /* Enum to options */}
          </select>
        </label>
        {createInput({
          labelText: "Title",
          shortName: "title",
        })}
        {editable && (
          <div>
            <Button
              id="submit-form-button"
              type="submit"
              data-cy="modal-submit"
            >
              Save
            </Button>
          </div>
        )}
      </form>
    </LAHModal>
  );
};

const mapStateToProps = (state) => ({
  user: currentUserSelector(state),
  editable: state.modal.editable,
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
};

export default connect(mapStateToProps, mapDispatchToProps)(UserModal);
