// debug-selectors.js
// Run with: node debug-selectors.js
// This opens Amazon, searches, and prints ALL possible selectors found on the page

const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();

  // Stealth
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  });

  console.log('Navigating to Amazon...');
  await page.goto('https://www.amazon.com/s?k=iPhone+15', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(3000);

  console.log('\nPage title:', await page.title());
  console.log('URL:', page.url());

  // Test various selectors and report counts
  const selectors = [
    '[data-component-type="s-search-result"]',
    '.s-result-item[data-asin]',
    '.s-result-item[data-asin]:not([data-asin=""])',
    'h2 a.a-link-normal',
    '.a-link-normal.s-underline-text',
    '[data-cy="title-recipe"] a',
    '.s-title-instructions-style a',
    'a.a-text-normal',
    '[data-index] h2 a',
    '.sg-col-inner h2 a',
  ];

  console.log('\n--- SELECTOR COUNTS ---');
  for (const sel of selectors) {
    try {
      const count = await page.locator(sel).count();
      console.log(`  ${count.toString().padStart(3)}  ${sel}`);
    } catch(e) {
      console.log(`  ERR  ${sel}`);
    }
  }

  // Print first 3 product link hrefs found by any working selector
  console.log('\n--- FIRST PRODUCT LINKS ---');
  const links = page.locator('h2 a');
  const c = await links.count();
  for (let i = 0; i < Math.min(c, 3); i++) {
    const href = await links.nth(i).getAttribute('href').catch(() => 'N/A');
    const text = await links.nth(i).textContent().catch(() => 'N/A');
    console.log(`  [${i}] ${text?.trim().substring(0,60)} → ${href?.substring(0,60)}`);
  }

  await browser.close();
})();
