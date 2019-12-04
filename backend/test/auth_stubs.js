const sinon = require("sinon");
const auth = require("../utils/auth-middleware");

// The default method that will run if no fn is specified
// Essentially just bypassing the middleware by calling next()
const defaultStub = (req, res, next) => {
  next();
};

// Take the name of the auth method along with the function
// and stub the result with fn
const stubMiddleware = (name, fn = defaultStub) => {
  if (auth[name].wrappedMethod) {
    // Already wrapped! No op
    return;
  }
  const stub = sinon.stub(auth, name);
  stub.callsFake(fn);
  return stub;
};

const stubIsAdmin = fn => stubMiddleware("isAdmin", fn);

const stubIsAuthenticated = fn => stubMiddleware("isAuthenticated", fn);

const stubIsVolunteer = fn => stubMiddleware("isVolunteer", fn);

// Stub all the auth middleware functions
// Return an object with all the stubbed function references
const stubAllAuth = fn => ({
  isAdminStub: stubIsAdmin(fn),
  isAuthenticatedStub: stubIsAuthenticated(fn),
  isVolunteerStub: stubIsVolunteer(fn)
});

const unstubAllAuth = () => auth.isAdmin.restore();

module.exports = {
  stubIsAdmin,
  stubIsAuthenticated,
  stubIsVolunteer,
  stubAllAuth,
  unstubAllAuth
};
