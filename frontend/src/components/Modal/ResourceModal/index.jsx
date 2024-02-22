import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import { connect } from "react-redux";
import { Button } from "reactstrap";
import { closeModal } from "../../../redux/actions/modal";
import ModalTagComplete from "../ModalTagComplete";
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
import LastModifiedInfo from "../LastModifiedInfo";
import IndividualResourceForm from "./IndividualResourceForm";
import GroupResourceForm from "./GroupResourceForm";
import TangibleResourceForm from "./TangibleResourceForm";
import ModalInput from "../ModalInput";

export const ResourceFormInput = ({
  register,
  errors,
  editable,
  resource,
  required,
  tag,
  ...props
}) => (
  <ModalInput
    componentRef={register({ required: required ?? false })}
    resource={resource}
    errors={errors}
    disabled={!editable}
    tag={tag ?? "input"}
    {...{ required, ...props }}
  ></ModalInput>
);

ResourceFormInput.propTypes = {
  errors: PropTypes.object,
};

const ResourceModal = ({
  resource,
  isAddingResource,
  closeModal,
  editable,
}) => {
  const { register, handleSubmit, setValue, watch, errors } = useForm();
  useEffect(() => {
    register({ name: "tags" });
  }, [register]);

  const [deleteClicked, setDeleteClicked] = useState(false);
  const [groupType, setGroupType] = useState(
    resource.type ?? resourceEnum.INDIVIDUAL
  );
  const onSubmit = (data) => {
    isAddingResource ? handleAddResource(data) : handleEditResource(data);
  };

  const handleEditResource = async (data) => {
    await editAndRefreshResource(data, resource._id);
    closeModal();
  };

  const handleAddResource = async (data) => {
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
  const getResourceType = () => {
    if (isAddingResource) {
      return groupType;
    }
    return resource.type;
  };

  const getFormForType = () => {
    switch (getResourceType()) {
      case resourceEnum.INDIVIDUAL:
        return IndividualResourceForm;
      case resourceEnum.GROUP:
        return GroupResourceForm;
      default:
        return TangibleResourceForm;
    }
  };

  const FormComponent = getFormForType();
  const isExistingResource = !isAddingResource;

  return (
    <LAHModal>
      <form className="add-edit-resource-form">
        {isExistingResource && (
          <LastModifiedInfo resource={resource}></LastModifiedInfo>
        )}
        <label className="modal-lab">
          <p>Resource Type</p>
          <select
            ref={register({ required: true })}
            name="type"
            data-cy="modal-resourceType"
            value={groupType}
            rows="5"
            className={`modal-input-field ${errors.type ? "invalid" : ""}`}
            disabled={isExistingResource}
            onChange={(e) => setGroupType(e.target.value)}
          >
            <option>{resourceEnum.INDIVIDUAL}</option>
            <option>{resourceEnum.GROUP}</option>
            <option value={resourceEnum.TANGIBLE}>RESOURCE</option>
          </select>
        </label>
        {
          <FormComponent
            register={register}
            resource={resource}
            errors={errors}
            editable={editable}
          ></FormComponent>
        }
        <label className="modal-lab">
          <p>{"Tags"}</p>
          <ModalTagComplete
            onChange={(_, value) => {
              setValue("tags", value);
            }}
            tags={watch("tags") ?? resource.tags ?? []}
            disabled={!editable}
          ></ModalTagComplete>
        </label>
        {editable && (
          <div style={{ marginTop: "20px" }}>
            <Button
              id="submit-form-button"
              type="button"
              onClick={handleSubmit(onSubmit)}
            >
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
  closeModal,
};

ResourceModal.propTypes = {
  resource: PropTypes.shape({
    type: PropTypes.oneOf(Object.values(resourceEnum)),
    _id: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  isAddingResource: PropTypes.bool.isRequired,
  editable: PropTypes.bool.isRequired,
  closeModal: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(ResourceModal);
