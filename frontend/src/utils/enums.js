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

module.exports.roleEnum = roleEnum;
module.exports.resourceEnum = resourceEnum;
module.exports.userFilterEnum = userFilterEnum;
module.exports.modalEnum = modalEnum;
