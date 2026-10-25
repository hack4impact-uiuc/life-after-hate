const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const request = require("supertest");
const sinon = require("sinon");
const axios = require("axios");
const { createApp } = require("../create-app");
const { loadConfig } = require("../utils/config");
const createPassport = require("../utils/passport-setup");
const User = require("../models/User");
const Resource = require("../models/Resource");

describe("MongoDB account geocoding quota", () => {
  let provider, now;
  const servers = [];
  const config = loadConfig({ ...process.env, TRUST_PROXY: "loopback" });

  before(async () => {
    await mongoose.connect(config.dbUri);
  });
  after(async () => mongoose.disconnect());
  beforeEach(async () => {
    await Promise.all([
      User.deleteMany({}),
      Resource.deleteMany({}),
      mongoose.connection.collection("geocodingquotas").deleteMany({}),
    ]);
    now = Date.now();
    sinon.stub(Date, "now").callsFake(() => now);
    provider = sinon.stub(axios, "get").resolves({
      data: {
        results: [
          { locations: [{ latLng: { lat: 41, lng: -87 }, adminArea3: "IL" }] },
        ],
      },
    });
  });
  afterEach(async () => {
    await Promise.all(
      servers
        .splice(0)
        .map((server) => new Promise((resolve) => server.close(resolve))),
    );
    sinon.restore();
  });

  async function account(role = "VOLUNTEER") {
    const oauthId = new mongoose.Types.ObjectId().toString();
    return User.create({
      oauthId,
      email: `${oauthId}@example.com`,
      firstName: "Quota test",
      role,
      location: "NORTH",
    });
  }
  async function browser(user, ip = "192.0.2.1") {
    // Each browser gets a separate app/session store, but the same MongoDB.
    const passport = createPassport(config);
    const strategy = passport._strategy("google");
    sinon
      .stub(strategy._oauth2, "getOAuthAccessToken")
      .callsFake((_code, _params, done) =>
        done(null, "synthetic-access", null, {}),
      );
    sinon
      .stub(strategy, "userProfile")
      .callsFake((_token, done) => done(null, { id: user.oauthId }));
    const app = createApp(config, { passport, logRequests: false });
    const server = app.listen(0, "127.0.0.1");
    servers.push(server);
    await new Promise((resolve) => server.once("listening", resolve));
    const agent = request.agent(server);
    const start = await agent.get("/api/auth/login").expect(302);
    const state = new URL(start.headers.location).searchParams.get("state");
    await agent
      .get("/api/auth/login/callback")
      .query({ state, code: "test" })
      .expect(302);
    const csrf = (await agent.get("/api/auth/csrf").expect(200)).body.token;
    return {
      search: (address = "Synthetic address") => {
        const req = agent
          .get("/api/resources/filter")
          .set("X-Forwarded-For", ip);
        return address ? req.query({ address }) : req;
      },
      write: (method, path, body) =>
        agent[method]("/api/resources" + path)
          .set("X-Forwarded-For", ip)
          .set("X-CSRF-Token", csrf)
          .send(body),
    };
  }

  it("allows only 20 concurrent calls across sessions, IPs and server instances", async () => {
    const user = await account();
    const clients = [await browser(user), await browser(user, "192.0.2.2")];
    const responses = await Promise.all(
      Array.from({ length: 24 }, (_, i) => clients[i % 2].search()),
    );
    assert.equal(responses.filter((r) => r.status === 200).length, 20);
    assert.equal(responses.filter((r) => r.status === 429).length, 4);
    assert.equal(provider.callCount, 20);
    await clients[0].search(null).expect(200);
    assert.equal(provider.callCount, 20);
    const other = await browser(await account());
    await other.search().expect(200);
    assert.equal(provider.callCount, 21);
    now += 60000;
    await clients[0].search().expect(200);
    assert.equal(provider.callCount, 22);
  });

  it("shares the budget between search, create and address edits", async () => {
    const client = await browser(await account("ADMIN"));
    for (let i = 0; i < 18; i++) await client.search().expect(200);
    const data = {
      type: "GROUP",
      companyName: "Test group",
      contactName: "Test contact",
      address: "Synthetic address",
    };
    const created = await client.write("post", "", data).expect(201);
    const path = "/" + created.body.id;
    await client.write("put", path, { address: "Another address" }).expect(200);
    await client.search().expect(429);
    await client.write("post", "", data).expect(429);
    await client.write("put", path, { address: "Another address" }).expect(429);
    await client
      .write("put", path, { notes: "No geocoding needed" })
      .expect(200);
    assert.equal(provider.callCount, 20);
    assert.equal(await Resource.countDocuments(), 1);
  });

  it("counts failed provider attempts toward the budget", async () => {
    const client = await browser(await account());
    provider.rejects(new Error("Synthetic provider failure"));
    for (let i = 0; i < 20; i++) await client.search().expect(502);
    await client.search().expect(429);
    assert.equal(provider.callCount, 20);
  });

  it("does not charge invalid or unauthorized requests", async () => {
    const user = await account();
    const client = await browser(user);
    await client.search("x".repeat(501)).expect(400);
    await client.write("post", "", {}).expect(401);
    await User.updateOne({ _id: user._id }, { $set: { role: "REJECTED" } });
    await client.search().expect(401);
    assert.equal(provider.callCount, 0);
    assert.equal(
      await mongoose.connection.collection("geocodingquotas").countDocuments(),
      0,
    );
  });

  it("does not contact the provider when quota storage fails", async () => {
    const client = await browser(await account());
    sinon
      .stub(
        mongoose.connection.collection("geocodingquotas"),
        "findOneAndUpdate",
      )
      .rejects(new Error("Synthetic quota storage failure"));
    await client.search().expect(500);
    assert.equal(provider.callCount, 0);
  });
});
