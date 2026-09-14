import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createClient} from '@libsql/client';
import {database} from './database.mjs';
test('failed audit batch rolls back the application mutation',async()=>{
 const client=createClient({url:':memory:'});
 try {
  const db=database(client);
  await db.prepare('CREATE TABLE records(id TEXT PRIMARY KEY)').run();
  await assert.rejects(db.batch([db.prepare('INSERT INTO records VALUES(?)').bind('sensitive'),db.prepare('INSERT INTO missing_audit_table VALUES(?)').bind('audit')]));
  assert.equal((await db.prepare('SELECT count(*) n FROM records').first()).n,0);
 } finally {client.close();}
});

import {applicationURL} from './request.mjs';
test('Vercel routing metadata does not reach search validation',()=>{
 const url=applicationURL('https://lah.vercel.app/api/resources/filter?radius=500&path=resources%2Ffilter');
 assert.equal(url.pathname,'/api/resources/filter');
 assert.equal(url.search,'?radius=500');
 const hostile=applicationURL('https://lah.vercel.app/api/resources/filter?unexpected=1&path=users');
 assert.equal(hostile.pathname,'/api/resources/filter');
 assert.equal(hostile.search,'?unexpected=1');
});
