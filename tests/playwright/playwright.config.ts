import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/playwright',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['github'], ['html']] : 'list',

  use: {
    baseURL: process.env.PREVIEW_URL || 'http://127.0.0.1:9292',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'chromium-mobile',  use: { ...devices['Pixel 7'] } },
    { name: 'webkit-mobile',    use: { ...devices['iPhone 14'] } },
  ],

  webServer: process.env.CI
    ? undefined
    : {
        command: 'shopify theme dev --store $SHOPIFY_FLAG_STORE',
        url: 'http://127.0.0.1:9292',
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
