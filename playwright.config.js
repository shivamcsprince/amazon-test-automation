const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: 2,
  retries: 1,
  timeout: 120 * 1000,
  expect: { timeout: 20000 },

  reporter: [
    ['html', { outputFolder: 'reports/html-report', open: 'never' }],
    ['list'],
  ],

  use: {
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    trace: 'on-first-retry',
    viewport: { width: 1280, height: 800 },
    locale: 'en-US',
    timezoneId: 'America/New_York',

    // ── KEY FIX: headed mode + real Chrome channel ──────────────────────────
    headless: false,          // Run with visible browser (avoids bot detection)
    channel: 'chrome',        // Use your real installed Chrome, not Chromium

    launchOptions: {
      args: [
        '--disable-blink-features=AutomationControlled',
        '--no-sandbox',
        '--disable-infobars',
        '--start-maximized',
      ],
      slowMo: 100,            // Slight delay between actions = more human-like
    },
  },

  projects: [
    {
      name: 'chrome',
      use: {
        channel: 'chrome',
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
          'AppleWebKit/537.36 (KHTML, like Gecko) ' +
          'Chrome/124.0.0.0 Safari/537.36',
      },
    },
  ],

  outputDir: 'reports/test-artifacts',
});
