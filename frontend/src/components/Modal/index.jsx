import React from "react";
import { Button, Modal, ModalHeader, ModalBody } from "reactstrap";
import Close from "../../assets/images/close.svg";
import { useForm } from "react-hook-form";
import { connect } from "react-redux";
import { editAndRefreshResource } from "../../utils/api";
import { openModal, closeModal } from "../../redux/actions/modal";
import "./styles.scss";

const LAHModal = props => {
  const { register, handleSubmit, errors } = useForm();
  const onSubmit = data => {
    console.log(data);
    handleEditResource(data);
  };

  const handleEditResource = async data => {
    await editAndRefreshResource(data, props.id);
    // await this.props.updateResources();
  };

  return (
    <div className="modal-wrap-ee">
      <Modal fade={false} isOpen={props.isOpen}>
        <ModalHeader>
          {props.modalName}
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
                defaultValue={props.companyName}
                className="modal-input-field"
                disabled={props.cardClicked}
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
                defaultValue={props.resourceContact}
                className="modal-input-field"
                disabled={props.cardClicked}
              />
            </label>
            <label className="modal-lab">
              <p>Contact Phone</p>
              <input
                ref={register}
                type="text"
                name="contactPhone"
                defaultValue={props.resourcePhone}
                className="modal-input-field"
                disabled={props.cardClicked}
              />
            </label>
            <label className="modal-lab">
              <p>Contact Email</p>
              <input
                ref={register}
                type="text"
                name="contactEmail"
                defaultValue={props.resourceEmail}
                className="modal-input-field"
                disabled={props.cardClicked}
              />
            </label>
            <label className="modal-lab">
              <p>Description</p>
              <textarea
                ref={register}
                name="description"
                defaultValue={props.resourceDescription}
                className="modal-input-field modal-input-textarea"
                rows="10"
                disabled={props.cardClicked}
              />
            </label>
            <label className="modal-lab">
              <p>Address</p>
              <input
                ref={register}
                name="address"
                type="text"
                defaultValue={props.resourceAddress}
                className="modal-input-field"
                disabled={props.cardClicked}
              />
            </label>
            <label className="modal-lab">
              <p>Notes</p>
              <textarea
                ref={register}
                name="notes"
                defaultValue={props.resourceNotes}
                className="modal-input-field modal-input-textarea"
                rows="5"
                disabled={props.cardClicked}
              />
            </label>
            {props.cardClicked ? null : (
              <Button
                id="submit-form-button"
                type="submit"
                onClick={props.toggleModal}
              >
                Save
              </Button>
            )}
          </form>
        </ModalBody>
      </Modal>
    </div>
  );
};
const mapStateToProps = state => ({
  isOpen: state.modal.isOpen
});

const mapDispatchToProps = {
  openModal,
  closeModal
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LAHModal);
