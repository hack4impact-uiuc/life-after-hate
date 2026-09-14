import {build} from '../frontend/node_modules/vite/dist/node/index.js';
await build({root:'frontend',configFile:'frontend/vite.config.mjs',envDir:false,define:{
 'import.meta.env.VITE_API_URI':JSON.stringify('/api'),
 'import.meta.env.VITE_MAP_STYLE':JSON.stringify('https://tiles.openfreemap.org/styles/positron'),
 'import.meta.env.VITE_MAPBOX_ACCESS_TOKEN':JSON.stringify(''),
}});
