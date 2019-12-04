// Helper functions to return whether the user is authorized for a given role
// Returns true if authorized, false otherwise; handled by external auth middleware

// This is in an external module so it can be dynamically stubbed out by sinon during testing
const validateRequestForRole = (req, role) => {
  if (!req.isAuthenticated()) {
    return false;
  }
  if (!req.user) {
    return false;
  }
  return req.user.role === role;
};

module.exports = { validateRequestForRole };
