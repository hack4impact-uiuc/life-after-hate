import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { connect } from "react-redux";
import { Button } from "reactstrap";
import { openModal, closeModal } from "../../../redux/actions/modal";
import { modalEnum } from "../../../utils/enums";
import {
  editAndRefreshResource,
  addAndRefreshResource,
  deleteAndRefreshResource
} from "../../../utils/api";
import {
  currentResourceSelector,
  isAddingResourceSelector
} from "../../../redux/selectors/modal";
import LAHModal from "../../Modal";
import "../styles.scss";

const ResourceModal = props => {
  const { register, handleSubmit, errors } = useForm();
  const [deleteClicked, setDeleteClicked] = useState(false);

  const onSubmit = data => {
    props.isAddingResource ? handleAddResource(data) : handleEditResource(data);
  };

  const handleEditResource = async data => {
    data.tags = data.tags.split(",").map(tag => tag.trim());
    await editAndRefreshResource(data, props.resource._id);
    props.closeModal();
  };

  const handleAddResource = async data => {
    await addAndRefreshResource(data);
    props.closeModal();
  };

  const handleDeleteResource = () => {
    if (!deleteClicked) {
      return setDeleteClicked(true);
    }
    props.closeModal();
    setDeleteClicked(false);
    return deleteAndRefreshResource(props.resource._id);
  };

  return (
    <div className="modal-wrap-ee">
      {props.isOpen && props.modalType === modalEnum.RESOURCE && (
        <LAHModal>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="add-edit-resource-form"
          >
            <label className="modal-lab">
              <p>Resource Name</p>
              <input
                ref={register({ required: true })}
                type="text"
                name="companyName"
                defaultValue={props.resource.companyName}
                className="modal-input-field"
                disabled={!props.editable}
              />
              {/* errors will return when field validation fails  */}
              {errors.companyName && <span>This field is required</span>}
            </label>
            <label className="modal-lab">
              <p>Contact Name</p>
              <input
                ref={register}
                type="text"
                name="contactName"
                defaultValue={props.resource.contactName}
                className="modal-input-field"
                disabled={!props.editable}
              />
            </label>
            <label className="modal-lab">
              <p>Contact Phone</p>
              <input
                ref={register}
                type="text"
                name="contactPhone"
                defaultValue={props.resource.contactPhone}
                className="modal-input-field"
                disabled={!props.editable}
              />
            </label>
            <label className="modal-lab">
              <p>Contact Email</p>
              <input
                ref={register}
                type="text"
                name="contactEmail"
                defaultValue={props.resource.contactEmail}
                className="modal-input-field"
                disabled={!props.editable}
              />
            </label>
            <label className="modal-lab">
              <p>Description</p>
              <textarea
                ref={register}
                name="description"
                defaultValue={props.resource.description}
                className="modal-input-field modal-input-textarea"
                rows="10"
                disabled={!props.editable}
              />
            </label>
            <label className="modal-lab">
              <p>Tags</p>
              <input
                ref={register}
                name="tags"
                defaultValue={
                  props.isAddingResource ? "" : props.resource.tags.join(", ")
                }
                className="modal-input-field"
                disabled={!props.editable}
              />
            </label>
            <label className="modal-lab">
              <p>Address</p>
              <input
                ref={register}
                name="address"
                type="text"
                defaultValue={props.resource.address}
                className="modal-input-field"
                disabled={!props.editable}
              />
            </label>
            <label className="modal-lab">
              <p>Notes</p>
              <textarea
                ref={register}
                name="notes"
                defaultValue={props.resource.notes}
                className="modal-input-field modal-input-textarea"
                rows="5"
                disabled={!props.editable}
              />
            </label>
            {props.editable && (
              <div>
                <Button id="submit-form-button" type="submit">
                  Save
                </Button>
                <Button
                  id="delete-form-button"
                  onClick={handleDeleteResource}
                  onBlur={() => setDeleteClicked(false)}
                >
                  {deleteClicked ? "Confirm" : "Delete"}
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
  resource: currentResourceSelector(state),
  isAddingResource: isAddingResourceSelector(state),
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
)(ResourceModal);
