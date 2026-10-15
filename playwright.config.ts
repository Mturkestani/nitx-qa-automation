import { defineConfig, devices } from '@playwright/test';
import { baseUrl, apiUrl } from './utils/urls';

// Load .env if it exists (Node 20.12+). Nothing breaks if the file is missing.
try {
  process.loadEnvFile();
} catch {
  // no .env file: use the defaults below
}

const BASE_URL = baseUrl();
const API_URL = apiUrl();
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: isCI,
  // The site is public and shared, so a network hiccup can happen. One retry in CI only.
  retries: isCI ? 1 : 0,
  // Keep the load on a free public site small.
  workers: isCI ? 2 : 3,
  reporter: isCI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: BASE_URL,
    testIdAttribute: 'data-test',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // UI tests run in three browser engines.
    { name: 'chromium', testDir: './tests/ui', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', testDir: './tests/ui', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', testDir: './tests/ui', use: { ...devices['Desktop Safari'] } },

    // API tests need no browser.
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: API_URL,
        extraHTTPHeaders: { Accept: 'application/json' },
      },
    },
  ],
});
