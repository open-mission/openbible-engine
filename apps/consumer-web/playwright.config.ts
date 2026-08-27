import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: true,
  reporter: "line",
  use: {
    baseURL: "http://127.0.0.1:3104",
    trace: "on-first-retry",
  },
  webServer: {
    command: "pnpm start -p 3104",
    url: "http://127.0.0.1:3104",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
});
