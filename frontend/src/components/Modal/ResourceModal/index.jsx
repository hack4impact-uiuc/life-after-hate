import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import { connect } from "react-redux";
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
import "./styles.scss";
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
  shortName,
  ...props
}) => (
  <div
    className={`resource-editor-field ${tag === "textarea" || shortName === "address" ? "resource-editor-field--wide" : ""}`}
  >
    <ModalInput
      registration={register(shortName, { required: required ?? false })}
      shortName={shortName}
      resource={resource}
      errors={errors}
      disabled={!editable}
      tag={tag ?? "input"}
      aria-required={required || undefined}
      aria-invalid={errors?.[shortName] ? true : undefined}
      {...{ required, ...props }}
      labelText={
        <>
          {props.labelText}
          {required && <span className="resource-editor-required"> *</span>}
        </>
      }
    ></ModalInput>
    {errors?.[shortName] && (
      <span className="resource-editor-error" role="alert">
        {props.labelText} is required.
      </span>
    )}
  </div>
);

ResourceFormInput.propTypes = {
  errors: PropTypes.object,
};

// Submit only editable fields; read models also contain IDs, coordinates,
// audit metadata and legacy fields that the API must never accept from a form.
const editableFields = new Set([
  "type",
  "contactName",
  "contactPhone",
  "contactEmail",
  "address",
  "websiteURL",
  "notes",
  "tags",
  "availability",
  "howDiscovered",
  "volunteerReason",
  "skills",
  "volunteerRoles",
  "description",
  "companyName",
  "quantity",
  "resourceName",
]);
const formPayload = (data) =>
  Object.fromEntries(
    Object.entries(data).filter(([key]) => editableFields.has(key)),
  );

export const ResourceModal = ({
  resource,
  isAddingResource,
  closeModal,
  editable,
  isOpen,
  onClosed,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      ...resource,
      type: resource.type ?? resourceEnum.INDIVIDUAL,
      tags: resource.tags ?? [],
    },
  });
  useEffect(() => {
    register("tags");
  }, [register]);

  const [deleteClicked, setDeleteClicked] = useState(false);
  const [groupType, setGroupType] = useState(
    resource.type ?? resourceEnum.INDIVIDUAL,
  );
  useEffect(() => {
    if (!isAddingResource && !resource._id) closeModal();
  }, [isAddingResource, resource._id, closeModal]);
  const [pending, setPending] = useState(null);
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

  const runMutation = async (operation, request) => {
    if (inFlight.current || !editable) return;
    inFlight.current = true;
    setPending(operation);
    setRequestError("");
    try {
      await request();
      if (active.current) closeModal();
    } catch {
      if (active.current)
        setRequestError(
          operation === "delete"
            ? "We couldn’t complete the deletion. Please try again."
            : "We couldn’t complete the save. Your entries are still here. Please try again.",
        );
    } finally {
      inFlight.current = false;
      if (active.current) setPending(null);
    }
  };
  const onSubmit = (data) =>
    runMutation("save", () =>
      isAddingResource
        ? addAndRefreshResource(formPayload(data))
        : editAndRefreshResource(formPayload(data), resource._id),
    );

  const handleDeleteResource = () => {
    if (inFlight.current) return;
    if (!deleteClicked) return setDeleteClicked(true);
    return runMutation("delete", () => deleteAndRefreshResource(resource._id));
  };

  if (!isAddingResource && !resource._id) return null;

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

  const typeLabels = {
    [resourceEnum.INDIVIDUAL]: "Individual",
    [resourceEnum.GROUP]: "Group",
    [resourceEnum.TANGIBLE]: "Resource",
  };
  const typeLabel = typeLabels[getResourceType()];
  const title = isAddingResource
    ? `New ${typeLabel.toLowerCase()}`
    : `${editable ? "Edit" : "View"} ${typeLabel.toLowerCase()}`;

  return (
    <LAHModal
      isOpen={isOpen}
      onClosed={onClosed}
      busy={!!pending}
      modalClassName="resource-editor-modal"
      headerTitle={title}
      subtitle={`${typeLabel} · ${isAddingResource ? "Unsaved resource" : editable ? "Resource details" : "View only"}`}
    >
      <form
        className="add-edit-resource-form resource-editor-form"
        aria-busy={!!pending}
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="resource-editor-scroll">
          <fieldset
            className="resource-editor-type"
            disabled={isExistingResource || !editable || !!pending}
          >
            <legend>
              Resource type{" "}
              <span>
                —{" "}
                {isExistingResource
                  ? "set when created"
                  : "changes the fields below"}
              </span>
            </legend>
            <div
              className="resource-editor-segments"
              data-cy="modal-resourceType"
            >
              {Object.entries(typeLabels).map(([value, label]) => (
                <label key={value}>
                  <input
                    type="radio"
                    {...register("type", { required: true })}
                    value={value}
                    checked={groupType === value}
                    onChange={() => {
                      setGroupType(value);
                      setValue("type", value);
                    }}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="resource-editor-grid" key={getResourceType()}>
            <FormComponent
              register={register}
              resource={resource}
              errors={errors}
              editable={editable && !pending}
            />
          </div>
          <div className="resource-editor-tags">
            <p>Tags</p>
            <ModalTagComplete
              onChange={(_, value) => setValue("tags", value)}
              tags={watch("tags") ?? resource.tags ?? []}
              disabled={!editable || !!pending}
            />
            {editable && (
              <small>
                Choose existing tags or type a new one and press Enter.
              </small>
            )}
          </div>
        </div>
        {requestError && (
          <p className="modal-request-error" role="alert">
            {requestError}
          </p>
        )}
        <footer className="resource-editor-footer">
          <span className="resource-editor-footer-note">
            {isAddingResource
              ? "Not saved yet"
              : editable
                ? "Changes are saved when you submit."
                : "Resource details"}
          </span>
          <div className="resource-editor-actions">
            {editable && isExistingResource && (
              <button
                type="button"
                id="delete-form-button"
                disabled={!!pending}
                onClick={handleDeleteResource}
                onBlur={() => setDeleteClicked(false)}
              >
                {pending === "delete"
                  ? "Deleting…"
                  : deleteClicked
                    ? "Confirm delete"
                    : "Delete"}
              </button>
            )}
            <button
              type="button"
              className="resource-editor-cancel"
              disabled={!!pending}
              onClick={closeModal}
            >
              {editable ? "Cancel" : "Close"}
            </button>
            {editable && (
              <button
                id="submit-form-button"
                type="submit"
                disabled={!!pending}
              >
                {pending === "save" ? "Saving…" : "Save resource"}
              </button>
            )}
          </div>
        </footer>
      </form>
    </LAHModal>
  );
};

const mapStateToProps = (state, ownProps) => ({
  resource: ownProps.resource ?? currentResourceSelector(state),
  isAddingResource:
    ownProps.isAddingResource ?? isAddingResourceSelector(state),
  editable: ownProps.editable ?? state.modal.editable,
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
  isOpen: PropTypes.bool,
  onClosed: PropTypes.func,
};

export default connect(mapStateToProps, mapDispatchToProps)(ResourceModal);
