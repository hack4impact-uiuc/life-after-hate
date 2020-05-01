import { createSelector } from "reselect";
import { resourceSelector } from "./resource";
import { tagSelector } from "./tags";
// Gets the ID of the selected resource for the map
export const mapResourceIdSelector = (state) => state.map.selectedId;

// Gets the current resource selected on the map
export const currentResourceSelector = createSelector(
  [resourceSelector, mapResourceIdSelector],
  (resources, id) => {
    if (!id) {
      return {};
    }
    return resources.find((resource) => resource._id === id);
  }
);

// Filter out resources that don't have a location
export const mappableResourceSelector = createSelector(
  [resourceSelector],
  (resources) =>
    resources.filter(
      (r) => r.location.coordinates[0] && r.location.coordinates[1]
    )
);

export const tagFilteredResourceSelector = createSelector(
  [tagSelector, mappableResourceSelector],
  (tags, resources) => {
    if (!resources) {
      return [];
    }
    const tagMatch = (resource) => tags.every((t) => resource.tags.includes(t));
    return resources.filter(tagMatch);
  }
);
