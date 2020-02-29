import { createSelector } from "reselect";
import { resourceSelector } from "./resource";
import { userSelector } from "./users";
import { modalEnum } from "../../utils/enums";

// Gets the ID of the selected resource/user for the modal to display
export const modalResourceIdSelector = state => state.modal.resourceId;
export const modalUserIdSelector = state => state.modal.userId;

// Gets the current resource for the modal
export const currentResourceSelector = createSelector(
  [resourceSelector, modalResourceIdSelector],
  (resources, id) => {
    if (!id) {
      return {};
    }
    return resources.find(resource => resource._id === id);
  }
);

export const currentUserSelector = createSelector(
  [userSelector, modalUserIdSelector],
  (users, id) => {
    if (!id) {
      return {};
    }
    return users.find(user => user._id === id);
  }
);

// Derives the modal title
export const titleSelector = createSelector(
  [
    currentResourceSelector,
    currentUserSelector,
    state => state.modal.modalType,
    state => state.modal.editable
  ],
  (resource, user, modalType, editable) => {
    if (modalType === modalEnum.RESOURCE) {
      if (!resource._id) {
        // If there's no currently selected resource, we're adding a new one
        return "Add Resource";
      }
      if (!editable) {
        // View only, so just return the name
        return resource.companyName;
      }
      return "Edit Resource";
    } else if (modalType === modalEnum.USER) {
      if (!user._id) {
        // There should never be no user ID
        return "";
      }
      if (!editable) {
        // View only, so just return the name
        return `${user.firstName} ${user.lastName}`;
      }
      // We are editing, so use Edit User
      return "Edit User";
    }
  }
);

// Returns whether the user is adding a new resource
export const isAddingResourceSelector = createSelector(
  [modalResourceIdSelector],
  id => (id ? false : true)
);
