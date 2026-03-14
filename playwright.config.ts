import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  retries: 1,
  use: {
    baseURL: "http://localhost:5173",
    headless: true,
    viewport: { width: 390, height: 844 },
  },
  webServer: {
    command: "npm run dev:client",
    port: 5173,
    reuseExistingServer: !process.env.CI,
  },
});
