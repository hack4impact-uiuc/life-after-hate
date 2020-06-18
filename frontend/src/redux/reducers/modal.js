import { MODAL_OPEN, MODAL_CLOSE } from "../actions/modal";
import { modalEnum } from "../../utils/enums";
import { CHANGE_PAGE } from "../actions/nav";

const INITIAL_STATE = {
  isOpen: false,
  editable: true,
  modalType: modalEnum.RESOURCE,
};

const modal = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case MODAL_OPEN:
      return {
        ...state,
        ...action.payload,
        modalType: action.modalType,
        isOpen: true,
      };
    case CHANGE_PAGE:
    case MODAL_CLOSE:
      return { ...INITIAL_STATE };
    default:
      return state;
  }
};

export default modal;
