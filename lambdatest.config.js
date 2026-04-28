// lambdatest.config.js
// ─────────────────────────────────────────────────────────────────────────────
// LambdaTest Cloud Execution Configuration
//
// LambdaTest is a cloud testing platform where you can run tests on
// real browsers across 3000+ combinations of OS + Browser + Version
// without setting up anything locally.
//
// HOW TO USE:
//   1. Sign up at https://www.lambdatest.com
//   2. Get your Username and Access Key from:
//      https://accounts.lambdatest.com/security
//   3. Add them to your .env file:
//      LT_USERNAME=your_username
//      LT_ACCESS_KEY=your_access_key
//   4. Run: node lambdatest.config.js
// ─────────────────────────────────────────────────────────────────────────────

require('dotenv').config();

const LT_USERNAME   = process.env.LT_USERNAME   || 'YOUR_LT_USERNAME';
const LT_ACCESS_KEY = process.env.LT_ACCESS_KEY || 'YOUR_LT_ACCESS_KEY';

// ── LambdaTest Playwright Capabilities ───────────────────────────────────────
// These tell LambdaTest WHICH browser/OS combination to use
const ltCapabilities = {
  browserName: 'Chrome',
  browserVersion: 'latest',
  'LT:Options': {
    platform: 'Windows 11',
    build: 'Amazon Automation Build',        // Group of test runs
    name: 'Amazon iPhone & Galaxy Tests',    // Individual run name
    user: LT_USERNAME,
    accessKey: LT_ACCESS_KEY,
    network: true,       // Capture network logs
    video: true,         // Record video of the test
    console: true,       // Capture browser console
    tunnel: false,       // Set true for local/private URLs
    tunnelName: '',
    geoLocation: 'US',   // Run from US to access Amazon.com properly
  },
};

// ── LambdaTest Playwright Config ─────────────────────────────────────────────
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: 2,
  retries: 1,
  timeout: 90 * 1000,

  reporter: [
    ['html', { outputFolder: 'reports/lambdatest-report' }],
    ['list'],
  ],

  use: {
    // LambdaTest WebSocket CDP endpoint
    connectOptions: {
      wsEndpoint: `wss://cdp.lambdatest.com/playwright?capabilities=${encodeURIComponent(JSON.stringify(ltCapabilities))}`,
    },
    screenshot: 'on',
    video: 'on',
    trace: 'on',
  },

  projects: [
    {
      name: 'LambdaTest-Chrome',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});

// ── Usage Instructions ────────────────────────────────────────────────────────
console.log(`
╔═══════════════════════════════════════════════════╗
║         LambdaTest Configuration Ready            ║
╠═══════════════════════════════════════════════════╣
║  To run on LambdaTest cloud:                      ║
║                                                   ║
║  npx playwright test --config=lambdatest.config.js║
║                                                   ║
║  View results at:                                 ║
║  https://automation.lambdatest.com                ║
╚═══════════════════════════════════════════════════╝
`);
