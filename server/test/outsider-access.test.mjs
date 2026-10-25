import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { runtime, schema, insertDocument } from "../scripts/runtime.mjs";

const adminId = "1".repeat(24);
const resourceId = "2".repeat(24);
const listId = "3".repeat(24);
const csrf = "a".repeat(64);

async function fixture(t) {
  let providerCalls = 0;
  const app = await runtime({
    bindings: { MAPQUEST_KEY: "synthetic" },
    outboundService: async () => {
      providerCalls++;
      throw new Error("An outsider must never reach the provider");
    },
  });
  t.after(() => app.dispose());
  const db = await app.getDatabase();
  await schema(db);
  for (const [role, char] of [
    ["ADMIN", "1"],
    ["PENDING", "4"],
    ["REJECTED", "5"],
  ]) {
    await insertDocument(db, "users", {
      _id: char.repeat(24),
      oauthId: role,
      role,
      email: `${role}@example.com`,
      firstName: "Protected account",
    });
    // Do not create an admin session: knowing its account ID grants no access.
    if (role !== "ADMIN")
      await db
        .prepare("INSERT INTO sessions VALUES(?,?,?,?,?)")
        .bind(
          createHash("sha256").update(char.repeat(64)).digest("hex"),
          char.repeat(24),
          csrf,
          Date.now(),
          Date.now(),
        )
        .run();
  }
  await insertDocument(db, "resources", {
    _id: resourceId,
    type: "GROUP",
    contactName: "Protected contact",
    notes: "Private resource notes",
    tags: ["Private tag"],
  });
  await db
    .prepare("INSERT INTO shortlists VALUES(?,?,?,?)")
    .bind(listId, "Private shortlist", adminId, new Date().toISOString())
    .run();
  await db
    .prepare("INSERT INTO shortlist_items VALUES(?,?,?)")
    .bind(listId, resourceId, new Date().toISOString())
    .run();
  const call = (path, cookie, method = "GET", body) =>
    app.dispatchFetch("http://localhost:8787" + path, {
      method,
      headers: {
        ...(cookie ? { Cookie: cookie } : {}),
        "X-Role": "ADMIN",
        "X-User-Id": adminId,
        "X-CSRF-Token": csrf,
        "Content-Type": "application/json",
        // Unique synthetic clients prevent the general IP limit masking auth failures.
        "x-test-client-ip": `outsider-test-${++sequence}`,
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  let sequence = 0;
  return { db, call, providerCalls: () => providerCalls };
}

const outsiders = [
  undefined,
  "lah.sid=" + "f".repeat(64),
  "lah.sid=" + adminId,
  "lah.sid=" + "4".repeat(64),
  "lah.sid=" + "5".repeat(64),
];

test("outsiders cannot read directory, accounts or shared lists through route variants", async (t) => {
  const { call, providerCalls } = await fixture(t);
  for (const cookie of outsiders)
    for (const path of [
      "/api/resources",
      "/api/resources/tags",
      "/api/resources/filter?address=Synthetic",
      `/api/resources/${resourceId}`,
      "/api/users",
      "/api/users/role/ADMIN",
      `/api/users/${adminId}`,
      "/api/shortlists",
      `/api/shortlists/${listId}`,
      "/api/%72esources",
      "/api/resources%2f",
      "/api//resources",
      "/api/shortlists%2f",
      "/api/%75sers",
    ])
      for (const suffix of ["", "/"])
        for (const method of ["GET", "HEAD"]) {
          const url = new URL(path, "http://localhost:8787");
          url.pathname += suffix;
          const response = await call(
            url.pathname + url.search,
            cookie,
            method,
          );
          assert.ok(
            [400, 401, 403, 404].includes(response.status),
            `${method} ${url.pathname}: ${response.status}`,
          );
          assert.equal(response.headers.get("Cache-Control"), "no-store");
        }
  assert.equal(providerCalls(), 0);
});

test("forged admin headers and unapproved sessions cannot grant access or change data", async (t) => {
  const { db, call, providerCalls } = await fixture(t);
  for (const cookie of outsiders)
    for (const [method, path, body] of [
      [
        "POST",
        "/api/resources",
        {
          type: "GROUP",
          companyName: "Forged",
          contactName: "Forged",
          address: "Synthetic",
        },
      ],
      ["PUT", `/api/resources/${resourceId}`, { address: "Synthetic" }],
      ["DELETE", `/api/resources/${resourceId}`],
      ["POST", "/api/users", { oauthId: "outsider", role: "ADMIN" }],
      ["PATCH", "/api/users/" + "4".repeat(24), { role: "ADMIN" }],
      ["DELETE", `/api/users/${adminId}`],
      ["POST", "/api/shortlists", { name: "Forged" }],
      ["PATCH", `/api/shortlists/${listId}`, { name: "Forged" }],
      ["DELETE", `/api/shortlists/${listId}`],
      ["PUT", `/api/shortlists/${listId}/resources/${resourceId}`],
      ["DELETE", `/api/shortlists/${listId}/resources/${resourceId}`],
    ]) {
      const response = await call(path, cookie, method, body);
      assert.ok(
        [401, 403].includes(response.status),
        `${method} ${path}: ${response.status}`,
      );
    }
  assert.equal(
    (await db.prepare("SELECT count(*) AS n FROM resources").first()).n,
    1,
  );
  assert.equal(
    (await db.prepare("SELECT count(*) AS n FROM users").first()).n,
    3,
  );
  assert.equal(
    (
      await db
        .prepare("SELECT role FROM users WHERE id=?")
        .bind("4".repeat(24))
        .first()
    ).role,
    "PENDING",
  );
  assert.equal(
    (
      await db
        .prepare("SELECT name FROM shortlists WHERE id=?")
        .bind(listId)
        .first()
    ).name,
    "Private shortlist",
  );
  assert.equal(
    (await db.prepare("SELECT count(*) AS n FROM shortlist_items").first()).n,
    1,
  );
  assert.equal(
    (await db.prepare("SELECT count(*) AS n FROM audit_events").first()).n,
    0,
  );
  assert.equal(providerCalls(), 0);
});
