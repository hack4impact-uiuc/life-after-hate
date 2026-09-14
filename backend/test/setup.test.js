const User = require("../models/User");
const { stubOutAuth, unstubAuth } = require("./auth_stubs");

// Universal global hooks which should run before every test
beforeEach(async () => {
  await User.deleteMany({});
  stubOutAuth();
  await require("./request").prepare(require("../app"));
});

afterEach(unstubAuth);
