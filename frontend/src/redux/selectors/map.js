import { createSelector } from "reselect";
import { resourceSelector, tagFilteredResourceSelector } from "./resource";

export const searchQuerySelector = (state) => state.map.search.query;
export const searchLocationSelector = (state) => state.map.search.location;

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
  [tagFilteredResourceSelector],
  (resources) =>
    resources.filter(
      (r) => r.location.coordinates[0] && r.location.coordinates[1]
    )
);
