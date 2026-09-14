import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../../frontend/", import.meta.url));
const require = createRequire(new URL("../../frontend/package.json", import.meta.url));
const { build } = await import(require.resolve("vite"));
// Release assets never inherit local demo routing, geocoders or backend secrets.
await build({
  root,
  configFile: root + "vite.config.mjs",
  envDir: false,
  mode: "production",
  define: {
    "import.meta.env.VITE_API_URI": JSON.stringify("/api"),
    "import.meta.env.VITE_MAP_STYLE": JSON.stringify("https://tiles.openfreemap.org/styles/positron"),
    "import.meta.env.VITE_MAPBOX_ACCESS_TOKEN": JSON.stringify(""),
  },
});
// esbuild's executable is native; use its JS API for a portable Node 24 build.
const {build: bundle} = await import("esbuild");
await bundle({entryPoints:[fileURLToPath(new URL("../src/index.ts",import.meta.url))],bundle:true,format:"esm",platform:"browser",outfile:fileURLToPath(new URL("../dist/worker.js",import.meta.url))});
