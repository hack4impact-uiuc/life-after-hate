const User = require("../models/User");
const { stubOutAuth, unstubAuth } = require("./auth_stubs");

// Universal global hooks which should run before every test
beforeEach(async () => {
  await User.remove({});
  stubOutAuth();
});

afterEach(() => {
  unstubAuth();
});
