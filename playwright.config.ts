import { defineConfig, devices } from "@playwright/test";

const testPort = process.env.PLAYWRIGHT_TEST_PORT?.match(/^\d+$/)?.[0] ?? "3000";
const testBaseURL = `http://localhost:${testPort}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: testBaseURL,
    trace: "on-first-retry",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["iPhone 13"] } },
  ],
  webServer: {
    command: `npm run dev -- --hostname localhost --port ${testPort}`,
    env: { PLAYWRIGHT_TEST: "1" },
    url: testBaseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
