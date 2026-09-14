import {build} from 'esbuild';
await build({entryPoints:['turso/handler.ts'],outfile:'turso/dist/handler.mjs',bundle:true,platform:'node',target:'node24',format:'esm',external:['@libsql/client']});
await build({entryPoints:['cloudflare/src/index.ts'],outfile:'cloudflare/dist/node-worker.mjs',bundle:true,platform:'node',target:'node24',format:'esm'});
