import { defineConfig } from "@playwright/test";
export default defineConfig({
  workers: 1,
  testDir: "./e2e",
  use: {
    baseURL: "http://127.0.0.1:4174",
    browserName: "chromium",
    trace: "off",
    screenshot: "off",
    video: "off",
  },
  webServer: [
    {
      command: "node ../server/scripts/e2e.mjs",
      url: "http://127.0.0.1:4176",
      reuseExistingServer: false,
    },
    {
      command:
        "API_PROXY_TARGET=http://127.0.0.1:4176 vite preview --host 127.0.0.1 --port 4174 --outDir build-e2e",
      url: "http://127.0.0.1:4174",
      reuseExistingServer: false,
    },
  ],
});
