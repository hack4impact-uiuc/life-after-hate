import { createSelector } from "reselect";
import { resourceSelector } from "./resource";

// Gets the ID of the selected resource for the modal to display
export const modalResourceIdSelector = state => state.modal.resourceId;

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

// Derives the modal title
export const titleSelector = createSelector(
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
export const isAddingResourceSelector = createSelector(
  [modalResourceIdSelector],
  id => (id ? false : true)
);
