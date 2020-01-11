export const MODAL_OPEN = "MODAL_OPEN";
export const MODAL_CLOSE = "MODAL_CLOSE";
export const MODAL_TOGGLE = "MODAL_TOGGLE";

export const openModal = payload => ({ type: MODAL_OPEN, payload });
export const closeModal = () => ({ type: MODAL_CLOSE });
export const toggleModal = () => ({ type: MODAL_TOGGLE });
