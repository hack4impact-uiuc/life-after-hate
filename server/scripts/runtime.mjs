import {createClient} from '@libsql/client';
import {readFile} from 'node:fs/promises';
import {database} from '../../turso/database.mjs';
import app from '../dist/app.mjs';
export async function runtime(options={}) {
 const client=createClient({url:':memory:'});
 await client.execute('PRAGMA foreign_keys=ON');
 const DB=database(client);
 const previousFetch=globalThis.fetch;
 if(options.outboundService) globalThis.fetch=(url,init)=>options.outboundService(new Request(url,init));
 return {
  getDatabase:async()=>DB,
  dispatchFetch:(url,init)=>app.fetch(new Request(url,init),{DB,APP_ORIGIN:'http://localhost:8787',...options.bindings,CLIENT_IP:new Headers(init?.headers).get('x-test-client-ip')||'local'}),
  dispose:async()=>{client.close();globalThis.fetch=previousFetch;},
 };
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
