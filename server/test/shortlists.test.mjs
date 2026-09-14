import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { runtime, schema, insertDocument } from "../scripts/runtime.mjs";
let mf, db;
const sha = (s) => createHash("sha256").update(s).digest("hex");
const accounts = { ADMIN: "a", VOLUNTEER: "b", PENDING: "c", REJECTED: "d" };
const resource = {
  _id: "1".repeat(24),
  type: "GROUP",
  companyName: "Synthetic Support",
  contactName: "Demo Coordinator",
  notes: "Synthetic private notes",
  address: {
    streetAddress: "100 Example Street",
    city: "Chicago",
    state: "IL",
    postalCode: "60601",
  },
  location: { type: "Point", coordinates: [-87.6, 41.8] },
  tags: ["Housing"],
  websiteURL: "javascript:alert(1)",
  customLegacyField: { preserve: true },
};
async function call(
  path,
  {
    role = "ADMIN",
    method = "GET",
    body,
    csrf = true,
    origin,
    cookie,
    headers = {},
  } = {},
) {
  const token = accounts[role]?.repeat(64);
  return mf.dispatchFetch("http://localhost:8787/api" + path, {
    method,
    headers: {
      ...(token ? { Cookie: `lah.sid=${token}` } : {}),
      ...(csrf ? { "X-CSRF-Token": "e".repeat(64) } : {}),
      ...(origin ? { Origin: origin } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    redirect: "manual",
  });
}
before(async () => {
  mf = await runtime();
  db = await mf.getDatabase();
  await schema(db);
  for (const [role, char] of Object.entries(accounts)) {
    const user = {
      _id: char.repeat(24),
      oauthId: "google-" + role,
      email: role.toLowerCase() + "@example.com",
      firstName: "Demo",
      lastName: role,
      role,
      location: "NORTH",
    };
    await insertDocument(db, "users", user);
    await db
      .prepare("INSERT INTO sessions VALUES(?,?,?,?,?)")
      .bind(
        sha(char.repeat(64)),
        user._id,
        "e".repeat(64),
        Date.now(),
        Date.now(),
      )
      .run();
  }
  await insertDocument(db, "resources", resource);
});
after(async () => {
  await mf?.dispose();
});

test("shortlists require active LAH access and CSRF", async () => {
  for (const [role, status] of [
    ["ANON", 401],
    ["PENDING", 403],
    ["REJECTED", 403],
  ]) {
    assert.equal((await call("/shortlists", { role })).status, status);
    assert.equal(
      (await call("/shortlists/" + "a".repeat(24), { role })).status,
      status,
    );
  }
  assert.equal(
    (
      await call("/shortlists", {
        method: "POST",
        csrf: false,
        body: { name: "Test" },
      })
    ).status,
    403,
  );
});
test("shared lists persist, deduplicate resources, enforce ownership and cascade deletions", async () => {
  const created = await call("/shortlists", {
    role: "VOLUNTEER",
    method: "POST",
    body: { name: " Housing options " },
  });
  assert.equal(created.status, 201);
  const list = (await created.json()).result;
  assert.equal(list.name, "Housing options");
  assert.equal(list.owner_id, accounts.VOLUNTEER.repeat(24));
  for (let i = 0; i < 2; i++)
    assert.equal(
      (
        await call(`/shortlists/${list.id}/resources/${resource._id}`, {
          role: "VOLUNTEER",
          method: "PUT",
        })
      ).status,
      200,
    );
  const fetched = (await (await call(`/shortlists/${list.id}`)).json()).result;
  assert.equal(fetched.resources.length, 1);
  assert.equal(fetched.resources[0]._id, resource._id);
  assert.equal((await (await call("/shortlists")).json()).result[0].count, 1);
  const adminList = (
    await (
      await call("/shortlists", {
        method: "POST",
        body: { name: "Admin list" },
      })
    ).json()
  ).result;
  for (const [suffix, method, body] of [
    ["", "PATCH", { name: "Hijack" }],
    ["", "DELETE"],
    [`/resources/${resource._id}`, "PUT"],
    [`/resources/${resource._id}`, "DELETE"],
  ])
    assert.equal(
      (
        await call(`/shortlists/${adminList.id}${suffix}`, {
          role: "VOLUNTEER",
          method,
          body,
        })
      ).status,
      403,
    );
  assert.equal(
    (await call(`/shortlists/${adminList.id}`, { role: "VOLUNTEER" })).status,
    200,
  );
  assert.equal(
    (
      await call(`/shortlists/${list.id}`, {
        method: "PATCH",
        body: { name: "Renamed" },
      })
    ).status,
    200,
  );
  assert.equal(
    (
      await call(`/shortlists/${list.id}/resources/${"f".repeat(24)}`, {
        method: "PUT",
      })
    ).status,
    404,
  );
  assert.equal(
    (
      await call(`/shortlists/${list.id}/resources/${resource._id}`, {
        method: "DELETE",
      })
    ).status,
    200,
  );
  assert.equal(
    (await (await call(`/shortlists/${list.id}`)).json()).result.resources
      .length,
    0,
  );
  await call(`/shortlists/${list.id}/resources/${resource._id}`, {
    method: "PUT",
  });
  await call(`/resources/${resource._id}`, { method: "DELETE" });
  assert.equal(
    (await (await call(`/shortlists/${list.id}`)).json()).result.resources
      .length,
    0,
  );
  assert.equal(
    (
      await call(`/shortlists/${list.id}`, {
        role: "VOLUNTEER",
        method: "DELETE",
      })
    ).status,
    200,
  );
  assert.equal((await call(`/shortlists/${list.id}`)).status, 404);
  assert.ok(
    await db
      .prepare("SELECT * FROM audit_events WHERE action='shortlist.create'")
      .first(),
  );
});
test("shortlist names and ids are validated", async () => {
  for (const body of [
    { name: " " },
    { name: "x".repeat(121) },
    { name: "Test", owner_id: "attacker" },
  ])
    assert.equal(
      (await call("/shortlists", { method: "POST", body })).status,
      400,
    );
  assert.equal((await call("/shortlists/bad-id")).status, 400);
});
