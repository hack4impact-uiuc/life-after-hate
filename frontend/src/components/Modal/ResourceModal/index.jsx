import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { connect } from "react-redux";
import { Button } from "reactstrap";
import { openModal, closeModal } from "../../../redux/actions/modal";
import { modalEnum, resourceEnum } from "../../../utils/enums";
import {
  editAndRefreshResource,
  addAndRefreshResource,
  deleteAndRefreshResource,
} from "../../../utils/api";
import {
  currentResourceSelector,
  isAddingResourceSelector,
} from "../../../redux/selectors/modal";
import LAHModal from "../../Modal";
import "../styles.scss";

const ResourceModal = ({
  resource,
  isAddingResource,
  closeModal,
  editable,
  isOpen,
  modalType,
}) => {
  const { register, handleSubmit, errors } = useForm();
  const [deleteClicked, setDeleteClicked] = useState(false);

  const onSubmit = (data) => {
    isAddingResource ? handleAddResource(data) : handleEditResource(data);
  };

  const handleEditResource = async (data) => {
    data.tags = data.tags
      .split(",")
      .filter((t) => t)
      .map((tag) => tag.trim());
    await editAndRefreshResource(data, resource._id);
    closeModal();
  };

  const handleAddResource = async (data) => {
    data.tags = data.tags
      .split(",")
      .filter((t) => t)
      .map((tag) => tag.trim());
    await addAndRefreshResource(data);
    closeModal();
  };

  const handleDeleteResource = () => {
    if (!deleteClicked) {
      return setDeleteClicked(true);
    }
    closeModal();
    setDeleteClicked(false);
    return deleteAndRefreshResource(resource._id);
  };
  const isIndividualResource = resource.type === resourceEnum.INDIVIDUAL;
  const getIndividualResourceFields = () => (
    <React.Fragment>
      <label className="modal-lab">
        <p>Skills & Qualifications</p>
        <textarea
          ref={register({ required: true })}
          name="skills"
          defaultValue={resource.skills}
          className={`modal-input-field modal-input-textarea ${
            errors.skills ? "invalid" : ""
          }`}
          rows="10"
          disabled={!editable}
        />
      </label>
      <label className="modal-lab">
        <p>Volunteer Roles</p>
        <input
          ref={register({ required: true })}
          type="text"
          name="volunteerRoles"
          defaultValue={resource.volunteerRoles}
          className={`modal-input-field ${
            errors.availability ? "invalid" : ""
          }`}
          disabled={!editable}
        />
      </label>
      <label className="modal-lab">
        <p>Availability</p>
        <input
          ref={register({ required: true })}
          type="text"
          name="availability"
          defaultValue={resource.availability}
          className={`modal-input-field ${
            errors.availability ? "invalid" : ""
          }`}
          disabled={!editable}
        />
      </label>
      <label className="modal-lab">
        <p>Why Volunteer?</p>
        <textarea
          ref={register({ required: true })}
          type="text"
          name="volunteerReason"
          defaultValue={resource.volunteerReason}
          className={`modal-input-field modal-input-textarea ${
            errors.volunteerReason ? "invalid" : ""
          }`}
          disabled={!editable}
        />
      </label>
    </React.Fragment>
  );

  return (
    <div className="modal-wrap-ee">
      {isOpen && modalType === modalEnum.RESOURCE && (
        <LAHModal>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="add-edit-resource-form"
          >
            {!isIndividualResource && (
              <label className="modal-lab">
                <p>Company Name</p>
                <input
                  ref={register({ required: true })}
                  type="text"
                  name="companyName"
                  defaultValue={resource.companyName}
                  className={`modal-input-field ${
                    errors.contactName ? "invalid" : ""
                  }`}
                  disabled={!editable}
                />
              </label>
            )}
            <label className="modal-lab">
              <p>Contact Name</p>
              <input
                ref={register({ required: true })}
                type="text"
                name="contactName"
                defaultValue={resource.contactName}
                className={`modal-input-field ${
                  errors.contactName ? "invalid" : ""
                }`}
                disabled={!editable}
              />
            </label>
            <label className="modal-lab">
              <p>Contact Phone</p>
              <input
                ref={register({ required: true })}
                type="text"
                name="contactPhone"
                defaultValue={resource.contactPhone}
                className={`modal-input-field ${
                  errors.contactPhone ? "invalid" : ""
                }`}
                disabled={!editable}
              />
            </label>
            <label className="modal-lab">
              <p>Contact Email</p>
              <input
                ref={register({ required: true })}
                type="text"
                name="contactEmail"
                defaultValue={resource.contactEmail}
                className={`modal-input-field ${
                  errors.contactEmail ? "invalid" : ""
                }`}
                disabled={!editable}
              />
            </label>
            {isIndividualResource && getIndividualResourceFields()}
            <label className="modal-lab">
              <p>Description</p>
              <textarea
                ref={register({ required: true })}
                name="description"
                defaultValue={resource.description}
                rows="5"
                className={`modal-input-field modal-input-textarea ${
                  errors.description ? "invalid" : ""
                }`}
                disabled={!editable}
              />
            </label>
            <label className="modal-lab">
              <p>Tags</p>
              <input
                ref={register}
                name="tags"
                defaultValue={isAddingResource ? "" : resource.tags.join(", ")}
                className={`modal-input-field ${errors.tags && "invalid"}`}
                disabled={!editable}
              />
            </label>
            <label className="modal-lab">
              <p>Address</p>
              <input
                ref={register({ required: true })}
                name="address"
                type="text"
                defaultValue={resource.address}
                className={`modal-input-field ${errors.address && "invalid"}`}
                disabled={!editable}
              />
            </label>
            <label className="modal-lab">
              <p>Resource Type</p>
              <input
                ref={register({ required: true })}
                name="type"
                defaultValue={resource.type}
                rows="5"
                className={`modal-input-field ${errors.notes ? "invalid" : ""}`}
                disabled
              />
              <label className="modal-lab">
                <p>Notes</p>
                <textarea
                  ref={register({ required: true })}
                  name="notes"
                  defaultValue={resource.notes}
                  rows="5"
                  className={`modal-input-field modal-input-textarea ${
                    errors.notes ? "invalid" : ""
                  }`}
                  disabled={!editable}
                />
              </label>
            </label>
            {editable && (
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

const mapStateToProps = (state) => ({
  isOpen: state.modal.isOpen,
  resource: currentResourceSelector(state),
  isAddingResource: isAddingResourceSelector(state),
  editable: state.modal.editable,
  modalType: state.modal.modalType,
});

const mapDispatchToProps = {
  openModal,
  closeModal,
};

export default connect(mapStateToProps, mapDispatchToProps)(ResourceModal);
