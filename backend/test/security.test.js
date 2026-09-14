const assert = require("node:assert/strict");
const request = require("supertest");
const sinon = require("sinon");
const session = require("express-session");
const { loadConfig } = require("../utils/config");
const { createApp } = require("../create-app");
const createPassport = require("../utils/passport-setup");
const User = require("../models/User");
const Resource = require("../models/Resource");

const environment = {
  NODE_ENV: "test",
  SESSION_SECRET: "test-secret-only-".repeat(4),
  DB_URI: "mongodb://127.0.0.1/test",
  GOOGLE_CLIENT_ID: "test-id",
  GOOGLE_CLIENT_SECRET: "test-secret",
};
const config = loadConfig(environment);
const user = (role) => ({
  _id: "507f1f77bcf86cd799439011",
  firstName: "Test",
  lastName: "User",
  role,
});

function setup(options = {}) {
  const passport = createPassport(config);
  const strategy = passport._strategy("google");
  const exchange = sinon
    .stub(strategy._oauth2, "getOAuthAccessToken")
    .callsFake((_code, _params, cb) =>
      cb(null, "test-access", "test-refresh", {}),
    );
  sinon.stub(strategy, "userProfile").callsFake((_token, cb) =>
    cb(null, {
      id: "google-subject",
      emails: [{ value: "test@example.com", verified: true }],
    }),
  );
  const app = createApp(config, { passport, logRequests: false, ...options });
  return { app, agent: request.agent(app), exchange };
}
async function login(agent, role) {
  sinon.stub(User, "findOne").resolves(user(role));
  sinon.stub(User, "findById").resolves(user(role));
  const start = await agent.get("/api/auth/login").expect(302);
  const state = new URL(start.headers.location).searchParams.get("state");
  assert.ok(state);
  await agent
    .get("/api/auth/login/callback")
    .query({ state, code: "test-code" })
    .expect(302);
  return (await agent.get("/api/auth/csrf").expect(200)).body.token;
}

describe("security boundaries (real Passport sessions and authorization)", () => {
  afterEach(() => sinon.restore());
  it("rejects unsafe production configuration", () => {
    const production = {
      ...environment,
      DB_URI: "mongodb+srv://test:test@db.example/test",
      NODE_ENV: "production",
      FE_URI: "https://app.example",
      OAUTH_CALLBACK_URI: "https://app.example/api/auth/login/callback",
    };
    assert.throws(() => loadConfig({ ...production, SESSION_SECRET: "short" }));
    assert.throws(() =>
      loadConfig({ ...production, BYPASS_AUTH_ROLE: "ADMIN" }),
    );
    assert.throws(() => loadConfig({ ...production, DEFAULT_ROLE: "ADMIN" }));
    assert.throws(() =>
      loadConfig({ ...production, FE_URI: "http://app.example" }),
    );
    assert.throws(() => loadConfig({ ...production, TRUST_PROXY: "true" }));
    assert.throws(() =>
      loadConfig({ ...production, DB_URI: "mongodb://db.example/test" }),
    );
    assert.throws(() =>
      loadConfig({
        ...production,
        DB_URI: "mongodb+srv://test:test@db.example/test?tls=false",
      }),
    );
    assert.throws(() =>
      loadConfig({
        ...production,
        DB_URI:
          "mongodb+srv://test:test@db.example/test?tlsAllowInvalidCertificates=true",
      }),
    );
    assert.throws(() =>
      loadConfig({
        ...production,
        OAUTH_CALLBACK_URI: "https://other.example/api/auth/login/callback",
      }),
    );
    assert.doesNotThrow(() => loadConfig(production));
  });
  it("does not expose the old redirect relay, coverage or role-switch endpoints", async () => {
    const { agent } = setup();
    for (const path of [
      "/api/auth/login/redirectURI?state=attacker",
      "/__coverage__",
      "/api/test/setRole/ADMIN",
    ]) {
      await agent.get(path).expect(404);
    }
  });
  it("rejects an OAuth callback without session-bound state before exchanging codes", async () => {
    const { agent, exchange } = setup();
    await agent
      .get("/api/auth/login/callback?code=attacker&state=forged")
      .expect(302);
    assert.equal(exchange.callCount, 0);
    await agent.get("/api/users/current").expect(401);
  });
  it("does not accept another browser's OAuth state", async () => {
    const { app, agent, exchange } = setup();
    const start = await agent.get("/api/auth/login").expect(302);
    const state = new URL(start.headers.location).searchParams.get("state");
    await request
      .agent(app)
      .get("/api/auth/login/callback")
      .query({ code: "test", state })
      .expect(302);
    assert.equal(exchange.callCount, 0);
  });
  it("consumes OAuth state and refuses replay", async () => {
    const { agent, exchange } = setup();
    sinon.stub(User, "findOne").resolves(user("PENDING"));
    sinon.stub(User, "findById").resolves(user("PENDING"));
    const start = await agent.get("/api/auth/login").expect(302);
    const state = new URL(start.headers.location).searchParams.get("state");
    await agent
      .get("/api/auth/login/callback")
      .query({ code: "test", state })
      .expect(302);
    await agent
      .get("/api/auth/login/callback")
      .query({ code: "test", state })
      .expect(302);
    assert.equal(exchange.callCount, 1);
  });
  for (const role of [null, "PENDING", "REJECTED", "VOLUNTEER", "ADMIN"]) {
    it(`enforces API permissions for ${role || "anonymous"} users`, async () => {
      const { agent } = setup();
      const token = role
        ? await login(agent, role)
        : (await agent.get("/api/auth/csrf")).body.token;
      const resources = sinon
        .stub(Resource, "find")
        .returns({ lean: async () => [] });
      const admins = ["ADMIN"].includes(role);
      const readers = ["ADMIN", "VOLUNTEER"].includes(role);
      await agent.get("/api/resources").expect(readers ? 200 : 401);
      await agent
        .post("/api/resources")
        .set("X-CSRF-Token", token)
        .send({})
        .expect(admins ? 400 : 401);
      await agent
        .patch("/api/users/507f1f77bcf86cd799439011")
        .set("X-CSRF-Token", token)
        .send({ role: "INVALID" })
        .expect(admins ? 400 : 401);
      assert.equal(resources.callCount, readers ? 1 : 0);
    });
  }
  it("requires a session-specific CSRF token and rejects cross-origin mutations", async () => {
    const { app, agent } = setup();
    const token = await login(agent, "ADMIN");
    await agent.post("/api/resources").send({}).expect(403);
    await agent
      .post("/api/resources")
      .set("X-CSRF-Token", "a".repeat(64))
      .send({})
      .expect(403);
    await request
      .agent(app)
      .post("/api/resources")
      .set("X-CSRF-Token", token)
      .send({})
      .expect(403);
    await agent
      .post("/api/resources")
      .set("X-CSRF-Token", token)
      .set("Origin", "https://attacker.example")
      .send({})
      .expect(403);
    await agent
      .post("/api/resources")
      .set("X-CSRF-Token", token)
      .set("Origin", config.frontendOrigin)
      .send({})
      .expect(400);
  });
  it("invalidates the session and CSRF token at logout", async () => {
    const { agent } = setup();
    const token = await login(agent, "ADMIN");
    await agent.get("/api/auth/logout").expect(404);
    await agent.post("/api/auth/logout").set("X-CSRF-Token", token).expect(200);
    await agent.get("/api/users/current").expect(401);
    await agent.post("/api/auth/logout").set("X-CSRF-Token", token).expect(403);
  });
  it("refreshes roles from the database on every request", async () => {
    const { agent } = setup();
    await login(agent, "ADMIN");
    User.findById.resolves(user("REJECTED"));
    await agent.get("/api/resources").expect(401);
    User.findById.resolves(null);
    await agent.get("/api/users/current").expect(401);
  });
  it("expires authenticated sessions after the absolute lifetime", async () => {
    const store = new session.MemoryStore();
    const { agent } = setup({ store });
    await login(agent, "ADMIN");
    const sessions = await new Promise((resolve, reject) =>
      store.all((err, data) => (err ? reject(err) : resolve(data))),
    );
    for (const [id, data] of Object.entries(sessions)) {
      data.createdAt = Date.now() - 9 * 60 * 60000;
      await new Promise((resolve) => store.set(id, data, resolve));
    }
    await agent.get("/api/users/current").expect(401);
    await agent.get("/api/users/current").expect(401);
  });
  it("sets private cache headers and production cookie attributes", async () => {
    const prod = {
      ...config,
      isProd: true,
      cookieName: "__Host-lah.sid",
      trustProxy: "loopback",
    };
    const app = createApp(prod, {
      store: new session.MemoryStore(),
      logRequests: false,
    });
    const response = await request(app)
      .get("/api/auth/csrf")
      .set("X-Forwarded-Proto", "https")
      .expect(200);
    assert.equal(response.headers["cache-control"], "no-store");
    assert.equal(response.headers["referrer-policy"], "no-referrer");
    assert.match(
      response.headers["set-cookie"][0],
      /__Host-lah.sid=.*HttpOnly; Secure; SameSite=Lax/,
    );
    assert.ok(!response.headers["x-powered-by"]);
  });
  it("rejects oversized request bodies", async () => {
    const { agent } = setup();
    await agent
      .post("/api/resources")
      .send({ notes: "x".repeat(70000) })
      .expect(413);
  });
  it("rate limits repeated requests", async () => {
    const { agent } = setup();
    for (let i = 0; i < 30; i++) await agent.get("/api/auth/login").expect(302);
    await agent.get("/api/auth/login").expect(429);
  });
});
