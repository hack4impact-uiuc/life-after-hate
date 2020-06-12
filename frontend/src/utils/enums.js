const roleEnum = {
  ADMIN: "ADMIN",
  VOLUNTEER: "VOLUNTEER",
  PENDING: "PENDING",
  REJECTED: "REJECTED",
};

const resourceEnum = {
  GROUP: "GROUP",
  INDIVIDUAL: "INDIVIDUAL",
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
  DESCRIPTION: "DESCRIPTION",
};

module.exports.roleEnum = roleEnum;
module.exports.resourceEnum = resourceEnum;
module.exports.userFilterEnum = userFilterEnum;
module.exports.modalEnum = modalEnum;
module.exports.sortFieldEnum = sortFieldEnum;
