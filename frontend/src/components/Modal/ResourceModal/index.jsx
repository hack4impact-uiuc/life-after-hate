/* eslint-disable jsx-a11y/no-onchange */
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { connect } from "react-redux";
import { Button } from "reactstrap";
import { openModal, closeModal } from "../../../redux/actions/modal";
import { resourceEnum } from "../../../utils/enums";
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
}) => {
  const { register, handleSubmit, errors } = useForm();
  const [deleteClicked, setDeleteClicked] = useState(false);
  const [groupType, setGroupType] = useState(
    resource.type ?? resourceEnum.INDIVIDUAL
  );
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

  // If a new resource, defer to the dropdown, else defer to the resource
  const isIndividualResource = isAddingResource
    ? groupType === resourceEnum.INDIVIDUAL
    : resource.type === resourceEnum.INDIVIDUAL;
  const getIndividualResourceFields = () => (
    <React.Fragment>
      <label className="modal-lab">
        <p>Skills & Qualifications</p>
        <textarea
          ref={register}
          name="skills"
          data-cy="modal-skills"
          defaultValue={resource.skills}
          className="modal-input-field modal-input-textarea"
          rows="10"
          disabled={!editable}
        />
      </label>
      <label className="modal-lab">
        <p>Volunteer Roles</p>
        <input
          ref={register}
          type="text"
          name="volunteerRoles"
          data-cy="modal-roles"
          defaultValue={resource.volunteerRoles}
          className="modal-input-field"
          disabled={!editable}
        />
      </label>
      <label className="modal-lab">
        <p>Availability</p>
        <input
          ref={register}
          type="text"
          name="availability"
          data-cy="modal-availability"
          defaultValue={resource.availability}
          className="modal-input-field"
          disabled={!editable}
        />
      </label>
      <label className="modal-lab">
        <p>Why Volunteer?</p>
        <textarea
          ref={register}
          type="text"
          name="volunteerReason"
          data-cy="modal-volunteer-reason"
          defaultValue={resource.volunteerReason}
          className="modal-input-field modal-input-textarea"
          disabled={!editable}
        />
      </label>
    </React.Fragment>
  );

  return (
    <LAHModal>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="add-edit-resource-form"
      >
        <label className="modal-lab">
          <p>Resource Type</p>
          <select
            ref={register({ required: true })}
            name="type"
            data-cy="modal-resource-type"
            value={groupType}
            rows="5"
            className={`modal-input-field ${errors.type ? "invalid" : ""}`}
            disabled={!isAddingResource}
            onChange={(e) => setGroupType(e.target.value)}
          >
            <option>{resourceEnum.INDIVIDUAL}</option>
            <option>{resourceEnum.GROUP}</option>
          </select>
        </label>

        {!isIndividualResource && (
          <label className="modal-lab">
            <p>Company Name</p>
            <input
              ref={register({ required: true })}
              type="text"
              name="companyName"
              data-cy="modal-company-name"
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
            data-cy="modal-contact-name"
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
            ref={register}
            type="text"
            name="contactPhone"
            data-cy="modal-contact-phone"
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
            data-cy="modal-contact-email"
            defaultValue={resource.contactEmail}
            className={`modal-input-field ${
              errors.contactEmail ? "invalid" : ""
            }`}
            disabled={!editable}
          />
        </label>
        {isIndividualResource ? (
          getIndividualResourceFields()
        ) : (
          <label className="modal-lab">
            <p>Description</p>
            <textarea
              ref={register}
              name="description"
              data-cy="modal-description"
              defaultValue={resource.description}
              rows="5"
              className={`modal-input-field modal-input-textarea ${
                errors.description ? "invalid" : ""
              }`}
              disabled={!editable}
            />
          </label>
        )}

        <label className="modal-lab">
          <p>Tags</p>
          <input
            ref={register}
            name="tags"
            data-cy="modal-tags"
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
            data-cy="modal-address"
            type="text"
            defaultValue={resource.address}
            className={`modal-input-field ${errors.address && "invalid"}`}
            disabled={!editable}
          />
        </label>

        <label className="modal-lab">
          <p>Notes</p>
          <textarea
            ref={register}
            name="notes"
            data-cy="modal-notes"
            defaultValue={resource.notes}
            rows="5"
            className="modal-input-field modal-input-textarea"
            disabled={!editable}
          />
        </label>
        {editable && (
          <div>
            <Button id="submit-form-button" type="submit">
              Save
            </Button>
            {!isAddingResource && (
              <Button
                id="delete-form-button"
                onClick={handleDeleteResource}
                onBlur={() => setDeleteClicked(false)}
              >
                {deleteClicked ? "Confirm" : "Delete"}
              </Button>
            )}
          </div>
        )}
      </form>
    </LAHModal>
  );
};

const mapStateToProps = (state) => ({
  resource: currentResourceSelector(state),
  isAddingResource: isAddingResourceSelector(state),
  editable: state.modal.editable,
});

const mapDispatchToProps = {
  openModal,
  closeModal,
};

export default connect(mapStateToProps, mapDispatchToProps)(ResourceModal);
