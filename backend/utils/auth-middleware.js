const Boom = require("@hapi/boom");
const roleEnum = require("../models/User.js").roleEnum;
const authValidators = require("./auth/auth_validators");

const requireVolunteerStatus = (req, res, next) => {
  // Anything that a volunteer is authorized to do, an admin can do as well
  if (
    authValidators.validateRequestForRole(req, roleEnum.VOLUNTEER) ||
    authValidators.validateRequestForRole(req, roleEnum.ADMIN)
  ) {
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

const requirePendingStatus = (req, res, next) => {
  if (
    authValidators.validateRequestForRole(req, roleEnum.PENDING) ||
    authValidators.validateRequestForRole(req, roleEnum.VOLUNTEER) ||
    authValidators.validateRequestForRole(req, roleEnum.ADMIN)
  ) {
    return next();
  }
  res
    .status(401)
    .send(
      Boom.unauthorized("You are not authorized (requires pending status).")
    );
};

// Middleware that'll set a mock user if the bypass authorization environment variable gets set
const setMockUser = (req, _, next) => {
  req.user = {
    firstName: "John",
    lastName: "Doe",
    oauthId: "12345678",
    propicUrl:
      "https://theronmansondds.com/wp-content/uploads/2016/12/google-single-letter-logo.png",
    role: process.env.BYPASS_AUTH_ROLE,
    location: "SOUTH",
    email: "abc@def.xyz"
  };
  req.isAuthenticated = () => true;
  next();
};
module.exports = {
  requirePendingStatus,
  requireVolunteerStatus,
  requireAdminStatus,
  setMockUser
};
