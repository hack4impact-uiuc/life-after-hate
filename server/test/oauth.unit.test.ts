import { beforeEach, afterEach, it, expect, vi } from "vitest";
import { Hono } from "hono";
vi.mock("jose", () => ({ createRemoteJWKSet: vi.fn(), jwtVerify: vi.fn() }));
import { jwtVerify } from "jose";
import { login, callback, hash } from "../src/security";
const state = "a".repeat(64);
const claims = {
  sub: "subject",
  email: "person@example.com",
  email_verified: true,
  nonce: "nonce",
  given_name: "Test",
  family_name: "Person",
  picture: "https://example.com/photo",
};
let env: any,
  calls: { sql: string; args: any[] }[],
  saved: any,
  linked: any,
  conflict: any;
beforeEach(() => {
  calls = [];
  saved = { verifier: "verifier", nonce: "nonce" };
  linked = { id: "user" };
  conflict = null;
  const prepare = (sql: string) => ({
    bind: (...args: any[]) => ({
      first: async () => {
        calls.push({ sql, args });
        return sql.includes("rate_limits")
          ? { count: 1 }
          : sql.includes("DELETE FROM oauth_states")
            ? saved
            : sql.includes("WHERE oauth_id")
              ? linked
              : conflict;
      },
      run: async () => {
        calls.push({ sql, args });
        return {};
      },
    }),
  });
  env = {
    DB: { prepare },
    APP_ORIGIN: "https://example.com",
    GOOGLE_CLIENT_ID: "client",
    GOOGLE_CLIENT_SECRET: "secret",
  };
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(Response.json({ id_token: "signed-token" })),
  );
  vi.mocked(jwtVerify).mockResolvedValue({ payload: claims } as any);
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
function run(
  handler = callback,
  query = `?state=${state}&code=code`,
  cookie = `__Host-lah.oauth=${state}`,
) {
  const app = new Hono();
  app.get("/", handler as any);
  return app.request(
    `https://example.com/${query}`,
    { headers: { Cookie: cookie } },
    env,
  );
}
it("initiates OAuth with bound state, nonce, PKCE and secure cookie", async () => {
  const response = await run(login, "");
  expect(response.status).toBe(302);
  const url = new URL(response.headers.get("location")!);
  expect(url.origin).toBe("https://accounts.google.com");
  expect(url.searchParams.get("code_challenge_method")).toBe("S256");
  expect(url.searchParams.get("redirect_uri")).toBe(
    "https://example.com/api/auth/login/callback",
  );
  const entry = calls.find((c) => c.sql.includes("INSERT INTO oauth_states"))!;
  expect(entry.args[0]).toBe(await hash(url.searchParams.get("state")!));
  expect(entry.args[2]).toBe(url.searchParams.get("nonce"));
  expect(url.searchParams.get("code_challenge")).toBe(
    Buffer.from(await hash(entry.args[1]), "hex").toString("base64url"),
  );
  expect(response.headers.get("set-cookie")).toContain(
    `__Host-lah.oauth=${url.searchParams.get("state")}`,
  );
});
it.each(["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"])(
  "requires %s before starting login",
  async (key) => {
    delete env[key];
    expect((await run(login, "")).status).toBe(503);
    expect(calls).toEqual([]);
  },
);
it.each([
  "",
  "?code=x",
  `?state=${state}`,
  "?state=bad&code=x",
  `?state=${state}&code=${"x".repeat(4097)}`,
])("rejects invalid callbacks %# before token exchange", async (query) => {
  expect((await run(callback, query)).status).toBe(400);
  expect(fetch).not.toHaveBeenCalled();
});
it("requires the browser's matching state cookie", async () => {
  expect(
    (await run(callback, undefined, `__Host-lah.oauth=${"b".repeat(64)}`))
      .status,
  ).toBe(400);
  expect(calls.some((c) => c.sql.includes("DELETE FROM oauth_states"))).toBe(
    false,
  );
});
it("rejects expired or already-consumed state", async () => {
  saved = null;
  expect((await run()).status).toBe(400);
  expect(fetch).not.toHaveBeenCalled();
});
it.each(["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"])(
  "requires %s at callback time",
  async (key) => {
    delete env[key];
    expect((await run()).status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  },
);
it.each([401, 500])("rejects failed token exchange %s", async (status) => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(new Response(null, { status })),
  );
  expect((await run()).status).toBe(401);
  expect(calls.some((c) => c.sql.includes("INSERT INTO sessions"))).toBe(false);
});
it("rejects a token response without an ID token", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(Response.json({ access_token: "access" })),
  );
  expect((await run()).status).toBe(401);
});
it("rejects a failed signature verification", async () => {
  vi.mocked(jwtVerify).mockRejectedValueOnce(Error("Invalid signature"));
  expect((await run()).status).toBe(401);
});
it.each([
  { nonce: "other" },
  { email_verified: false },
  { email_verified: "true" },
  { sub: "" },
  { sub: 123 },
  { email: "" },
  { email: 123 },
])("rejects invalid identity claims %#", async (overrides) => {
  vi.mocked(jwtVerify).mockResolvedValueOnce({
    payload: { ...claims, ...overrides },
  } as any);
  expect((await run()).status).toBe(401);
  expect(calls.some((c) => c.sql.includes("INSERT INTO sessions"))).toBe(false);
});
it("does not link a new Google subject by matching email", async () => {
  linked = null;
  conflict = { id: "existing-user" };
  expect((await run()).status).toBe(409);
  expect(
    calls.some(
      (c) =>
        c.sql.includes("INSERT INTO users") ||
        c.sql.includes("INSERT INTO sessions"),
    ),
  ).toBe(false);
});
it.each([true, false])(
  "creates new users as PENDING with optional profile fields (present: %s)",
  async (profile) => {
    linked = null;
    if (!profile)
      vi.mocked(jwtVerify).mockResolvedValueOnce({
        payload: {
          sub: claims.sub,
          email: claims.email,
          email_verified: true,
          nonce: "nonce",
        },
      } as any);
    expect((await run()).status).toBe(302);
    const user = JSON.parse(
      calls.find((c) => c.sql.includes("INSERT INTO users"))!.args[4],
    );
    expect(user).toMatchObject({
      role: "PENDING",
      oauthId: claims.sub,
      email: claims.email,
      location: "NORTH",
      title: "",
      firstName: profile ? "Test" : "",
    });
  },
);
it("rotates the old session and stores only the new token hash", async () => {
  const old = "b".repeat(64);
  const response = await run(
    callback,
    undefined,
    `__Host-lah.oauth=${state}; __Host-lah.sid=${old}`,
  );
  expect(response.status).toBe(302);
  expect(response.headers.get("location")).toBe("https://example.com");
  expect(
    calls.find((c) => c.sql.includes("DELETE FROM sessions"))!.args,
  ).toEqual([await hash(old)]);
  const session = calls.find((c) => c.sql.includes("INSERT INTO sessions"))!;
  const token = response.headers
    .get("set-cookie")!
    .match(/__Host-lah.sid=([a-f0-9]{64})/)![1];
  expect(session.args[0]).toBe(await hash(token));
  expect(session.args[1]).toBe("user");
  expect(session.args[2]).toMatch(/^[a-f0-9]{64}$/);
  expect(jwtVerify).toHaveBeenCalledWith(
    "signed-token",
    undefined,
    expect.objectContaining({
      audience: "client",
      algorithms: ["RS256"],
      requiredClaims: ["exp", "iat", "sub", "email", "nonce"],
    }),
  );
  const [, options] = vi.mocked(fetch).mock.calls[0];
  expect((options!.body as URLSearchParams).get("code_verifier")).toBe(
    "verifier",
  );
});
