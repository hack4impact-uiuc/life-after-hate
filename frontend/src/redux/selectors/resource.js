import { resourceEnum, sortFieldEnum } from "../../utils/enums";
import { createSelector } from "reselect";
import { tagSelector } from "./tags";
import GroupResourceImg from "../../assets/images/business-resource.svg";
import IndividualResourceImg from "../../assets/images/individual-resource.svg";

export const resourceName = (resource) => {
  switch (resource.type) {
    case resourceEnum.INDIVIDUAL:
      return resource.contactName;
    case resourceEnum.GROUP:
      return resource.companyName;
    case resourceEnum.TANGIBLE:
      return resource.resourceName;
    default:
      return "";
  }
};

const resourceLocation = (resource) =>
  resource.distanceFromSearchLoc ?? Number.MAX_VALUE;

const volunteerRole = (resource) => resource.volunteerRoles;

export const resourceDescription = (resource) =>
  resource.type === resourceEnum.INDIVIDUAL
    ? resource.skills
    : resource.description;

export const resourceLogo = (type) => {
  switch (type) {
    case resourceEnum.INDIVIDUAL:
      return IndividualResourceImg;
    case resourceEnum.GROUP:
      return GroupResourceImg;
    default:
      return GroupResourceImg;
  }
};

const strCompare = (a, b) => {
  if (!a) {
    return 1;
  }
  if (!b) {
    return -1;
  }
  if (a === b) {
    return 0;
  }
  return a.localeCompare(b);
};

const numCompare = (a, b) => {
  if (a < b) {
    return -1;
  }
  if (a === b) {
    return 0;
  }
  return 1;
};

const comparatorDict = {
  [sortFieldEnum.RESOURCE_NAME]: {
    getter: resourceName,
    comparator: strCompare,
  },
  [sortFieldEnum.LOCATION]: {
    getter: resourceLocation,
    comparator: numCompare,
  },
  [sortFieldEnum.VOLUNTEER_ROLE]: {
    getter: volunteerRole,
    comparator: strCompare,
  },
  [sortFieldEnum.DESCRIPTION]: {
    getter: resourceDescription,
    comparator: strCompare,
  },
  [sortFieldEnum.AVAILABILITY]: {
    getter: (r) => r.availability ?? "",
    comparator: strCompare,
  },
};

// Memoize sort selector to avoid extra computation
export const resourceSelector = createSelector(
  [
    (state) => state.resources,
    (state) => state.sort.order,
    (state) => state.sort.field,
  ],
  (resources, order, field) => {
    if (!field) {
      return resources;
    }
    const { getter, comparator } = comparatorDict[field];
    const resourceCopy = [...resources];
    const numericalOrder = order === "asc" ? 1 : -1;
    resourceCopy.sort(
      (resource1, resource2) =>
        comparator(getter(resource1), getter(resource2)) * numericalOrder
    );
    return resourceCopy;
  }
);

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
