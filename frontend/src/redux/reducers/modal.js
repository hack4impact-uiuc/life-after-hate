import { MODAL_OPEN, MODAL_CLOSE, MODAL_TOGGLE } from "../actions/modal";

const DEFAULT_STATE = { isOpen: false, editable: true };

const modal = (state = DEFAULT_STATE, action) => {
  switch (action.type) {
    case MODAL_OPEN:
      return { ...state, ...action.payload, isOpen: true };
    case MODAL_CLOSE:
      return DEFAULT_STATE;
    case MODAL_TOGGLE:
      return { ...state, isOpen: !state.isOpen };
    default:
      return state;
  }
};

export default modal;
