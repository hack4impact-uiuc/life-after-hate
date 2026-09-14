import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig(({ mode }) => ({
  define:
    mode === "e2e"
      ? {
          "import.meta.env.VITE_MAPBOX_ACCESS_TOKEN": JSON.stringify("pk.test"),
        }
      : {},
  plugins: [react()],
  build: {
    assetsInlineLimit: (path) => (/\.woff2?$/.test(path) ? false : undefined),
    outDir: mode === "e2e" ? "build-e2e" : "build",
    sourcemap: false,
  },
  server: {
    proxy: {
      "/api": {
        target: process.env.API_PROXY_TARGET || "http://127.0.0.1:5000",
        changeOrigin: false,
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    coverage: {
      provider: "v8",
      include: ["src/**/*.{js,jsx}"],
      exclude: ["src/**/*.test.{js,jsx}"],
      reporter: ["text", "html", "json-summary"],
      thresholds: {
        lines: 88,
        statements: 88,
        branches: 82,
        functions: 80,
        "src/pages/{AdminView,DirectoryView,MapView}/index.jsx": {
          lines: 100,
          statements: 100,
          functions: 100,
          branches: 90,
        },
        "src/components/Modal/{ResourceModal,UserModal}/index.jsx": {
          lines: 95,
          statements: 95,
          functions: 90,
          branches: 90,
        },
        "src/redux/{reducers,selectors}/**/*.js": {
          lines: 100,
          statements: 100,
          functions: 100,
          branches: 100,
        },
        "src/utils/*.js": {
          lines: 100,
          statements: 100,
          functions: 100,
          branches: 80,
        },
        "src/components/SessionGuard/index.jsx": {
          lines: 100,
          statements: 100,
          functions: 100,
          branches: 100,
        },
      },
    },
    include: ["src/**/*.test.{js,jsx}"],
  },
}));
