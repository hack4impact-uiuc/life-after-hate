import { createSelector } from "reselect";

import { tagSelector } from "./tags";

export const resourceSelector = (state) => state.resources;

export const tagFilteredResourceSelector = createSelector(
  [tagSelector, resourceSelector],
  (tags, resources) => {
    console.log(resources);
    if (!resources) {
      return [];
    }
    var tagMatch = function (resource) {
      return tags.every((t) => resource.tags.includes(t));
    };
    return resources.filter(tagMatch);
  }
);
