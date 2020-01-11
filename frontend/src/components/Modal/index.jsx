import React from "react";
import { Button, Modal, ModalHeader, ModalBody } from "reactstrap";
import Close from "../../assets/images/close.svg";
import { useForm } from "react-hook-form";
import { createSelector } from "reselect";
import { connect } from "react-redux";
import { editAndRefreshResource, addAndRefreshResource } from "../../utils/api";
import { openModal, closeModal } from "../../redux/actions/modal";
import "./styles.scss";

const LAHModal = props => {
  const { register, handleSubmit, errors } = useForm();
  const onSubmit = data => {
    props.isAddingResource ? handleAddResource(data) : handleEditResource(data);
  };

  const handleEditResource = async data => {
    await editAndRefreshResource(data, props.resource._id);
    props.closeModal();
  };

  const handleAddResource = async data => {
    await addAndRefreshResource(data);
    props.closeModal();
  };
  return (
    <div className="modal-wrap-ee">
      <Modal fade={false} isOpen={props.isOpen}>
        <ModalHeader>
          {props.title}
          <Button
            color="link"
            className="close-button"
            onClick={props.closeModal}
          >
            <img id="close-image" src={Close} alt="close" />
          </Button>
        </ModalHeader>
        <ModalBody
          style={{
            maxHeight: "calc(100vh - 210px)",
            overflowY: "auto"
          }}
        >
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
              <Button id="submit-form-button" type="submit">
                Save
              </Button>
            )}
          </form>
        </ModalBody>
      </Modal>
    </div>
  );
};

const resourceIdSelector = state => state.modal.resourceId;

// Gets the current resource for the modal
const currentResourceSelector = createSelector(
  [state => state.resources, resourceIdSelector],
  (resources, id) => {
    if (!id) {
      return {};
    }
    return resources.find(resource => resource._id === id);
  }
);

// Derives the modal title
const titleSelector = createSelector(
  [currentResourceSelector, state => state.modal.editable],
  (resource, editable) => {
    if (!resource._id) {
      // If there's no currently selected resource, we're adding a new one
      return "Add Resource";
    }
    if (!editable) {
      // View only, so just return the name
      return resource.companyName;
    }
    return "Edit Resource";
  }
);

// Returns whether the user is adding a new resource
const isAddingResourceSelector = createSelector(
  [resourceIdSelector],
  id => (id ? false : true)
);

const mapStateToProps = state => ({
  isOpen: state.modal.isOpen,
  resource: currentResourceSelector(state),
  title: titleSelector(state),
  isAddingResource: isAddingResourceSelector(state),
  editable: state.modal.editable
});

const mapDispatchToProps = {
  openModal,
  closeModal
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LAHModal);
