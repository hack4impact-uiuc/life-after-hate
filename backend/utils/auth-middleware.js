const Boom = require("@hapi/boom");
const roleEnum = require("../models/User.js").roleEnum;
const authValidators = require("./auth/auth_validators");

const requireVolunteerStatus = (req, res, next) => {
  if (authValidators.validateRequestForRole(req, roleEnum.VOLUNTEER)) {
    return next();
  }
  res
    .status(401)
    .send(
      Boom.unauthorized("You are not authorized (requires volunteer status).")
    );
};

const requireAdminStatus = (req, res, next) => {
  if (authValidators.validateRequestForRole(req, roleEnum.ADMIN)) {
    return next();
  }
  res
    .status(401)
    .send(Boom.unauthorized("You are not authorized (requires admin status)."));
};

module.exports = { requireVolunteerStatus, requireAdminStatus };
