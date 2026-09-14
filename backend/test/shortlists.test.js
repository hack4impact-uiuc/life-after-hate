const assert = require("node:assert/strict");
const request = require("supertest");
const { createApp } = require("../create-app");
const { loadConfig } = require("../utils/config");
const Shortlist = require("../models/Shortlist");
const Resource = require("../models/Resource");
const Group = require("../models/GroupResource");
describe("MongoDB shortlists", () => {
  it("persists shared lists and resource membership with owner checks", async () => {
    await require("../app").locals.ready;
    await Shortlist.deleteMany({});
    const app = createApp(
      loadConfig({ ...process.env, BYPASS_AUTH_ROLE: "VOLUNTEER" }),
      { logRequests: false },
    );
    const agent = request.agent(app);
    const csrf = (await agent.get("/api/auth/csrf")).body.token;
    const write = (method, path) =>
      agent[method]("/api/shortlists" + path).set("X-CSRF-Token", csrf);
    const created = await write("post", "")
      .send({ name: "Local options" })
      .expect(201);
    const list = created.body.result;
    const resource = await Group.create({
      contactName: "Synthetic contact",
      companyName: "Test service",
      address: { city: "Chicago", state: "IL" },
    });
    for (let i = 0; i < 2; i++)
      await write("put", `/${list.id}/resources/${resource._id}`).expect(200);
    const fetched = await agent.get("/api/shortlists/" + list.id).expect(200);
    assert.equal(fetched.body.result.resources.length, 1);
    assert.equal(fetched.body.result.resources[0].address, "Chicago, IL");
    const lists = await agent.get("/api/shortlists").expect(200);
    assert.equal(lists.body.result[0].count, 1);
    await write("patch", "/" + list.id)
      .send({ name: "Renamed" })
      .expect(200);
    const other = await Shortlist.create({
      name: "Other owner",
      owner_id: "another-user",
    });
    await write("patch", "/" + other._id)
      .send({ name: "Forbidden" })
      .expect(403);
    await write("post", "").send({ name: " " }).expect(400);
    await write("delete", `/${list.id}/resources/${resource._id}`).expect(200);
    await write("put", `/${list.id}/resources/${resource._id}`).expect(200);
    await Resource.deleteOne({ _id: resource._id });
    assert.equal(
      (await agent.get("/api/shortlists/" + list.id)).body.result.resources
        .length,
      0,
    );
    await write("delete", "/" + list.id).expect(200);
    await agent.get("/api/shortlists/" + list.id).expect(404);
  });
});
