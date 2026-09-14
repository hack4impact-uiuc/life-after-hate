import { it, describe, expect, vi, afterEach } from "vitest";
import { Hono } from "hono";
import {
  hash,
  random,
  validOrigin,
  publicUser,
  cookie,
  authenticate,
  rateLimit,
  requireRole,
} from "../src/security";

afterEach(() => vi.restoreAllMocks());

it("hashes UTF-8 using SHA-256", async () => {
  expect(await hash("abc")).toBe(
    "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
  );
  expect(await hash("")).toBe(
    "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  );
});
it("generates tokens with the requested byte length", () => {
  expect(random()).toMatch(/^[a-f0-9]{64}$/);
  expect(random(12)).toMatch(/^[a-f0-9]{24}$/);
  expect(random(0)).toBe("");
  expect(random()).not.toBe(random());
});
it.each([
  "https://example.com",
  "https://example.com:8443",
  "http://localhost:3000",
  "http://127.0.0.1:5000",
])("accepts application origin %s", (origin) =>
  expect(() => validOrigin(origin)).not.toThrow(),
);
it.each([
  "https://example.com/",
  "https://example.com/path",
  "https://example.com?x=1",
  "https://example.com#x",
  "http://example.com",
  "https://user@example.com",
  "https://placeholder.invalid",
  "javascript:alert(1)",
  "invalid",
  "",
])("rejects application origin %s", (origin) =>
  expect(() => validOrigin(origin)).toThrow(),
);
it("exposes only public user fields", () => {
  expect(
    publicUser({
      _id: "id",
      firstName: "A",
      lastName: "B",
      role: "PENDING",
      email: "a@example.com",
      title: "",
      location: "NORTH",
      propicUrl: "",
      oauthId: "secret",
      csrf: "secret",
      custom: "secret",
    }),
  ).toEqual({
    id: "id",
    firstName: "A",
    lastName: "B",
    role: "PENDING",
    email: "a@example.com",
    title: "",
    location: "NORTH",
    propicUrl: "",
  });
});
it.each(["http://localhost:3000", "https://example.com"])(
  "sets session cookie attributes for %s",
  async (origin) => {
    const app = new Hono();
    app.get("/", (c) => {
      cookie(c as any, "sid", "token", 600);
      return c.text("ok");
    });
    const response = await app.request("/", {}, { APP_ORIGIN: origin });
    const header = response.headers.get("set-cookie")!;
    expect(header).toContain(
      origin.startsWith("https") ? "__Host-lah.sid=token" : "lah.sid=token",
    );
    for (const part of ["HttpOnly", "SameSite=Lax", "Path=/", "Max-Age=600"])
      expect(header).toContain(part);
    expect(header.includes("Secure")).toBe(origin.startsWith("https"));
  },
);

function harness(
  row: any,
  method = "GET",
  headers: Record<string, string> = {},
) {
  const run = vi.fn().mockResolvedValue({});
  const first = vi.fn().mockResolvedValue(row);
  const bind = vi.fn().mockReturnValue({ first, run });
  const prepare = vi.fn().mockReturnValue({ bind });
  const app = new Hono();
  app.all("/", async (c) => {
    await authenticate(c as any);
    return c.json({ user: c.get("user" as never) });
  });
  return {
    prepare,
    bind,
    run,
    first,
    response: app.request(
      "/",
      { method, headers: { Cookie: `lah.sid=${"a".repeat(64)}`, ...headers } },
      { APP_ORIGIN: "http://localhost:3000", DB: { prepare } },
    ),
  };
}

describe("session authentication", () => {
  const now = 1_800_000_000_000;
  const session = (overrides = {}) => ({
    created_at: now,
    last_seen: now,
    csrf: "b".repeat(64),
    document: JSON.stringify({ _id: "user", role: "ADMIN" }),
    ...overrides,
  });
  it.each([
    "",
    "lah.sid=short",
    `lah.sid=${"A".repeat(64)}`,
    `lah.sid=${"g".repeat(64)}`,
  ])("rejects malformed cookies before DB access %#", async (Cookie) => {
    const h = harness(session(), "GET", { Cookie });
    expect((await h.response).status).toBe(401);
    expect(h.prepare).not.toHaveBeenCalled();
  });
  it("clears unknown sessions", async () => {
    const h = harness(null);
    const response = await h.response;
    expect(response.status).toBe(401);
    expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
    expect(h.run).not.toHaveBeenCalled();
  });
  it.each([{ last_seen: now - 30 * 60000 }, { created_at: now - 8 * 3600000 }])(
    "expires and deletes sessions at the exact boundary %#",
    async (overrides) => {
      vi.spyOn(Date, "now").mockReturnValue(now);
      const h = harness(session(overrides));
      expect((await h.response).status).toBe(401);
      expect(h.prepare).toHaveBeenCalledWith(
        "DELETE FROM sessions WHERE token_hash=?",
      );
      expect(h.run).toHaveBeenCalledOnce();
    },
  );
  it.each([0, 60000, 60001])(
    "throttles last-seen updates at %s milliseconds",
    async (elapsed) => {
      vi.spyOn(Date, "now").mockReturnValue(now);
      const h = harness(session({ last_seen: now - elapsed }));
      const response = await h.response;
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        user: { _id: "user", role: "ADMIN" },
      });
      expect(h.run).toHaveBeenCalledTimes(elapsed > 60000 ? 1 : 0);
      expect(h.bind.mock.calls[0]).toEqual([await hash("a".repeat(64))]);
    },
  );
  it.each(["GET", "HEAD", "OPTIONS"])(
    "allows safe method %s without CSRF",
    async (method) => {
      vi.spyOn(Date, "now").mockReturnValue(now);
      expect((await harness(session(), method).response).status).toBe(200);
    },
  );
  it.each(["POST", "PUT", "PATCH", "DELETE"])(
    "requires a session-bound CSRF token for %s",
    async (method) => {
      vi.spyOn(Date, "now").mockReturnValue(now);
      for (const token of ["", "b", "c".repeat(64)])
        expect(
          (await harness(session(), method, { "X-CSRF-Token": token }).response)
            .status,
        ).toBe(403);
      expect(
        (
          await harness(session(), method, { "X-CSRF-Token": "b".repeat(64) })
            .response
        ).status,
      ).toBe(200);
      expect(
        (
          await harness(session(), method, {
            "X-CSRF-Token": "b".repeat(64),
            Origin: "http://localhost:3000",
          }).response
        ).status,
      ).toBe(200);
      expect(
        (
          await harness(session(), method, {
            "X-CSRF-Token": "b".repeat(64),
            Origin: "https://attacker.example",
          }).response
        ).status,
      ).toBe(403);
    },
  );
});
it.each([
  ["ADMIN", 200],
  ["VOLUNTEER", 200],
  ["PENDING", 403],
  ["REJECTED", 403],
  ["UNKNOWN", 403],
])("enforces role %s", async (role, status) => {
  const app = new Hono();
  app.get("/", (c) => {
    c.set("user" as never, { role } as never);
    requireRole(c as any, ["ADMIN", "VOLUNTEER"]);
    return c.text("ok");
  });
  expect((await app.request("/")).status).toBe(status);
});
it.each([
  [1, 200],
  [10, 200],
  [11, 429],
  [null, 429],
])("rate limit fails closed for count %s", async (count, status) => {
  vi.spyOn(Date, "now").mockReturnValue(120000);
  const bind = vi
    .fn()
    .mockReturnValue({
      first: vi.fn().mockResolvedValue(count === null ? null : { count }),
    });
  const app = new Hono();
  app.get("/", async (c) => {
    await rateLimit(c as any, "login", 10);
    return c.text("ok");
  });
  expect(
    (
      await app.request(
        "/",
        {},
        { DB: { prepare: () => ({ bind }) }, CLIENT_IP: "192.0.2.1" },
      )
    ).status,
  ).toBe(status);
  expect(bind).toHaveBeenCalledWith(await hash("login:192.0.2.1:2"), 240000);
});
