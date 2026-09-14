import {build} from 'esbuild';
await build({entryPoints:['turso/handler.ts'],outfile:'turso/dist/handler.mjs',bundle:true,platform:'node',target:'node24',format:'esm',external:['@libsql/client']});
await build({entryPoints:['server/src/index.ts'],outfile:'server/dist/app.mjs',bundle:true,platform:'node',target:'node24',format:'esm'});
