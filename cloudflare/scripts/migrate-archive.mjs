import { createRequire } from "node:module";
import { parseArgs } from "node:util";
import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile, rename, stat } from "node:fs/promises";
import { resolve, join } from "node:path";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
import { runtime, schema, insertDocument } from "./runtime.mjs";
const req = createRequire(
  new URL("../../backend/package.json", import.meta.url),
);
const { MongoMemoryServer } = req("mongodb-memory-server");
const { MongoClient, BSON } = req("mongodb");
const { values } = parseArgs({
  options: {
    archive: { type: "string" },
    out: { type: "string" },
    mongorestore: { type: "string" },
    version: { type: "string", default: "8.0.32" },
  },
});
if (!values.archive || !values.out)
  throw Error(
    "Required: --archive /private/backup.archive.gz --out /private/new-migration-folder",
  );
process.umask(0o077);
const output = resolve(values.out);
const root = resolve(new URL("../..", import.meta.url).pathname);
if (output === root || output.startsWith(root + "/"))
  throw Error("Private migration output must be outside the repository");
await mkdir(output, { mode: 0o700 }); // refuse to overwrite a previous run
const archive = resolve(values.archive),
  sourceHash = createHash("sha256")
    .update(await readFile(archive))
    .digest("hex");
const digest = (s) => createHash("sha256").update(s).digest("hex");
const quote = (s) => "'" + String(s).replaceAll("'", "''") + "'";
let mongo, client, mf;
try {
  mongo = await MongoMemoryServer.create({
    binary: { version: values.version },
    instance: { ip: "127.0.0.1" },
  });
  const uri = mongo.getUri();
  assert(uri.startsWith("mongodb://127.0.0.1:"));
  await new Promise((ok, fail) => {
    const child = spawn(
      values.mongorestore || "mongorestore",
      [
        "--uri=" + uri,
        "--archive=" + archive,
        "--gzip",
        "--stopOnError",
        "--nsInclude=LAH_DB.resources",
        "--nsInclude=LAH_DB.users",
      ],
      { stdio: ["ignore", "ignore", "pipe"] },
    );
    // Do not print database-tool errors that might contain document values.
    child.stderr.resume();
    child.on("error", fail);
    child.on("exit", (code) =>
      code === 0
        ? ok()
        : fail(Error("Archive restore failed; no migration produced")),
    );
  });
  client = new MongoClient(uri);
  await client.connect();
  mf = await runtime();
  const db = await mf.getD1Database("DB");
  await schema(db);
  const statements = [],
    manifest = {
      createdAt: new Date().toISOString(),
      sourceArchive: archive,
      sourceSha256: sourceHash,
      mongoVersion: values.version,
      collections: {},
    };
  for (const collection of ["resources", "users"]) {
    const originals = await client
      .db("LAH_DB")
      .collection(collection)
      .find()
      .sort({ _id: 1 })
      .toArray();
    const records = [];
    for (const original of originals) {
      const canonical = BSON.EJSON.stringify(original, { relaxed: false });
      const doc = JSON.parse(JSON.stringify(original));
      assert.match(doc._id, /^[a-f0-9]{24}$/);
      await insertDocument(db, collection, doc);
      await db
        .prepare("INSERT INTO migration_source VALUES(?,?,?,?)")
        .bind(collection, doc._id, canonical, digest(canonical))
        .run();
      const restored = await db
        .prepare(`SELECT document FROM ${collection} WHERE id=?`)
        .bind(doc._id)
        .first();
      assert.deepEqual(JSON.parse(restored.document), doc);
      const saved = await db
        .prepare(
          "SELECT canonical_ejson FROM migration_source WHERE collection=? AND id=?",
        )
        .bind(collection, doc._id)
        .first();
      assert.equal(saved.canonical_ejson, canonical);
      records.push({
        id: doc._id,
        sourceSha256: digest(canonical),
        documentSha256: digest(JSON.stringify(doc)),
      });
      if (collection === "users")
        statements.push(
          `INSERT INTO users(id,oauth_id,email,role,document) VALUES(${[doc._id, doc.oauthId, doc.email, doc.role, JSON.stringify(doc)].map(quote).join(",")});`,
        );
      else
        statements.push(
          `INSERT INTO resources(id,document) VALUES(${[doc._id, JSON.stringify(doc)].map(quote).join(",")});`,
        );
      statements.push(
        `INSERT INTO migration_source VALUES(${[collection, doc._id, canonical, digest(canonical)].map(quote).join(",")});`,
      );
    }
    const count = await db
      .prepare(`SELECT count(*) AS n FROM ${collection}`)
      .first();
    assert.equal(count.n, originals.length);
    manifest.collections[collection] = { count: originals.length, records };
    console.log(
      `${collection}: ${originals.length} records compared field by field; original BSON retained`,
    );
  }
  assert.equal(
    (await db.prepare("SELECT count(*) AS n FROM sessions").first()).n,
    0,
  );
  manifest.sessions = 0;
  // Execute generated SQL into another fresh D1 database: verify the deliverable,
  // not just the parameterized conversion that created it.
  const verify = await runtime();
  try {
    const vdb = await verify.getD1Database("DB");
    await schema(vdb);
    for (let i = 0; i < statements.length; i += 50)
      await vdb.batch(statements.slice(i, i + 50).map((s) => vdb.prepare(s)));
    for (const [collection, entry] of Object.entries(manifest.collections)) {
      const rows = await vdb
        .prepare(`SELECT id,document FROM ${collection} ORDER BY id`)
        .all();
      assert.equal(rows.results.length, entry.count);
      for (const row of rows.results)
        assert.equal(
          digest(row.document),
          entry.records.find((r) => r.id === row.id).documentSha256,
        );
    }
  } finally {
    await verify.dispose();
  }
  const sql = statements.join("\n") + "\n";
  manifest.sqlSha256 = digest(sql);
  manifest.verification =
    "Full field comparison and generated SQL import into isolated D1 passed";
  await writeFile(join(output, "data.sql.partial"), sql, { mode: 0o600 });
  await rename(join(output, "data.sql.partial"), join(output, "data.sql"));
  await writeFile(
    join(output, "manifest.json"),
    JSON.stringify(manifest, null, 2) + "\n",
    { mode: 0o600 },
  );
  console.log("Verified migration saved to " + output);
} finally {
  if (client) await client.close();
  if (mongo) await mongo.stop();
  if (mf) await mf.dispose();
}
