import { modalEnum } from "../../utils/enums";

export const MODAL_OPEN = "MODAL_OPEN";
export const MODAL_CLOSE = "MODAL_CLOSE";

export const openModal = () => ({ type: MODAL_OPEN });
export const openResourceModal = () => ({
  type: MODAL_OPEN,
  modalType: modalEnum.RESOURCE,
});
export const openResourceModalWithPayload = (payload) => ({
  type: MODAL_OPEN,
  modalType: modalEnum.RESOURCE,
  payload,
});
export const openUserModalWithPayload = (payload) => ({
  type: MODAL_OPEN,
  modalType: modalEnum.USER,
  payload,
});
export const closeModal = () => ({ type: MODAL_CLOSE });
