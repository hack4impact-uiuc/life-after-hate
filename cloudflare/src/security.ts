import type { Context } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { createRemoteJWKSet, jwtVerify } from "jose";
import type { ContextEnv, Document, Session } from "./types";

export const random = (bytes = 32) =>
  Array.from(crypto.getRandomValues(new Uint8Array(bytes)), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
export const hash = async (value: string) =>
  Array.from(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)),
    ),
    (b) => b.toString(16).padStart(2, "0"),
  ).join("");
export function cookieName(c: Context<ContextEnv>, kind = "sid") {
  return new URL(c.env.APP_ORIGIN).protocol === "https:"
    ? `__Host-lah.${kind}`
    : `lah.${kind}`;
}
export function cookie(
  c: Context<ContextEnv>,
  kind: string,
  value: string,
  maxAge: number,
) {
  setCookie(c, cookieName(c, kind), value, {
    httpOnly: true,
    secure: new URL(c.env.APP_ORIGIN).protocol === "https:",
    sameSite: "Lax",
    path: "/",
    maxAge,
  });
}
export function validOrigin(origin: string) {
  const url = new URL(origin);
  if (
    url.origin !== origin ||
    (url.protocol !== "https:" &&
      !(
        url.protocol === "http:" &&
        ["localhost", "127.0.0.1"].includes(url.hostname)
      )) ||
    url.hostname.endsWith(".invalid")
  )
    throw new Error("Configure APP_ORIGIN");
}
export async function rateLimit(
  c: Context<ContextEnv>,
  scope: string,
  limit: number,
) {
  const window = Math.floor(Date.now() / 60000);
  const ip = c.req.header("CF-Connecting-IP") || "local";
  const key = await hash(`${scope}:${ip}:${window}`);
  const row = await c.env.DB.prepare(
    "INSERT INTO rate_limits(key,count,expires_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count",
  )
    .bind(key, (window + 2) * 60000)
    .first<{ count: number }>();
  if (!row || row.count > limit)
    throw new HTTPException(429, { message: "Too many requests" });
}
export async function authenticate(c: Context<ContextEnv>) {
  const token = getCookie(c, cookieName(c));
  if (!token || !/^[a-f0-9]{64}$/.test(token)) throw new HTTPException(401);
  const tokenHash = await hash(token);
  const row = await c.env.DB.prepare(
    "SELECT s.*,u.document FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=?",
  )
    .bind(tokenHash)
    .first<Session & { document: string }>();
  const now = Date.now();
  if (
    !row ||
    now - row.last_seen >= 30 * 60000 ||
    now - row.created_at >= 8 * 3600000
  ) {
    if (row)
      await c.env.DB.prepare("DELETE FROM sessions WHERE token_hash=?")
        .bind(tokenHash)
        .run();
    cookie(c, "sid", "", 0);
    throw new HTTPException(401);
  }
  const user = JSON.parse(row.document);
  c.set("user", user);
  c.set("session", row);
  // Throttle touch writes; expiration is conservative by at most one minute.
  if (now - row.last_seen > 60000)
    await c.env.DB.prepare("UPDATE sessions SET last_seen=? WHERE token_hash=?")
      .bind(now, tokenHash)
      .run();
  if (!["GET", "HEAD", "OPTIONS"].includes(c.req.method)) {
    if (c.req.header("Origin") && c.req.header("Origin") !== c.env.APP_ORIGIN)
      throw new HTTPException(403);
    const token = c.req.header("X-CSRF-Token") || "";
    if (!/^[a-f0-9]{64}$/.test(token) || token !== row.csrf)
      throw new HTTPException(403, { message: "Invalid CSRF token" });
  }
}
export function requireRole(c: Context<ContextEnv>, roles: string[]) {
  if (!roles.includes(c.get("user").role)) throw new HTTPException(403);
}
export function publicUser(user: Document) {
  return Object.fromEntries(
    ["firstName", "lastName", "role", "title", "location", "propicUrl", "email"]
      .map((k) => [k, user[k]])
      .concat([["id", user._id]]),
  );
}
const jwks = createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs"),
);
export async function login(c: Context<ContextEnv>) {
  if (!c.env.GOOGLE_CLIENT_ID || !c.env.GOOGLE_CLIENT_SECRET)
    throw new HTTPException(503, { message: "Google login is not configured" });
  await rateLimit(c, "login", 10);
  const state = random(),
    verifier = random(),
    nonce = random();
  const challenge = btoa(
    String.fromCharCode(
      ...new Uint8Array(
        await crypto.subtle.digest(
          "SHA-256",
          new TextEncoder().encode(verifier),
        ),
      ),
    ),
  )
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  await c.env.DB.prepare("INSERT INTO oauth_states VALUES(?,?,?,?)")
    .bind(await hash(state), verifier, nonce, Date.now() + 10 * 60000)
    .run();
  cookie(c, "oauth", state, 600);
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({
    client_id: c.env.GOOGLE_CLIENT_ID,
    redirect_uri: c.env.APP_ORIGIN + "/api/auth/login/callback",
    response_type: "code",
    scope: "openid profile email",
    state,
    nonce,
    code_challenge: challenge,
    code_challenge_method: "S256",
  }).toString();
  return c.redirect(url.href);
}
export async function callback(c: Context<ContextEnv>) {
  await rateLimit(c, "callback", 10);
  const state = c.req.query("state"),
    code = c.req.query("code");
  if (
    !state ||
    !/^[a-f0-9]{64}$/.test(state) ||
    getCookie(c, cookieName(c, "oauth")) !== state ||
    !code ||
    code.length > 4096
  )
    throw new HTTPException(400, { message: "Invalid login state" });
  cookie(c, "oauth", "", 0);
  const saved = await c.env.DB.prepare(
    "DELETE FROM oauth_states WHERE token_hash=? AND expires_at>? RETURNING verifier,nonce",
  )
    .bind(await hash(state), Date.now())
    .first<{ verifier: string; nonce: string }>();
  if (!saved || !c.env.GOOGLE_CLIENT_ID || !c.env.GOOGLE_CLIENT_SECRET)
    throw new HTTPException(400, { message: "Expired login state" });
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    redirect: "manual",
    signal: AbortSignal.timeout(10000),
    body: new URLSearchParams({
      code,
      client_id: c.env.GOOGLE_CLIENT_ID,
      client_secret: c.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: c.env.APP_ORIGIN + "/api/auth/login/callback",
      grant_type: "authorization_code",
      code_verifier: saved.verifier,
    }),
  });
  if (!response.ok) throw new HTTPException(401);
  const tokens = (await response.json()) as { id_token?: string };
  if (!tokens.id_token) throw new HTTPException(401);
  let payload;
  try {
    ({ payload } = await jwtVerify(tokens.id_token, jwks, {
      issuer: ["https://accounts.google.com", "accounts.google.com"],
      audience: c.env.GOOGLE_CLIENT_ID,
      algorithms: ["RS256"],
    }));
  } catch {
    throw new HTTPException(401);
  }
  if (
    payload.nonce !== saved.nonce ||
    payload.email_verified !== true ||
    typeof payload.sub !== "string" ||
    typeof payload.email !== "string"
  )
    throw new HTTPException(401);
  let row = await c.env.DB.prepare("SELECT id FROM users WHERE oauth_id=?")
    .bind(payload.sub)
    .first<{ id: string }>();
  if (!row) {
    // Never link by email: existing accounts retain their original Google subject.
    if (
      await c.env.DB.prepare("SELECT id FROM users WHERE email=?")
        .bind(payload.email)
        .first()
    )
      throw new HTTPException(409, {
        message: "Account requires administrator review",
      });
    const user = {
      _id: random(12),
      oauthId: payload.sub,
      email: payload.email,
      firstName: String(payload.given_name || ""),
      lastName: String(payload.family_name || ""),
      propicUrl: String(payload.picture || ""),
      role: "PENDING",
      title: "",
      location: "NORTH",
    };
    await c.env.DB.prepare(
      "INSERT INTO users(id,oauth_id,email,role,document) VALUES(?,?,?,?,?)",
    )
      .bind(user._id, user.oauthId, user.email, user.role, JSON.stringify(user))
      .run();
    row = { id: user._id };
  }
  const token = random(),
    now = Date.now();
  const old = getCookie(c, cookieName(c));
  if (old)
    await c.env.DB.prepare("DELETE FROM sessions WHERE token_hash=?")
      .bind(await hash(old))
      .run();
  await c.env.DB.prepare("INSERT INTO sessions VALUES(?,?,?,?,?)")
    .bind(await hash(token), row.id, random(), now, now)
    .run();
  cookie(c, "sid", token, 8 * 3600);
  return c.redirect(c.env.APP_ORIGIN);
}
