import { resourceEnum, sortFieldEnum } from "../../utils/enums";

const resourceName = (resource) =>
  (resource.type === resourceEnum.INDIVIDUAL
    ? resource.contactName
    : resource.companyName) || "";

const resourceLocation = (resource) => resource.address || "";

const resourcePointOfContact = (resource) => resource.contactEmail || "";

const resourceDescription = (resource) =>
  (resource.type === resourceEnum.INDIVIDUAL
    ? resource.skills
    : resource.description) || "";

export const resourceSelector = (state) => {
  const resources = [...state.resources];
  resources.sort((resource1, resource2) => {
    const order = state.sort.order === "asc" ? 1 : -1;
    switch (state.sort.field) {
      case sortFieldEnum.RESOURCE_NAME:
        return (
          resourceName(resource1).localeCompare(resourceName(resource2)) * order
        );
      case sortFieldEnum.LOCATION:
        return (
          resourceLocation(resource1).localeCompare(
            resourceLocation(resource2)
          ) * order
        );
      case sortFieldEnum.POINT_OF_CONTACT:
        return (
          resourcePointOfContact(resource1).localeCompare(
            resourcePointOfContact(resource2)
          ) * order
        );
      case sortFieldEnum.DESCRIPTION:
        return (
          resourceDescription(resource1).localeCompare(
            resourceDescription(resource2)
          ) * order
        );
      default:
        return 0;
    }
  });
  return resources;
};
