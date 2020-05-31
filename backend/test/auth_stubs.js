const sinon = require("sinon");
const authValidator = require("../utils/auth/auth_validators");
const { roleEnum } = require("../models/User");

// Use sinon to stub the validator to (by default, unless another function is specified)
// return true in all instances
const stubOutAuth = (fn = () => true) => {
  const stub = sinon.stub(authValidator, "validateRequestForRole");
  stub.callsFake(fn);
  return stub;
};

const unstubAuth = () => authValidator.validateRequestForRole.restore();

// Assrets that the validator was called on a specific type of user
const authValidatorCalled = (type) =>
  authValidator.validateRequestForRole.calledWith(sinon.match.any, type);

const didCheckIsVolunteer = () => authValidatorCalled(roleEnum.VOLUNTEER);
const didCheckIsAdmin = () => authValidatorCalled(roleEnum.ADMIN);
const didCheckIsPending = () => authValidatorCalled(roleEnum.PENDING);

module.exports = {
  stubOutAuth,
  unstubAuth,
  didCheckIsAdmin,
  didCheckIsVolunteer,
  didCheckIsPending,
};
