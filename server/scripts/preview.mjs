// Synthetic, loopback-only preview. This helper is never bundled into the production API.
import { createServer } from "node:http";
import { readFile, writeFile, stat } from "node:fs/promises";
import { resolve, extname, join } from "node:path";
import { randomBytes, createHash } from "node:crypto";
import { runtime, schema, insertDocument } from "./runtime.mjs";
process.umask(0o077);
const origin = "http://localhost:3001";
const assets = resolve(
  process.env.LAH_PREVIEW_ASSETS ||
    new URL("../../frontend/build", import.meta.url).pathname,
);
const mf = await runtime({
  bindings: { APP_ORIGIN: origin, MAPQUEST_KEY: "synthetic-only" },
  outboundService: async (request) => {
    if (new URL(request.url).hostname === "www.mapquestapi.com")
      return new Response(
        JSON.stringify({
          results: [
            {
              locations: [
                {
                  latLng: { lat: 41.8781, lng: -87.6298 },
                  street: "100 Example Street",
                  adminArea5: "Chicago",
                  adminArea3: "IL",
                  postalCode: "60601",
                },
              ],
            },
          ],
        }),
        { headers: { "Content-Type": "application/json" } },
      );
    return new Response("External services disabled in synthetic preview", {
      status: 503,
    });
  },
});
const db = await mf.getDatabase();
await schema(db);
const user = {
  _id: "a".repeat(24),
  oauthId: "synthetic-admin",
  email: "demo@example.com",
  firstName: "Alex",
  lastName: "Rivera",
  role: "ADMIN",
  location: "NORTH",
};
await insertDocument(db, "users", user);
for (const [i, name] of [
  "Community Counseling Collective",
  "New Start Employment Center",
  "Prairie Community Support",
  "Harbor Family Services",
  "Westside Resource Network",
].entries())
  await insertDocument(db, "resources", {
    _id: String(i + 1).padStart(24, "0"),
    type: "GROUP",
    companyName: name,
    contactName: "Demo Coordinator",
    contactEmail: "demo@example.com",
    contactPhone: "555-0100",
    description: "Synthetic demonstration resource",
    notes: "Synthetic record — no production information.",
    address: {
      streetAddress: "100 Example Street",
      city: "Chicago",
      state: "IL",
      postalCode: "60601",
    },
    location: {
      type: "Point",
      coordinates: [-87.63 + i * 0.01, 41.878 + i * 0.005],
    },
    tags: ["Support"],
    dateCreated: new Date().toISOString(),
  });
const token = randomBytes(32).toString("hex"),
  entry = randomBytes(24).toString("hex");
await db
  .prepare("INSERT INTO sessions VALUES(?,?,?,?,?)")
  .bind(
    createHash("sha256").update(token).digest("hex"),
    user._id,
    randomBytes(32).toString("hex"),
    Date.now(),
    Date.now(),
  )
  .run();
const types = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".json": "application/json",
};
let entryUsed = false;
const server = createServer(async (req, res) => {
  try {
    if (!["localhost:3001", "127.0.0.1:3001"].includes(req.headers.host)) {
      res.writeHead(400);
      res.end();
      return;
    }
    const url = new URL(req.url, origin);
    if (url.pathname === "/__demo/" + entry && !entryUsed) {
      entryUsed = true;
      res.writeHead(302, {
        "Set-Cookie": `lah.sid=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=28800`,
        Location: "/directory",
        "Cache-Control": "no-store",
        "Referrer-Policy": "no-referrer",
      });
      res.end();
      return;
    }
    if (url.pathname.startsWith("/api/")) {
      const parts = [];
      let size = 0;
      for await (const part of req) {
        size += part.length;
        if (size > 65536) {
          res.writeHead(413);
          res.end();
          return;
        }
        parts.push(part);
      }
      const response = await mf.dispatchFetch(url.href, {
        method: req.method,
        headers: req.headers,
        body: ["GET", "HEAD"].includes(req.method)
          ? undefined
          : Buffer.concat(parts),
        redirect: "manual",
      });
      const headers = Object.fromEntries(response.headers);
      if (response.headers.getSetCookie)
        headers["set-cookie"] = response.headers.getSetCookie();
      res.writeHead(response.status, headers);
      res.end(Buffer.from(await response.arrayBuffer()));
      return;
    }
    let file = resolve(assets, "." + decodeURIComponent(url.pathname));
    if (!file.startsWith(assets + "/")) file = join(assets, "index.html");
    try {
      if (!(await stat(file)).isFile()) throw Error();
    } catch {
      file = join(assets, "index.html");
    }
    res.writeHead(200, {
      "Content-Type": types[extname(file)] || "application/octet-stream",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
    });
    res.end(await readFile(file));
  } catch {
    res.writeHead(500);
    res.end("Local preview request failed");
  }
});
await new Promise((resolve) => server.listen(3001, "127.0.0.1", resolve));
const entryUrl = origin + "/__demo/" + entry;
await writeFile("/tmp/lah-preview-url", entryUrl, { mode: 0o600 });
console.log("Synthetic libSQL preview: " + entryUrl);
async function stop() {
  server.close();
  await mf.dispose();
  process.exit();
}
process.on("SIGTERM", stop);
process.on("SIGINT", stop);
