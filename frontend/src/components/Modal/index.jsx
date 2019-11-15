// import React, { Component } from "react";
// import { Button } from "reactstrap";
// import Exit from "../../assets/images/close.svg";

// import "./styles.scss";

// class Modal extends Component {
//   render() {
//     const name = this.props.showModal
//       ? "lahmodal display-modal"
//       : "lahmodal hide-modal";

//     return (
//       <div className={name}>
//         <section className="modal-main">
//           <div className="lah-modal-header">
//             <h2>{this.props.modalName}</h2>
//             <Button color="link" onClick={this.props.toggleModal}>
//               <img src={Exit} alt="close" id="close-button" />
//             </Button>
//           </div>
//           <form onSubmit={this.handleSubmit} className="add-edit-resource-form">
//             <label>
//               Resource Name
//               <input type="text" onChange={this.handleChange} />
//             </label>
//             <label>
//               Resource Location
//               <input type="text" onChange={this.handleChange} />
//             </label>
//             <label>
//               Resource Tags
//               <input type="text" onChange={this.handleChange} />
//             </label>
//             <label>
//               Description
//               <input type="text" onChange={this.handleChange} />
//             </label>
//             <label>
//               Description
//               <input type="text" onChange={this.handleChange} />
//             </label>
//             <label>
//               Description
//               <input type="text" onChange={this.handleChange} />
//             </label>
//             <label>
//               Description
//               <input type="text" onChange={this.handleChange} />
//             </label>
//             <label>
//               Description
//               <input type="text" onChange={this.handleChange} />
//             </label>
//             <label>
//               Description
//               <input type="text" onChange={this.handleChange} />
//             </label>
//             <label>
//               Description
//               <input type="text" onChange={this.handleChange} />
//             </label>
//             <label>
//               Description
//               <input type="text" onChange={this.handleChange} />
//             </label>
//           </form>
//           <div className="lah-modal-footer">
//             <Button
//               color="info"
//               onClick={this.props.toggleModal}
//               id="save-button"
//             >
//               Save
//             </Button>
//           </div>
//         </section>
//       </div>
//     );
//   }
// }

// export default Modal;

import React, { Component } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import "./styles.scss";

class LAHModal extends Component {
  render() {
    return (
      <div>
        <Modal fade={false} isOpen={this.props.showModal}>
          <ModalHeader>{this.props.modalName}</ModalHeader>
          <ModalBody
            style={{
              "max-height": "calc(100vh - 210px)",
              "overflow-y": "auto"
            }}
          >
            <form
              onSubmit={this.handleSubmit}
              className="add-edit-resource-form"
            >
              <label>
                Resource Name
                <input type="text" onChange={this.handleChange} />
              </label>
              <label>
                Resource Location
                <input type="text" onChange={this.handleChange} />
              </label>
              <label>
                Resource Tags
                <input type="text" onChange={this.handleChange} />
              </label>
              <label>
                Description
                <input type="text" onChange={this.handleChange} />
              </label>
            </form>
          </ModalBody>
          <ModalFooter>
            <Button color="info" onClick={this.props.toggleModal}>
              Save
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

export default LAHModal;
