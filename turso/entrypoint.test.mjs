import { test } from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { createClient } from "@libsql/client";
import { createHash } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { database } from "./database.mjs";
import { schema, insertDocument } from "../server/scripts/runtime.mjs";

test(
  "Vercel fetch entry point receives PATCH JSON and completes account rejection",
  { timeout: 5000 },
  async (t) => {
    const dir = await mkdtemp(join(tmpdir(), "lah-entry-"));
    const url = pathToFileURL(join(dir, "test.db")).href;
    const client = createClient({ url });
    const originalOrigin = process.env.APP_ORIGIN;
    process.env.APP_ORIGIN = "https://lah.example";
    t.after(async () => {
      if (originalOrigin === undefined) delete process.env.APP_ORIGIN;
      else process.env.APP_ORIGIN = originalOrigin;
      client.close();
      await rm(dir, { recursive: true, force: true });
    });
    const db = database(client);
    await schema(db);
    for (const [key, role] of [
      ["a", "ADMIN"],
      ["b", "PENDING"],
    ]) {
      await insertDocument(db, "users", {
        _id: key.repeat(24),
        oauthId: key,
        email: `${key}@example.com`,
        role,
      });
    }
    const token = "a".repeat(64),
      csrf = "e".repeat(64);
    await db
      .prepare("INSERT INTO sessions VALUES(?,?,?,?,?)")
      .bind(
        createHash("sha256").update(token).digest("hex"),
        "a".repeat(24),
        csrf,
        Date.now(),
        Date.now(),
      )
      .run();
    // Exercise the actual deployment export with only the database connection
    // redirected to a synthetic local database.
    const output = await build({
      entryPoints: ["api/index.mjs"],
      bundle: true,
      platform: "node",
      format: "esm",
      write: false,
      external: ["file:*"],
      plugins: [
        {
          name: "local-test-database",
          setup(build) {
            build.onResolve({ filter: /turso\/dist\/handler\.mjs$/ }, () => ({
              path: resolve("turso/handler.ts"),
            }));
            build.onLoad({ filter: /turso\/client\.mjs$/ }, () => ({
              contents: `import { createClient } from ${JSON.stringify(import.meta.resolve("@libsql/client"))}; export function connect() { return createClient({url:${JSON.stringify(url)}}); }`,
              loader: "js",
            }));
          },
        },
      ],
    });
    const { default: entry } = await import(
      "data:text/javascript;base64," +
        Buffer.from(output.outputFiles[0].text).toString("base64")
    );
    const response = await entry.fetch(
      new Request("https://lah.example/api/users/" + "b".repeat(24), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: `__Host-lah.sid=${token}`,
          "X-CSRF-Token": csrf,
        },
        body: JSON.stringify({ role: "REJECTED", title: "" }),
      }),
    );
    assert.equal(response.status, 200);
    assert.equal((await response.json()).success, true);
    assert.equal(
      (
        await db
          .prepare("SELECT role FROM users WHERE id=?")
          .bind("b".repeat(24))
          .first()
      ).role,
      "REJECTED",
    );
  },
);
