// Test-only loopback server. Never imported by the production entry point.
import { createServer } from "node:http";
import { getRequestListener } from "@hono/node-server";
import { randomBytes, createHash } from "node:crypto";
import { runtime, schema, insertDocument } from "./runtime.mjs";
let instance;
const origin = "http://127.0.0.1:4174";
async function reset(role) {
  await instance?.dispose();
  instance = await runtime({
    bindings: { APP_ORIGIN: origin, MAPQUEST_KEY: "synthetic" },
    outboundService: async (request) => {
      const url = new URL(request.url);
      if (url.hostname !== "www.mapquestapi.com")
        return new Response("", { status: 503 });
      const location = url.searchParams.get("location") || "";
      const stl = /Louis/i.test(location);
      return Response.json({
        results: [
          {
            locations: [
              {
                latLng: stl
                  ? { lat: 38.627, lng: -90.1994 }
                  : { lat: 41.8781, lng: -87.6298 },
                street: "100 Example Street",
                adminArea5: stl ? "Saint Louis" : "Chicago",
                adminArea3: stl ? "MO" : "IL",
                postalCode: stl ? "63101" : "60601",
              },
            ],
          },
        ],
      });
    },
  });
  const db = await instance.getDatabase();
  await schema(db);
  for (const [i, r] of ["ADMIN", "VOLUNTEER", "PENDING", "REJECTED"].entries())
    await insertDocument(db, "users", {
      _id: String(i + 1).repeat(24),
      oauthId: "synthetic-" + r,
      email: r.toLowerCase() + "@example.com",
      firstName:
        r === "ADMIN"
          ? "Alex"
          : r === "VOLUNTEER"
            ? "Blair"
            : r === "PENDING"
              ? "Casey"
              : "Drew",
      lastName: "Example",
      role: r,
      title: "Coordinator",
      location: "NORTH",
    });
  for (const [i, name, tags, coordinates] of [
    [1, "Alpha Support", ["Housing", "Meals"], [-87.6298, 41.8781]],
    [2, "Bravo Shelter", ["Housing"], [-90.1994, 38.627]],
    [3, "Charlie Supplies", ["Supplies"], [-122.4194, 37.7749]],
  ])
    await insertDocument(db, "resources", {
      _id: String(i + 5).repeat(24),
      type: "GROUP",
      companyName: name,
      contactName: "Example Contact",
      contactEmail: "contact@example.com",
      address: {
        streetAddress: "100 Example Street",
        city: i === 2 ? "Saint Louis" : i === 1 ? "Chicago" : "San Francisco",
        state: i === 2 ? "MO" : i === 1 ? "IL" : "CA",
        postalCode: "60601",
      },
      location: { type: "Point", coordinates },
      tags,
      description: "Synthetic description",
      notes: "Synthetic private notes",
      dateCreated: "2026-01-01T00:00:00.000Z",
    });
  const id = String(
    ["ADMIN", "VOLUNTEER", "PENDING", "REJECTED"].indexOf(role) + 1,
  ).repeat(24);
  const token = randomBytes(32).toString("hex");
  if (role)
    await db
      .prepare("INSERT INTO sessions VALUES(?,?,?,?,?)")
      .bind(
        createHash("sha256").update(token).digest("hex"),
        id,
        randomBytes(32).toString("hex"),
        Date.now(),
        Date.now(),
      )
      .run();
  return { token };
}
await reset(null);
createServer(
  getRequestListener(
    async (request) => {
      const url = new URL(request.url);
      if (url.pathname === "/__test/reset" && request.method === "POST") {
        const { role } = await request.json();
        if (
          role !== null &&
          !["ADMIN", "VOLUNTEER", "PENDING", "REJECTED"].includes(role)
        )
          return new Response("", { status: 400 });
        return Response.json(await reset(role));
      }
      return instance.dispatchFetch(origin + url.pathname + url.search, {
        method: request.method,
        headers: request.headers,
        body: request.body,
        duplex: "half",
      });
    },
    { overrideGlobalObjects: false },
  ),
).listen(4176, "127.0.0.1");
