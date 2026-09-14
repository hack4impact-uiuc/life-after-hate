const roleEnum = {
  ADMIN: "ADMIN",
  VOLUNTEER: "VOLUNTEER",
  PENDING: "PENDING",
  REJECTED: "REJECTED",
};

const resourceEnum = {
  GROUP: "GROUP",
  INDIVIDUAL: "INDIVIDUAL",
  TANGIBLE: "TANGIBLE",
};

const userFilterEnum = {
  ALL: "ALL",
  ACTIVE: "ACTIVE",
  PENDING: "PENDING",
  REJECTED: "REJECTED",
};

const modalEnum = {
  RESOURCE: "RESOURCE",
  USER: "USER",
};

const sortFieldEnum = {
  RESOURCE_NAME: "RESOURCE NAME",
  LOCATION: "LOCATION",
  VOLUNTEER_ROLE: "VOLUNTEER ROLE",
  AVAILABILITY: "AVAILABILITY",
  DESCRIPTION: "DESCRIPTION",
};

export { roleEnum, resourceEnum, userFilterEnum, modalEnum, sortFieldEnum };
