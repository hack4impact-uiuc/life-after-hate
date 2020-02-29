import React from "react";
import { useForm } from "react-hook-form";
import { connect } from "react-redux";
import { Button } from "reactstrap";
import { openModal, closeModal } from "../../../redux/actions/modal";
import { modalEnum } from "../../../utils/enums";
import { editAndRefreshUser } from "../../../utils/api";
import { currentUserSelector } from "../../../redux/selectors/modal";
import LAHModal from "../../Modal";
import "../styles.scss";

const UserModal = props => {
  const { register, handleSubmit } = useForm();

  const onSubmit = data => handleEditUser(data);

  const handleEditUser = async data => {
    await editAndRefreshUser(data, props.usere._id);
    props.closeModal();
  };

  return (
    // TODO: adapt to user modal fields
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
                name="userName"
                defaultValue={`${props.user.firstName} ${props.user.lastName}`}
                className="modal-input-field"
                disabled={true}
              />
            </label>
            <label className="modal-lab">
              <p>Email</p>
              <input
                ref={register}
                type="text"
                name="userEmail"
                defaultValue={props.user.email}
                className="modal-input-field"
                disabled={true}
              />
            </label>
            <label className="modal-lab">
              <p>Role</p>
              <input
                ref={register}
                type="text" // TODO: Make select
                name="userRole"
                defaultValue={props.user.role}
                className="modal-input-field"
                disabled={!props.editable}
              />
            </label>
            <label className="modal-lab">
              <p>Title</p>
              <textarea
                ref={register}
                name="userTitle"
                defaultValue={props.user.title}
                className="modal-input-field modal-input-textarea"
                rows="3"
                disabled={!props.editable}
              />
            </label>
            {props.editable && (
              <div>
                <Button id="submit-form-button" type="submit">
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

const mapStateToProps = state => ({
  isOpen: state.modal.isOpen,
  user: currentUserSelector(state),
  editable: state.modal.editable,
  modalType: state.modal.modalType
});

const mapDispatchToProps = {
  openModal,
  closeModal
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UserModal);
