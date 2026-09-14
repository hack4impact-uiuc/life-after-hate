import { Miniflare } from "miniflare";
import { readFile } from "node:fs/promises";
export async function runtime(options = {}) {
  return new Miniflare({
    modules: true,
    scriptPath: new URL("../dist/worker.js", import.meta.url).pathname,
    compatibilityDate: "2026-07-30",
    d1Databases: ["DB"],
    bindings: { APP_ORIGIN: "http://localhost:8787" },
    ...options,
  });
}
export async function schema(db) {
  const sql = await readFile(
    new URL("../migrations/0001_initial.sql", import.meta.url),
    "utf8",
  );
  // Only the checked-in schema is split; imported documents always use bindings.
  for (const statement of sql
    .replace(/--[^\n]*/g, "")
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean))
    await db.prepare(statement).run();
}
export async function insertDocument(db, collection, doc) {
  const json = JSON.stringify(doc);
  return collection === "users"
    ? db
        .prepare(
          "INSERT INTO users(id,oauth_id,email,role,document) VALUES(?,?,?,?,?)",
        )
        .bind(doc._id, doc.oauthId, doc.email, doc.role, json)
        .run()
    : db
        .prepare("INSERT INTO resources(id,document) VALUES(?,?)")
        .bind(doc._id, json)
        .run();
}
