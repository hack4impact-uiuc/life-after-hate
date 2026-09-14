import {readFile} from 'node:fs/promises';
import {createClient} from '@libsql/client';
import {createHash} from 'node:crypto';
import {connect} from './client.mjs';
const file=process.argv[2];
if (!file) throw new Error('Pass the verified private data.sql path');
const schema=await readFile(new URL('../server/migrations/0001_initial.sql',import.meta.url),'utf8');
const local=createClient({url:':memory:'});
const remote=process.argv.includes('--local-check')?createClient({url:':memory:'}):connect();
const digest=v=>createHash('sha256').update(v).digest('hex');
try {
 await local.executeMultiple(schema);
 await local.executeMultiple(await readFile(file,'utf8'));
 if ((await remote.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")).rows.length)
  throw new Error('Destination must be empty; refusing to overwrite');
 const statements=schema.replace(/--[^\n]*/g,'').split(';').map(s=>s.trim()).filter(Boolean);
 const originals={};
 for (const table of ['users','resources']) {
  const rows=(await local.execute(`SELECT * FROM ${table} ORDER BY id`)).rows;
  originals[table]=rows;
  for (const row of rows) {
   const columns=table==='users'?['id','oauth_id','email','role','document']:['id','document'];
   statements.push({sql:`INSERT INTO ${table}(${columns.join(',')}) VALUES(${columns.map(()=>'?').join(',')})`,args:columns.map(k=>row[k])});
  }
 }
 await remote.batch(statements,'write');
 for (const table of ['users','resources']) {
  const rows=(await remote.execute(`SELECT id,document FROM ${table} ORDER BY id`)).rows;
  if(rows.length!==originals[table].length || rows.some((r,i)=>r.id!==originals[table][i].id || digest(r.document)!==digest(originals[table][i].document)))
   throw new Error('Post-import data verification failed');
  console.log(`${table}: ${rows.length} records, every document hash matches`);
 }
 console.log('No legacy sessions or duplicate provenance records imported. Original private backup retained.');
} catch {
 console.error('Migration failed; private SQL details suppressed. Verify destination state before retrying.');
 process.exitCode=1;
} finally {local.close();remote.close();}
