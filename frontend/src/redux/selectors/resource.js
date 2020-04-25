import { createSelector } from "reselect";

import { tagSelector } from "./tags";

export const resourceSelector = (state) => state.resources;

export const tagFilteredResourceSelector = createSelector(
  [tagSelector, resourceSelector],
  (tags, resources) => {
    if (!resources) {
      return [];
    }
    const tagMatch = (resource) => tags.every((t) => resource.tags.includes(t));
    return resources.filter(tagMatch);
  }
);
