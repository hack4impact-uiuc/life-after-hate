import { createSelector } from "reselect";
export const resourceIdSelector = state => state.modal.resourceId;

// Gets the current resource for the modal
export const currentResourceSelector = createSelector(
  [state => state.resources, resourceIdSelector],
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
  [resourceIdSelector],
  id => (id ? false : true)
);
