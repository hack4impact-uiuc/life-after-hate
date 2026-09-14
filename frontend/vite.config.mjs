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
  build: { assetsInlineLimit: (path) => /\.woff2?$/.test(path) ? false : undefined, outDir: mode === "e2e" ? "build-e2e" : "build", sourcemap: false },
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
    include: ["src/**/*.test.{js,jsx}"],
  },
}));
