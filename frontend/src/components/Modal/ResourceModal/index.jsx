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
import ModalInput from "../ModalInput";
import "../styles.scss";

const IndividualResourceFields = [
  { labelText: "Contact Name", shortName: "contactName", required: true },
  { labelText: "Contact Phone", shortName: "contactPhone" },
  { labelText: "Contact Email", shortName: "contactEmail" },
  {
    labelText: "Skills & Qualifications",
    shortName: "skills",
    isTextArea: true,
  },
  { labelText: "Volunteer Roles", shortName: "volunteerRoles" },
  { labelText: "Availability", shortName: "availability" },
  {
    labelText: "Why Volunteer?",
    shortName: "volunteerReason",
    isTextArea: true,
  },
  { labelText: "Address", shortName: "address" },
  { labelText: "Notes", shortName: "notes" },
];

const GroupResourceFields = [
  { labelText: "Contact Name", shortName: "contactName", required: true },
  { labelText: "Company Name", shortName: "companyName", required: true },
  { labelText: "Contact Phone", shortName: "contactPhone" },
  { labelText: "Contact Email", shortName: "contactEmail" },
  {
    labelText: "Description",
    shortName: "description",
    isTextArea: true,
  },
  { labelText: "Address", shortName: "address" },
  { labelText: "Notes", shortName: "notes" },
];

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

  const createInput = ({ required, shortName, ...props }) => (
    <ModalInput
      componentRef={register({ required: required ?? false })}
      resource={resource}
      errors={errors}
      disabled={!editable}
      key={shortName}
      {...{ required, shortName, ...props }}
    ></ModalInput>
  );

  const getIndividualResourceFields = () =>
    IndividualResourceFields.map(createInput);
  const getGroupResourceFields = () => GroupResourceFields.map(createInput);

  // If a new resource, defer to the dropdown, else defer to the resource
  const isIndividualResource = isAddingResource
    ? groupType === resourceEnum.INDIVIDUAL
    : resource.type === resourceEnum.INDIVIDUAL;

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
            data-cy="modal-resourceType"
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
        {isIndividualResource
          ? getIndividualResourceFields()
          : getGroupResourceFields()}
        {createInput({
          labelText: "Tags",
          shortName: "tags",
          defaultValue: isAddingResource ? "" : resource.tags.join(", "),
        })}
        {editable && (
          <div style={{ marginTop: "20px" }}>
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
