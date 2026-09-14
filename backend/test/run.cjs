const { MongoMemoryServer } = require("mongodb-memory-server");
const { spawn } = require("node:child_process");
const path = require("node:path");
const run = (args, env) =>
  new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [require.resolve("mocha/bin/mocha.js"), ...args],
      { stdio: "inherit", env, cwd: path.join(__dirname, "..") },
    );
    child.once("error", reject);
    child.once("exit", (code) => resolve(code ?? 1));
  });
(async () => {
  // Tests never connect to an operator-supplied DB_URI or a production database.
  const mongo = await MongoMemoryServer.create();
  try {
    const env = {
      ...process.env,
      NODE_ENV: "test",
      DB_URI: mongo.getUri("lah_test"),
      SESSION_SECRET: "isolated-test-secret-".repeat(3),
      GOOGLE_CLIENT_ID: "test",
      GOOGLE_CLIENT_SECRET: "test",
      FE_URI: "http://localhost:3000",
      OAUTH_CALLBACK_URI: "http://localhost:5000/api/auth/login/callback",
      BYPASS_AUTH_ROLE: "",
      DEFAULT_ROLE: "",
      TRUST_PROXY: "",
    };
    const security = await run(
      ["--timeout", "10000", "test/security.test.js"],
      env,
    );
    const integration = await run(
      [
        "--timeout",
        "10000",
        "--exit",
        "--file",
        "test/setup.test.js",
        "test/resource.test.js",
        "test/user.test.js",
      ],
      env,
    );
    process.exitCode = security || integration;
  } finally {
    await mongo.stop();
  }
})().catch(() => {
  console.error("Isolated test database could not start");
  process.exitCode = 1;
});
