import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { runtime, schema, insertDocument } from "../scripts/runtime.mjs";
const sha = (value) => createHash("sha256").update(value).digest("hex");
async function fixture(t) {
  let providerCalls = 0;
  const runtimeInstance = await runtime({
    bindings: { MAPQUEST_KEY: "synthetic" },
    outboundService: async () => {
      providerCalls++;
      return Response.json({
        results: [{ locations: [{ latLng: { lat: 41, lng: -87 } }] }],
      });
    },
  });
  t.after(() => runtimeInstance.dispose());
  const db = await runtimeInstance.getDatabase();
  await schema(db);
  for (const [i, role] of [
    "ADMIN",
    "VOLUNTEER",
    "PENDING",
    "REJECTED",
  ].entries()) {
    const char = String(i + 1),
      id = char.repeat(24);
    await insertDocument(db, "users", {
      _id: id,
      oauthId: char,
      email: `${char}@example.com`,
      role,
      firstName: "Synthetic",
    });
    await db
      .prepare("INSERT INTO sessions VALUES(?,?,?,?,?)")
      .bind(sha(char.repeat(64)), id, "a".repeat(64), Date.now(), Date.now())
      .run();
  }
  const call = (path, role = 1, options = {}) =>
    runtimeInstance.dispatchFetch("http://localhost:8787" + path, {
      ...options,
      headers: {
        cookie: `lah.sid=${String(role).repeat(64)}`,
        "X-CSRF-Token": "a".repeat(64),
        ...options.headers,
      },
    });
  return { db, call, providerCalls: () => providerCalls };
}
test("authorization survives path variants, methods and forged role headers", async (t) => {
  const { call } = await fixture(t);
  for (const path of [
    "/api/users",
    "/api/users/",
    "/api/users/role/ADMIN",
    "/api/users/" + "1".repeat(24),
  ]) {
    for (const method of ["GET", "HEAD", "POST", "PATCH", "DELETE"]) {
      const response = await call(path, 2, {
        method,
        headers: { "X-Role": "ADMIN", "X-User-Id": "1".repeat(24) },
      });
      assert.equal(response.status, 403, `${method} ${path}`);
    }
  }
  for (const path of [
    "/api/resources",
    "/api/resources/",
    "/api/resources/tags",
    "/api/resources/filter?radius=500",
  ]) {
    for (const role of [3, 4])
      assert.equal((await call(path, role)).status, 403);
  }
  for (const path of ["/api/%75sers", "/api/users%2f", "/api//users"]) {
    const response = await call(path, 2);
    assert.ok([400, 403, 404].includes(response.status), path);
  }
});
test("geocoding quota is shared across sessions/IPs for one account, and stops provider calls", async (t) => {
  const { call, db, providerCalls } = await fixture(t);
  await db
    .prepare("INSERT INTO sessions VALUES(?,?,?,?,?)")
    .bind(
      sha("5".repeat(64)),
      "2".repeat(24),
      "a".repeat(64),
      Date.now(),
      Date.now(),
    )
    .run();
  // Prefill this minute's counter to avoid a slow or minute-boundary-dependent test.
  const window = Math.floor(Date.now() / 60000);
  await db
    .prepare("INSERT INTO rate_limits VALUES(?,?,?)")
    .bind(sha(`geocode:${"2".repeat(24)}:${window}`), 20, (window + 2) * 60000)
    .run();
  for (const role of [2, 5]) {
    assert.equal(
      (
        await call("/api/resources/filter?address=Chicago", role, {
          headers: { "x-test-client-ip": `192.0.2.${role}` },
        })
      ).status,
      429,
    );
  }
  assert.equal(providerCalls(), 0);
  assert.equal((await call("/api/resources/filter?radius=500", 2)).status, 200);
  assert.equal(
    (await call("/api/resources/filter?address=Chicago", 1)).status,
    200,
  );
  assert.equal(providerCalls(), 1);
});
test("malformed JSON and mass assignment leave persisted authorization unchanged", async (t) => {
  const { call, db } = await fixture(t);
  for (const body of [
    "{",
    JSON.stringify({ role: "ADMIN", oauthId: "attacker" }),
    JSON.stringify({ role: "ADMIN", __proto__: { admin: true }, id: "other" }),
  ]) {
    const response = await call("/api/users/" + "2".repeat(24), 1, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body,
    });
    assert.equal(response.status, 400);
  }
  assert.equal(
    (
      await db
        .prepare("SELECT role FROM users WHERE id=?")
        .bind("2".repeat(24))
        .first()
    ).role,
    "VOLUNTEER",
  );
});
