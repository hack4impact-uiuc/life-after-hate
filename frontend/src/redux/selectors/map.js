import { createSelector } from "reselect";
import { resourceSelector } from "./resource";

// Gets the ID of the selected resource for the map
export const mapResourceIdSelector = state => state.map.selectedId;

// Gets the current resource for the modal
export const currentResourceSelector = createSelector(
  [resourceSelector, mapResourceIdSelector],
  (resources, id) => {
    if (!id) {
      return {};
    }
    return resources.find(resource => resource._id === id);
  }
);
