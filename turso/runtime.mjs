import {createClient} from '@libsql/client';
import {database} from './database.mjs';
import worker from '../cloudflare/dist/node-worker.mjs';
export {schema,insertDocument} from '../cloudflare/scripts/runtime.mjs';
export async function runtime() {
 const client=createClient({url:':memory:'});
 await client.execute('PRAGMA foreign_keys=ON');
 const DB=database(client);
 return {
  getD1Database:async()=>DB,
  dispatchFetch:(url,init)=>worker.fetch(new Request(url,init),{DB,APP_ORIGIN:'http://localhost:8787'}),
  dispose:async()=>client.close(),
 };
}
