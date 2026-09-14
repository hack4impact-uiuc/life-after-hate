import { beforeEach, afterEach, it, expect, vi } from "vitest";
import { readFile } from "node:fs/promises";
import { createClient } from "@libsql/client";
import { database } from "../../turso/database.mjs";
import app from "../src/index";
import { hash } from "../src/security";

// Exercise the source application against a fresh, local database per test.
let client: ReturnType<typeof createClient>, db: any, env: any;
const uid = "a".repeat(24),
  rid = "b".repeat(24),
  token = "c".repeat(64),
  csrf = "d".repeat(64);
const original = {
  _id: rid,
  type: "GROUP",
  companyName: "Example",
  contactName: "Helper",
  tags: ["Food"],
  location: { coordinates: [0, 0] },
  address: "Old",
  websiteURL: "example.com",
};
beforeEach(async () => {
  client = createClient({ url: ":memory:" });
  db = database(client);
  await client.execute("PRAGMA foreign_keys=ON");
  const sql = await readFile(
    new URL("../migrations/0001_initial.sql", import.meta.url),
    "utf8",
  );
  await client.executeMultiple(sql);
  await client.executeMultiple(
    await readFile(
      new URL("../migrations/0002_shortlists.sql", import.meta.url),
      "utf8",
    ),
  );
  const user = {
    _id: uid,
    oauthId: "google-test",
    email: "test@example.com",
    firstName: "Test",
    lastName: "Admin",
    role: "ADMIN",
  };
  await db
    .prepare("INSERT INTO users VALUES(?,?,?,?,?)")
    .bind(uid, user.oauthId, user.email, user.role, JSON.stringify(user))
    .run();
  await db
    .prepare("INSERT INTO sessions VALUES(?,?,?,?,?)")
    .bind(await hash(token), uid, csrf, Date.now(), Date.now())
    .run();
  await db
    .prepare("INSERT INTO resources VALUES(?,?)")
    .bind(rid, JSON.stringify(original))
    .run();
  env = { DB: db, APP_ORIGIN: "https://example.com", MAPQUEST_KEY: "test" };
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      Response.json({
        results: [
          {
            locations: [
              { latLng: { lat: 0, lng: 0 }, street: "New", adminArea3: "IL" },
            ],
          },
        ],
      }),
    ),
  );
});
afterEach(() => {
  client?.close();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
function request(path: string, method = "GET", body?: unknown, headers = {}) {
  return app.fetch(
    new Request(`https://example.com${path}`, {
      method,
      headers: {
        Cookie: `__Host-lah.sid=${token}`,
        "X-CSRF-Token": csrf,
        "Content-Type": "application/json",
        ...headers,
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    }),
    env,
  );
}
it("sets HTTPS headers and serves health response", async () => {
  const response = await request("/");
  expect(await response.text()).toBe("LAH API");
  expect(response.headers.get("strict-transport-security")).toContain(
    "max-age=",
  );
  expect(response.headers.get("cache-control")).toBe("no-store");
});
it("rejects unexpected request origins and misconfigured application origins", async () => {
  expect(
    (await app.fetch(new Request("https://other.example/"), env)).status,
  ).toBe(400);
  const response = await app.fetch(new Request("https://example.com/"), {
    ...env,
    APP_ORIGIN: "bad",
  });
  expect(response.status).toBe(500);
  expect((await response.json()).message).toBe("Request failed");
});
it.each([
  "/api/users",
  `/api/users/${uid}`,
  "/api/users/role/admin",
  "/api/users/current",
  "/api/resources",
  `/api/resources/${rid}`,
  "/api/resources/tags",
])("reads %s with safe presentation", async (path) => {
  const response = await request(path);
  expect(response.status).toBe(200);
  const text = await response.text();
  expect(text).not.toContain("google-test");
  if (path.includes("resources") && !path.endsWith("tags"))
    expect(text).toContain("https://example.com/");
});
it.each(["/api/resources/bad", "/api/users/bad", "/api/users/role/unknown"])(
  "rejects invalid path parameters %s",
  async (path) => expect((await request(path)).status).toBe(400),
);
it.each([
  `/api/resources/${"e".repeat(24)}`,
  `/api/users/${"e".repeat(24)}`,
  "/api/missing",
])("returns 404 for %s", async (path) =>
  expect((await request(path)).status).toBe(404),
);
it("returns the session CSRF token", async () =>
  expect(await (await request("/api/auth/csrf")).json()).toEqual({
    token: csrf,
  }));
it("geocodes address searches and returns only matching resources", async () => {
  const response = await request(
    "/api/resources/filter?address=Origin&radius=1&keyword=Example&tag=Food",
  );
  expect(response.status).toBe(200);
  const { result } = await response.json();
  expect(result.center).toEqual([0, 0]);
  expect(result.resources.map((r: any) => r._id)).toEqual([rid]);
});
it.each(["GROUP", "INDIVIDUAL", "TANGIBLE"])(
  "creates and audits a %s resource",
  async (type) => {
    const response = await request("/api/resources", "POST", {
      type,
      contactName: "Helper",
      address: "Origin",
      companyName: "Org",
      resourceName: "Supplies",
      tags: ["food support"],
      websiteURL: "example.com",
    });
    expect(response.status).toBe(201);
    const { id } = await response.json();
    const saved = JSON.parse(
      (
        await db
          .prepare("SELECT document FROM resources WHERE id=?")
          .bind(id)
          .first()
      ).document,
    );
    expect(saved).toMatchObject({
      type,
      tags: ["Food Support"],
      websiteURL: "https://example.com/",
      lastModifiedUser: "Test Admin",
      location: { coordinates: [0, 0] },
    });
    expect(
      await db
        .prepare("SELECT * FROM audit_events WHERE target_id=?")
        .bind(id)
        .first(),
    ).toMatchObject({ action: "resource.create", actor_id: uid });
  },
);
it.each([
  { notes: "x" },
  { type: "GROUP", contactName: "A", address: "B" },
  { type: "TANGIBLE", contactName: "A", address: "B" },
  { type: "INDIVIDUAL", address: "B" },
  { type: "INDIVIDUAL", contactName: "A" },
])("rejects incomplete resource creation %#", async (data) => {
  expect((await request("/api/resources", "POST", data)).status).toBe(400);
  expect(globalThis.fetch).not.toHaveBeenCalled();
});
it("updates address, preserves unrelated data, and deletes with an audit trail", async () => {
  expect(
    (
      await request(`/api/resources/${rid}`, "PUT", {
        address: "New",
        notes: "Updated",
      })
    ).status,
  ).toBe(200);
  expect(
    (await (await request(`/api/resources/${rid}`)).json()).result,
  ).toMatchObject({
    companyName: "Example",
    address: "New, IL",
    notes: "Updated",
  });
  expect((await request(`/api/resources/${rid}`, "DELETE")).status).toBe(200);
  expect((await request(`/api/resources/${rid}`)).status).toBe(404);
  const events = (
    await db
      .prepare("SELECT action FROM audit_events WHERE target_id=?")
      .bind(rid)
      .all()
  ).results;
  expect(events.map((e: any) => e.action).sort()).toEqual([
    "resource.delete",
    "resource.update",
  ]);
});
it("rejects type changes and unknown fields without altering persisted data", async () => {
  for (const body of [{ type: "INDIVIDUAL" }, { _id: "injected" }, {}])
    expect((await request(`/api/resources/${rid}`, "PUT", body)).status).toBe(
      400,
    );
  expect(
    JSON.parse(
      (
        await db
          .prepare("SELECT document FROM resources WHERE id=?")
          .bind(rid)
          .first()
      ).document,
    ),
  ).toEqual(original);
});
it.each([
  ["text/plain", "{}", 415],
  ["application/json", "{", 400],
  ["application/json", undefined, 400],
  ["application/json", JSON.stringify({ notes: "x".repeat(65536) }), 413],
])("rejects invalid request bodies %#", async (contentType, body, status) => {
  const response = await app.fetch(
    new Request(`https://example.com/api/resources/${rid}`, {
      method: "PUT",
      headers: {
        Cookie: `__Host-lah.sid=${token}`,
        "X-CSRF-Token": csrf,
        "Content-Type": contentType as string,
      },
      body: body as string | undefined,
    }),
    env,
  );
  expect(response.status).toBe(status);
});
it("creates users with safe defaults, rejects duplicates, updates roles and deletes", async () => {
  const body = {
    firstName: "New",
    email: "new@example.com",
    oauthId: "new-subject",
    location: "NORTH",
  };
  expect((await request("/api/users", "POST", body)).status).toBe(200);
  expect((await request("/api/users", "POST", body)).status).toBe(409);
  const { id } = await db
    .prepare("SELECT id FROM users WHERE email=?")
    .bind(body.email)
    .first();
  expect(
    (await (await request(`/api/users/${id}`)).json()).result,
  ).toMatchObject({ role: "PENDING", lastName: "", title: "" });
  expect(
    (await request(`/api/users/${id}`, "PATCH", { role: "VOLUNTEER" })).status,
  ).toBe(200);
  expect((await request(`/api/users/${id}`, "DELETE")).status).toBe(200);
  expect((await request(`/api/users/${id}`)).status).toBe(404);
});
it("logout revokes sessions", async () => {
  expect((await request("/api/auth/logout", "POST")).status).toBe(200);
  expect((await request("/api/users/current")).status).toBe(401);
});
it("cleanup removes expired records and retains fresh ones", async () => {
  const now = Date.now();
  await db
    .prepare("INSERT INTO sessions VALUES(?,?,?,?,?)")
    .bind("expired", uid, csrf, now, now - 31 * 60000)
    .run();
  for (const expires of [now - 1, now + 60000]) {
    await db
      .prepare("INSERT INTO oauth_states VALUES(?,?,?,?)")
      .bind(String(expires), "v", "n", expires)
      .run();
    await db
      .prepare("INSERT INTO rate_limits VALUES(?,?,?)")
      .bind(String(expires), 1, expires)
      .run();
  }
  await app.cleanup(env);
  for (const table of ["sessions", "oauth_states", "rate_limits"])
    expect(
      (await db.prepare(`SELECT count(*) n FROM ${table}`).first()).n,
    ).toBe(1);
});
it("hides database failures from responses", async () => {
  vi.spyOn(db, "prepare").mockImplementation(() => {
    throw Error("private SQL and credentials");
  });
  const response = await request("/api/resources");
  expect(response.status).toBe(500);
  expect(await response.json()).toEqual({
    code: 500,
    success: false,
    message: "Request failed",
  });
});
it("rejects foreign origins before any mutation even with a valid CSRF token", async () => {
  expect(
    (
      await request(
        `/api/resources/${rid}`,
        "PUT",
        { notes: "injected" },
        { Origin: "https://attacker.example" },
      )
    ).status,
  ).toBe(403);
  expect(
    JSON.parse(
      (
        await db
          .prepare("SELECT document FROM resources WHERE id=?")
          .bind(rid)
          .first()
      ).document,
    ),
  ).toEqual(original);
});

it("persists shortlist CRUD, deduplicates resources, and audits changes", async () => {
  const created = await request("/api/shortlists", "POST", {
    name: " Support ",
  });
  expect(created.status).toBe(201);
  const { result: list } = await created.json();
  expect(list.name).toBe("Support");
  const path = `/api/shortlists/${list.id}`;
  for (let i = 0; i < 2; i++)
    expect((await request(`${path}/resources/${rid}`, "PUT")).status).toBe(200);
  expect((await (await request(path)).json()).result.resources).toHaveLength(1);
  expect(
    (await (await request("/api/shortlists")).json()).result[0].count,
  ).toBe(1);
  expect((await request(path, "PATCH", { name: "Renamed" })).status).toBe(200);
  expect((await (await request(path)).json()).result.name).toBe("Renamed");
  expect((await request(`${path}/resources/${rid}`, "DELETE")).status).toBe(
    200,
  );
  expect((await (await request(path)).json()).result.resources).toEqual([]);
  expect((await request(path, "DELETE")).status).toBe(200);
  expect((await request(path)).status).toBe(404);
  expect((await (await request("/api/shortlists")).json()).result).toEqual([]);
});
it("allows owners but rejects edits by another volunteer", async () => {
  const { result: list } = await (
    await request("/api/shortlists", "POST", { name: "Owned" })
  ).json();
  const path = `/api/shortlists/${list.id}`;
  const user = { _id: uid, role: "VOLUNTEER" };
  await db
    .prepare("UPDATE users SET role=?,document=? WHERE id=?")
    .bind(user.role, JSON.stringify(user), uid)
    .run();
  expect((await request(path, "PATCH", { name: "Mine" })).status).toBe(200);
  // Preserve valid foreign keys while assigning another existing owner.
  const other = "e".repeat(24);
  await db
    .prepare("INSERT INTO users VALUES(?,?,?,?,?)")
    .bind(
      other,
      "other",
      "other@example.com",
      "VOLUNTEER",
      JSON.stringify({ _id: other, role: "VOLUNTEER" }),
    )
    .run();
  await db
    .prepare("UPDATE shortlists SET owner_id=? WHERE id=?")
    .bind(other, list.id)
    .run();
  expect((await request(path)).status).toBe(200);
  for (const method of ["PATCH", "DELETE"])
    expect(
      (
        await request(
          path,
          method,
          method === "PATCH" ? { name: "No" } : undefined,
        )
      ).status,
    ).toBe(403);
});
