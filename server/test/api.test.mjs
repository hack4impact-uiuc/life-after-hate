import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {runtime,schema,insertDocument} from "../scripts/runtime.mjs";
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
test('default radius-only search returns the directory without an address', async()=>{
 const response=await call('/resources/filter?radius=500',{headers:{'x-test-client-ip':'192.0.2.80'}});
 assert.equal(response.status,200);
 assert.ok(Array.isArray((await response.json()).result.resources));
});

test("anonymous cannot read resources or users", async () => {
  for (const path of ["/resources", "/resources/", "/users", "/users/current"])
    assert.equal((await call(path, { role: "ANON" })).status, 401);
});
test("pending and rejected cannot read resources", async () => {
  for (const role of ["PENDING", "REJECTED"])
    assert.equal((await call("/resources", { role })).status, 403);
});
test("pending current user is safe and rejected current user denied", async () => {
  const r = await call("/users/current", { role: "PENDING" });
  assert.equal(r.status, 200);
  assert.equal((await r.json()).result.oauthId, undefined);
  assert.equal(
    (await call("/users/current", { role: "REJECTED" })).status,
    403,
  );
});
test("volunteer reads resources, formatted address, safe URL, original id", async () => {
  const r = await call("/resources", { role: "VOLUNTEER" });
  assert.equal(r.status, 200);
  const { result } = await r.json();
  assert.equal(result[0]._id, resource._id);
  assert.equal(result[0].websiteURL, "");
  assert.equal(result[0].address, "100 Example Street, Chicago, IL 60601");
});
test("volunteer cannot list users or mutate resources including root paths", async () => {
  assert.equal((await call("/users", { role: "VOLUNTEER" })).status, 403);
  assert.equal(
    (await call("/resources", { role: "VOLUNTEER", method: "POST", body: {} }))
      .status,
    403,
  );
});
test("CSRF token is bound to session", async () => {
  assert.equal(
    (
      await call("/resources/" + resource._id, {
        method: "PUT",
        body: { notes: "Changed" },
        csrf: false,
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await call("/resources/" + resource._id, {
        method: "PUT",
        body: { notes: "Changed" },
        headers: { "X-CSRF-Token": "f".repeat(64) },
      })
    ).status,
    403,
  );
});
test("foreign Origin is rejected even with valid CSRF", async () => {
  assert.equal(
    (
      await call("/resources/" + resource._id, {
        method: "PUT",
        body: { notes: "Changed" },
        origin: "https://evil.example",
      })
    ).status,
    403,
  );
});
test("unknown fields, invalid URLs, type changes, and malformed IDs are rejected", async () => {
  for (const body of [
    { oauthId: "attacker" },
    { websiteURL: "javascript:alert(1)" },
    { type: "INDIVIDUAL" },
  ])
    assert.equal(
      (await call("/resources/" + resource._id, { method: "PUT", body }))
        .status,
      400,
    );
  assert.equal((await call("/resources/not-an-id")).status, 400);
});
test("body byte limit enforced", async () => {
  assert.equal(
    (
      await call("/resources/" + resource._id, {
        method: "PUT",
        body: { notes: "x".repeat(70000) },
      })
    ).status,
    413,
  );
});
test("partial resource update preserves coordinates and legacy fields with audit", async () => {
  assert.equal(
    (
      await call("/resources/" + resource._id, {
        method: "PUT",
        body: { notes: "Updated synthetic note" },
      })
    ).status,
    200,
  );
  const row = await db
      .prepare("SELECT document FROM resources WHERE id=?")
      .bind(resource._id)
      .first(),
    doc = JSON.parse(row.document);
  assert.deepEqual(doc.location, resource.location);
  assert.deepEqual(doc.customLegacyField, { preserve: true });
  const event = await db
    .prepare("SELECT * FROM audit_events WHERE action=?")
    .bind("resource.update")
    .first();
  assert.equal(event.target_id, resource._id);
  assert(!JSON.stringify(event).includes("Updated synthetic note"));
});
test("search and tags keep response contract", async () => {
  const r = await call("/resources/filter?keyword=Synthetic&tag=Housing");
  assert.equal(r.status, 200);
  assert.equal((await r.json()).result.resources.length, 1);
  assert.deepEqual((await (await call("/resources/tags")).json()).result, [
    "Housing",
  ]);
});
test("missing geocoder fails closed, no invented coordinates", async () => {
  assert.equal(
    (
      await call("/resources", {
        method: "POST",
        body: {
          type: "GROUP",
          companyName: "Demo",
          contactName: "Demo",
          address: "Chicago",
        },
      })
    ).status,
    503,
  );
});
test("response security headers and removed relay", async () => {
  const r = await call("/resources");
  assert.equal(r.headers.get("cache-control"), "no-store");
  assert.equal(r.headers.get("referrer-policy"), "no-referrer");
  assert.equal(r.headers.get("x-frame-options"), "DENY");
  assert.equal(
    (await call("/auth/redirectURI?callbackUrl=https://evil.example")).status,
    404,
  );
});
test("OAuth missing state is rejected before token exchange", async () => {
  assert.equal((await call("/auth/login/callback?code=bad")).status, 400);
});
test("OAuth state is bound to cookie, expiring, single use", async () => {
  const state = "9".repeat(64);
  await db
    .prepare("INSERT INTO oauth_states VALUES(?,?,?,?)")
    .bind(sha(state), "verifier", "nonce", Date.now() + 60000)
    .run();
  assert.equal(
    (
      await call("/auth/login/callback?code=bad&state=" + state, {
        cookie: "lah.oauth=" + "8".repeat(64),
      })
    ).status,
    400,
  );
  assert(
    await db
      .prepare("SELECT * FROM oauth_states WHERE token_hash=?")
      .bind(sha(state))
      .first(),
  );
  assert.equal(
    (
      await call("/auth/login/callback?code=bad&state=" + state, {
        cookie: "lah.oauth=" + state,
      })
    ).status,
    400,
  );
  assert.equal(
    await db
      .prepare("SELECT * FROM oauth_states WHERE token_hash=?")
      .bind(sha(state))
      .first(),
    null,
  );
});
test("role revocation invalidates existing sessions immediately", async () => {
  assert.equal(
    (
      await call("/users/" + accounts.VOLUNTEER.repeat(24), {
        method: "PATCH",
        body: { role: "REJECTED" },
      })
    ).status,
    200,
  );
  assert.equal((await call("/resources", { role: "VOLUNTEER" })).status, 401);
});
test("idle and absolute expiry are server enforced", async () => {
  const token = "6".repeat(64),
    now = Date.now(),
    uid = accounts.ADMIN.repeat(24);
  await db
    .prepare("INSERT INTO sessions VALUES(?,?,?,?,?)")
    .bind(sha(token), uid, "e".repeat(64), now - 9 * 3600000, now)
    .run();
  assert.equal(
    (await call("/resources", { cookie: "lah.sid=" + token })).status,
    401,
  );
  await db
    .prepare("INSERT INTO sessions VALUES(?,?,?,?,?)")
    .bind(sha(token), uid, "e".repeat(64), now - 3600000, now - 31 * 60000)
    .run();
  assert.equal(
    (await call("/resources", { cookie: "lah.sid=" + token })).status,
    401,
  );
});
test("user creation conflicts and deletion cascade", async () => {
  const input = {
    firstName: "Test",
    lastName: "Only",
    email: "new@example.com",
    oauthId: "google-new",
    location: "NORTH",
  };
  assert.equal(
    (await call("/users", { method: "POST", body: input })).status,
    200,
  );
  assert.equal(
    (await call("/users", { method: "POST", body: input })).status,
    409,
  );
  const row = await db
    .prepare("SELECT id FROM users WHERE email=?")
    .bind(input.email)
    .first();
  await db
    .prepare("INSERT INTO sessions VALUES(?,?,?,?,?)")
    .bind("hash", row.id, "csrf", Date.now(), Date.now())
    .run();
  assert.equal(
    (await call("/users/" + row.id, { method: "DELETE" })).status,
    200,
  );
  assert.equal(
    await db
      .prepare("SELECT * FROM sessions WHERE user_id=?")
      .bind(row.id)
      .first(),
    null,
  );
});
test("logout removes server session", async () => {
  assert.equal((await call("/auth/logout", { method: "POST" })).status, 200);
  assert.equal((await call("/resources")).status, 401);
});
test("API rate limit fails closed", async () => {
  let status;
  for (let i = 0; i < 130; i++) {
    status = (
      await call("/resources", {
        role: "ANON",
        headers: { "x-test-client-ip": "192.0.2.123" },
      })
    ).status;
    if (status === 429) break;
  }
  assert.equal(status, 429);
});

