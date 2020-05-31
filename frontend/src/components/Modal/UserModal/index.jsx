import React from "react";
import { useForm } from "react-hook-form";
import { connect } from "react-redux";
import { Button } from "reactstrap";
import { openModal, closeModal } from "../../../redux/actions/modal";
import { modalEnum, roleEnum } from "../../../utils/enums";
import { editAndRefreshUser } from "../../../utils/api";
import { currentUserSelector } from "../../../redux/selectors/modal";
import LAHModal from "../../Modal";
import "../styles.scss";

const UserModal = (props) => {
  const { register, handleSubmit } = useForm();

  const onSubmit = handleEditUser;

  const handleEditUser = async (data) => {
    const reqBody = {
      role: data.role,
      title: data.title,
    };
    await editAndRefreshUser(reqBody, props.user.id);
    props.closeModal();
  };

  const makeOption = (option) => <option>{option}</option>;

  return (
    <div className="modal-wrap-ee">
      {props.isOpen && props.modalType === modalEnum.USER && (
        <LAHModal>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="add-edit-resource-form"
          >
            <label className="modal-lab">
              <p>User Name</p>
              <input
                ref={register}
                type="text"
                name="name"
                defaultValue={`${props.user.firstName} ${props.user.lastName}`}
                className="modal-input-field"
                data-cy="user-name-input-field"
                disabled
              />
            </label>
            <label className="modal-lab">
              <p>Email</p>
              <input
                ref={register}
                type="text"
                name="email"
                defaultValue={props.user.email}
                className="modal-input-field"
                data-cy="email-input-field"
                disabled
              />
            </label>
            <label className="modal-lab">
              <p>Role</p>
              <select
                ref={register}
                name="role"
                data-cy="role-input-field"
                defaultValue={props.user.role}
                className="modal-select-field"
                disabled={!props.editable}
              >
                {Object.values(roleEnum).map(makeOption) /* Enum to options */}
              </select>
            </label>
            <label className="modal-lab">
              <p>Title</p>
              <textarea
                ref={register}
                name="title"
                defaultValue={props.user.title}
                className="modal-input-field modal-input-textarea"
                data-cy="title-input-field"
                rows="3"
                disabled={!props.editable}
              />
            </label>
            {props.editable && (
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
      )}
    </div>
  );
};

const mapStateToProps = (state) => ({
  isOpen: state.modal.isOpen,
  user: currentUserSelector(state),
  editable: state.modal.editable,
  modalType: state.modal.modalType,
});

const mapDispatchToProps = {
  openModal,
  closeModal,
};

export default connect(mapStateToProps, mapDispatchToProps)(UserModal);
