import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import type { ContextEnv, Document, Env } from "./types";
import {
  authenticate,
  callback,
  cookie,
  login,
  publicUser,
  random,
  rateLimit,
  requireRole,
  validOrigin,
} from "./security";
import {
  filter,
  geocode,
  present,
  resourceSchema,
  safeURL,
  searchSchema,
} from "./resources";

const app = new Hono<ContextEnv>({ strict: false });
const roles = z.enum(["ADMIN", "VOLUNTEER", "PENDING", "REJECTED"]);
const userSchema = z
  .object({
    firstName: z.string().min(1).max(300),
    lastName: z.string().max(300).default(""),
    oauthId: z.string().min(1).max(300),
    email: z.email().max(254),
    role: roles.default("PENDING"),
    title: z.string().max(300).default(""),
    location: z.enum(["NORTH", "SOUTH"]),
    propicUrl: z.string().max(2000).optional(),
  })
  .strict();
const roleSchema = z
  .object({ role: roles, title: z.string().max(300).default("") })
  .strict();
const id = (value: string) => {
  if (!/^[a-f0-9]{24}$/i.test(value)) throw new HTTPException(400);
  return value;
};
async function body(request: Request) {
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    throw new HTTPException(415);
  const reader = request.body?.getReader();
  if (!reader) throw new HTTPException(400);
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 65536) {
      await reader.cancel();
      throw new HTTPException(413);
    }
    chunks.push(value);
  }
  const all = new Uint8Array(size);
  let offset = 0;
  for (const part of chunks) {
    all.set(part, offset);
    offset += part.length;
  }
  try {
    return JSON.parse(new TextDecoder().decode(all));
  } catch {
    throw new HTTPException(400);
  }
}
const result = (value: any) => ({ code: 200, success: true, result: value });
const success = { code: 200, success: true };
async function find(env: Env, table: "users" | "resources", value: string) {
  const row = await env.DB.prepare(`SELECT document FROM ${table} WHERE id=?`)
    .bind(id(value))
    .first<{ document: string }>();
  if (!row) throw new HTTPException(404);
  return JSON.parse(row.document) as Document;
}
function audit(env: Env, actor: Document, action: string, target: string) {
  return env.DB.prepare("INSERT INTO audit_events VALUES(?,?,?,?,?)").bind(
    random(),
    actor._id,
    action,
    target,
    new Date().toISOString(),
  );
}

app.use("*", async (c, next) => {
  c.header("Cache-Control", "no-store");
  c.header("Referrer-Policy", "no-referrer");
  c.header("X-Content-Type-Options", "nosniff");
  c.header("X-Frame-Options", "DENY");
  c.header("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  c.header(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*.googleusercontent.com https://*.mapbox.com https://tiles.openfreemap.org; connect-src 'self' https://*.mapbox.com https://tiles.openfreemap.org; worker-src 'self' blob:; font-src 'self' data:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'",
  );
  validOrigin(c.env.APP_ORIGIN);
  if (new URL(c.req.url).origin !== c.env.APP_ORIGIN)
    throw new HTTPException(400);
  if (c.env.APP_ORIGIN.startsWith("https:"))
    c.header("Strict-Transport-Security", "max-age=31536000");
  await next();
});
app.use("/api/*", async (c, next) => {
  await rateLimit(c, "api", 120);
  if (
    !["GET", "HEAD", "OPTIONS"].includes(c.req.method) &&
    c.req.header("Origin") &&
    c.req.header("Origin") !== c.env.APP_ORIGIN
  )
    throw new HTTPException(403);
  const path = new URL(c.req.url).pathname.replace(/\/+$/, "");
  if (!["/api/auth/login", "/api/auth/login/callback"].includes(path))
    await authenticate(c);
  await next();
});
app.get("/api/auth/login", login);
app.get("/api/auth/login/callback", callback);
app.get("/api/auth/csrf", (c) => c.json({ token: c.get("session").csrf }));
app.post("/api/auth/logout", async (c) => {
  await c.env.DB.prepare("DELETE FROM sessions WHERE token_hash=?")
    .bind(c.get("session").token_hash)
    .run();
  cookie(c, "sid", "", 0);
  return c.json(success);
});
app.get("/api/users/current", (c) => {
  requireRole(c, ["ADMIN", "VOLUNTEER", "PENDING"]);
  return c.json(result(publicUser(c.get("user"))));
});
app.use("/api/users/*", async (c, next) => {
  requireRole(c, ["ADMIN"]);
  await next();
});
app.get("/api/users", async (c) => {
  const rows = await c.env.DB.prepare(
    "SELECT document FROM users ORDER BY json_extract(document,'$.firstName')",
  ).all<{ document: string }>();
  return c.json(
    result(rows.results.map((r) => publicUser(JSON.parse(r.document)))),
  );
});
app.get("/api/users/role/:role", async (c) => {
  const role = roles.parse(c.req.param("role").toUpperCase());
  const rows = await c.env.DB.prepare("SELECT document FROM users WHERE role=?")
    .bind(role)
    .all<{ document: string }>();
  return c.json(
    result(rows.results.map((r) => publicUser(JSON.parse(r.document)))),
  );
});
app.get("/api/users/:id", async (c) =>
  c.json(result(publicUser(await find(c.env, "users", c.req.param("id"))))),
);
app.post("/api/users", async (c) => {
  const data = userSchema.parse(await body(c.req.raw));
  const user = { ...data, _id: random(12) };
  if (
    await c.env.DB.prepare("SELECT id FROM users WHERE email=? OR oauth_id=?")
      .bind(user.email, user.oauthId)
      .first()
  )
    throw new HTTPException(409);
  await c.env.DB.batch([
    c.env.DB.prepare("INSERT INTO users VALUES(?,?,?,?,?)").bind(
      user._id,
      user.oauthId,
      user.email,
      user.role,
      JSON.stringify(user),
    ),
    audit(c.env, c.get("user"), "user.create", user._id),
  ]);
  return c.json(success);
});
app.patch("/api/users/:id", async (c) => {
  const data = roleSchema.parse(await body(c.req.raw)),
    user = await find(c.env, "users", c.req.param("id"));
  const updated = { ...user, ...data };
  await c.env.DB.batch([
    c.env.DB.prepare("UPDATE users SET role=?,document=? WHERE id=?").bind(
      updated.role,
      JSON.stringify(updated),
      user._id,
    ),
    c.env.DB.prepare("DELETE FROM sessions WHERE user_id=?").bind(user._id),
    audit(c.env, c.get("user"), "user.update-role", user._id),
  ]);
  return c.json(success);
});
app.delete("/api/users/:id", async (c) => {
  const user = await find(c.env, "users", c.req.param("id"));
  await c.env.DB.batch([
    c.env.DB.prepare("DELETE FROM users WHERE id=?").bind(user._id),
    audit(c.env, c.get("user"), "user.delete", user._id),
  ]);
  return c.json(success);
});
app.use("/api/resources/*", async (c, next) => {
  requireRole(
    c,
    ["GET", "HEAD"].includes(c.req.method) ? ["ADMIN", "VOLUNTEER"] : ["ADMIN"],
  );
  await next();
});
app.get("/api/resources", async (c) => {
  const rows = await c.env.DB.prepare("SELECT document FROM resources").all<{
    document: string;
  }>();
  return c.json(
    result(rows.results.map((r) => present(JSON.parse(r.document)))),
  );
});
app.get("/api/resources/tags", async (c) => {
  const rows = await c.env.DB.prepare(
    "SELECT DISTINCT value FROM resources,json_each(resources.document,'$.tags') ORDER BY value",
  ).all<{ value: string }>();
  return c.json(result(rows.results.map((r) => r.value)));
});
app.get("/api/resources/filter", async (c) => {
  const query = searchSchema.parse(c.req.query());
  let center: number[] | undefined;
  if (query.address) {
    await rateLimit(c, "geocode", 20, c.get("user")._id);
    center = (await geocode(query.address, c.env)).location.coordinates;
  }
  const rows = await c.env.DB.prepare("SELECT document FROM resources").all<{
    document: string;
  }>();
  return c.json(
    result({
      center: center || [null, null],
      resources: filter(
        rows.results.map((r) => JSON.parse(r.document)),
        query,
        center,
      ),
    }),
  );
});
app.get("/api/resources/:id", async (c) =>
  c.json(result(present(await find(c.env, "resources", c.req.param("id"))))),
);
async function resourceData(
  c: Parameters<typeof authenticate>[0],
  existing?: Document,
) {
  const data: Document = resourceSchema.parse(await body(c.req.raw));
  if (
    !existing &&
    (!data.type ||
      !data.contactName ||
      !data.address ||
      (data.type === "GROUP" && !data.companyName) ||
      (data.type === "TANGIBLE" && !data.resourceName))
  )
    throw new HTTPException(400);
  if (existing && data.type && data.type !== existing.type)
    throw new HTTPException(400, { message: "Resource type cannot change" });
  if (data.address !== undefined) {
    await rateLimit(c, "geocode", 20, c.get("user")._id);
    Object.assign(data, await geocode(data.address, c.env));
  }
  if (data.websiteURL !== undefined) data.websiteURL = safeURL(data.websiteURL);
  if (data.tags)
    data.tags = data.tags.map((t: string) =>
      t.replace(/(^|\s)\S/g, (s) => s.toUpperCase()),
    );
  return {
    ...data,
    dateLastModified: new Date().toISOString(),
    lastModifiedUser: [c.get("user").firstName, c.get("user").lastName]
      .filter(Boolean)
      .join(" "),
  };
}
app.post("/api/resources", async (c) => {
  const doc = {
    _id: random(12),
    dateCreated: new Date().toISOString(),
    tags: [],
    ...(await resourceData(c)),
  };
  await c.env.DB.batch([
    c.env.DB.prepare("INSERT INTO resources(id,document) VALUES(?,?)").bind(
      doc._id,
      JSON.stringify(doc),
    ),
    audit(c.env, c.get("user"), "resource.create", doc._id),
  ]);
  return c.json({ code: 201, success: true, id: doc._id }, 201);
});
app.put("/api/resources/:id", async (c) => {
  const doc = await find(c.env, "resources", c.req.param("id")),
    data = await resourceData(c, doc);
  await c.env.DB.batch([
    c.env.DB.prepare("UPDATE resources SET document=? WHERE id=?").bind(
      JSON.stringify({ ...doc, ...data }),
      doc._id,
    ),
    audit(c.env, c.get("user"), "resource.update", doc._id),
  ]);
  return c.json(success);
});
app.delete("/api/resources/:id", async (c) => {
  const doc = await find(c.env, "resources", c.req.param("id"));
  await c.env.DB.batch([
    c.env.DB.prepare("DELETE FROM resources WHERE id=?").bind(doc._id),
    audit(c.env, c.get("user"), "resource.delete", doc._id),
  ]);
  return c.json(success);
});
app.all("/api/*", () => {
  throw new HTTPException(404);
});
app.get("*", (c) => c.text("LAH API"));
app.onError((error, c) => {
  const status =
    error instanceof HTTPException
      ? error.status
      : error instanceof z.ZodError
        ? 400
        : 500;
  // Never log request bodies, URLs, SQL bindings, credentials or provider errors.
  return c.json(
    {
      code: status,
      success: false,
      message:
        status === 500
          ? "Request failed"
          : status === 400
            ? "Invalid request"
            : status === 401
              ? "Please sign in"
              : status === 403
                ? "Access denied"
                : status === 503
                  ? "Service is not configured"
                  : "Request could not be completed",
    },
    status,
  );
});
export default {
  fetch: app.fetch,
  async cleanup(env: Env) {
    const now = Date.now();
    await env.DB.batch([
      env.DB.prepare(
        "DELETE FROM sessions WHERE last_seen<? OR created_at<?",
      ).bind(now - 30 * 60000, now - 8 * 3600000),
      env.DB.prepare("DELETE FROM oauth_states WHERE expires_at<?").bind(now),
      env.DB.prepare("DELETE FROM rate_limits WHERE expires_at<?").bind(now),
    ]);
  },
};
