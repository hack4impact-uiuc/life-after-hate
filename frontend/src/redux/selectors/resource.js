import { resourceEnum, sortFieldEnum } from "../../utils/enums";
import { createSelector } from "reselect";
const resourceName = (resource) =>
  (resource.type === resourceEnum.INDIVIDUAL
    ? resource.contactName
    : resource.companyName) ?? "";

const resourceLocation = (resource) => resource.address ?? "";

const resourcePointOfContact = (resource) => resource.contactEmail ?? "";

const resourceDescription = (resource) =>
  (resource.type === resourceEnum.INDIVIDUAL
    ? resource.skills
    : resource.description) ?? "";

const sortComparatorDict = {
  [sortFieldEnum.RESOURCE_NAME]: resourceName,
  [sortFieldEnum.RESOURCE_LOCATION]: resourceLocation,
  [sortFieldEnum.POINT_OF_CONTACT]: resourcePointOfContact,
  [sortFieldEnum.DESCRIPTION]: resourceDescription,
};

// Memoize sort selector to avoid extra computation
export const resourceSelector = createSelector(
  [
    (state) => state.resources,
    (state) => state.sort.order,
    (state) => state.sort.field,
  ],
  (resources, order, field) => {
    const customComparator = sortComparatorDict[field];
    if (!customComparator) {
      return resources;
    }
    const resourceCopy = [...resources];
    const numericalOrder = order === "asc" ? 1 : -1;
    resourceCopy.sort(
      (resource1, resource2) =>
        customComparator(resource1).localeCompare(customComparator(resource2)) *
        numericalOrder
    );
    return resourceCopy;
  }
);
