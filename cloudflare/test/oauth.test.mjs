import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { generateKeyPair, exportJWK, SignJWT } from "jose";
import { runtime, schema } from "../scripts/runtime.mjs";
let mf, db, keys, jwk, claims, nonce, verifier, challenge;
const origin = "https://lah.example";
before(async () => {
  keys = await generateKeyPair("RS256");
  jwk = {
    ...(await exportJWK(keys.publicKey)),
    kid: "test",
    alg: "RS256",
    use: "sig",
  };
  mf = await runtime({
    bindings: {
      APP_ORIGIN: origin,
      GOOGLE_CLIENT_ID: "test-client",
      GOOGLE_CLIENT_SECRET: "test-secret",
      MAPQUEST_KEY: "test",
    },
    outboundService: async (request) => {
      const url = new URL(request.url);
      if (url.pathname === "/oauth2/v3/certs")
        return Response.json({ keys: [jwk] });
      if (url.hostname === "oauth2.googleapis.com") {
        const params = new URLSearchParams(await request.text());
        verifier = params.get("code_verifier");
        assert.equal(
          params.get("redirect_uri"),
          origin + "/api/auth/login/callback",
        );
        const jwt = await new SignJWT({
          sub: "test-google-id",
          email: "new@example.com",
          email_verified: true,
          given_name: "Test",
          nonce,
          ...claims,
        })
          .setProtectedHeader({ alg: "RS256", kid: "test" })
          .setIssuer("https://accounts.google.com")
          .setAudience("test-client")
          .setIssuedAt()
          .setExpirationTime("5m")
          .sign(keys.privateKey);
        return Response.json({ id_token: jwt });
      }
      if (url.hostname === "www.mapquestapi.com")
        return Response.json({
          results: [
            {
              locations: [
                {
                  latLng: { lat: 0, lng: 0 },
                  street: "Example",
                  adminArea5: "Example City",
                  adminArea3: "IL",
                  postalCode: "00000",
                },
              ],
            },
          ],
        });
      return new Response("", { status: 500 });
    },
  });
  db = await mf.getD1Database("DB");
  await schema(db);
});
after(async () => {
  await mf?.dispose();
});
async function start() {
  const response = await mf.dispatchFetch(origin + "/api/auth/login", {
    redirect: "manual",
  });
  assert.equal(response.status, 302);
  const url = new URL(response.headers.get("location"));
  nonce = url.searchParams.get("nonce");
  challenge = url.searchParams.get("code_challenge");
  return {
    state: url.searchParams.get("state"),
    cookie: response.headers.get("set-cookie").split(";")[0],
  };
}
async function finish(flow) {
  return mf.dispatchFetch(
    origin + "/api/auth/login/callback?code=test&state=" + flow.state,
    { headers: { cookie: flow.cookie }, redirect: "manual" },
  );
}
test("verified Google login uses PKCE, secure cookies and creates only PENDING user", async () => {
  claims = {};
  const flow = await start(),
    response = await finish(flow);
  assert.equal(response.status, 302);
  const cookie = response.headers
    .getSetCookie()
    .find((c) => c.startsWith("__Host-lah.sid="));
  assert(cookie.includes("Secure"));
  assert(cookie.includes("HttpOnly"));
  assert(cookie.includes("SameSite=Lax"));
  const { createHash } = await import("node:crypto");
  assert.equal(
    createHash("sha256").update(verifier).digest("base64url"),
    challenge,
  );
  const row = await db
    .prepare("SELECT role FROM users WHERE oauth_id=?")
    .bind("test-google-id")
    .first();
  assert.equal(row.role, "PENDING");
  assert.equal((await finish(flow)).status, 400);
});
test("nonce mismatch and unverified emails cannot sign in", async () => {
  claims = { nonce: "wrong" };
  assert.equal((await finish(await start())).status, 401);
  claims = { email_verified: false };
  assert.equal((await finish(await start())).status, 401);
});
test("same email with different Google subject does not take over an existing account", async () => {
  claims = { sub: "different-google-id" };
  assert.equal((await finish(await start())).status, 409);
});
test("admin CRUD uses real D1, zero coordinates, strict input and durable audit", async () => {
  const row = await db.prepare("SELECT id,document FROM users LIMIT 1").first();
  const user = { ...JSON.parse(row.document), role: "ADMIN" };
  await db
    .prepare("UPDATE users SET role=?,document=? WHERE id=?")
    .bind("ADMIN", JSON.stringify(user), row.id)
    .run();
  claims = {};
  const login = await finish(await start());
  const cookie = login.headers
    .getSetCookie()
    .find((c) => c.startsWith("__Host-lah.sid="))
    .split(";")[0];
  const token = await (
    await mf.dispatchFetch(origin + "/api/auth/csrf", { headers: { cookie } })
  ).json();
  const headers = {
    cookie,
    "X-CSRF-Token": token.token,
    "Content-Type": "application/json",
    Origin: origin,
  };
  const create = await mf.dispatchFetch(origin + "/api/resources", {
    method: "POST",
    headers,
    body: JSON.stringify({
      type: "GROUP",
      companyName: "Test",
      contactName: "Demo",
      address: "Synthetic only",
      notes: "quote '; DROP TABLE users; --",
      tags: ["support"],
    }),
  });
  assert.equal(create.status, 201);
  const { id } = await create.json();
  let doc = JSON.parse(
    (
      await db
        .prepare("SELECT document FROM resources WHERE id=?")
        .bind(id)
        .first()
    ).document,
  );
  assert.deepEqual(doc.location.coordinates, [0, 0]);
  assert(doc.notes.includes("DROP TABLE"));
  const search = await mf.dispatchFetch(
    origin + "/api/resources/filter?address=Test&radius=5",
    { headers: { cookie } },
  );
  assert.equal((await search.json()).result.resources.length, 1);
  assert.equal(
    (
      await mf.dispatchFetch(origin + "/api/resources/" + id, {
        method: "PUT",
        headers,
        body: JSON.stringify({ description: "Updated" }),
      })
    ).status,
    200,
  );
  assert.equal(
    (
      await mf.dispatchFetch(origin + "/api/resources/" + id, {
        method: "DELETE",
        headers,
      })
    ).status,
    200,
  );
  assert.equal(
    (
      await mf.dispatchFetch(origin + "/api/resources/" + id, {
        headers: { cookie },
      })
    ).status,
    404,
  );
  assert.equal(
    (
      await db
        .prepare("SELECT count(*) AS n FROM audit_events WHERE target_id=?")
        .bind(id)
        .first()
    ).n,
    3,
  );
});
