class AmazonPage {
  constructor(page) {
    this.page = page;
    this.productTitle = page.locator('#productTitle');
    this.cartCount    = page.locator('#nav-cart-count');
  }

  async setupStealth() {
    await this.page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      Object.defineProperty(navigator, 'plugins',   { get: () => [1, 2, 3] });
      Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
      window.chrome = { runtime: {} };
    });
  }

  async goto() {
    console.log('  🌐  Navigating to Amazon.com...');
    await this.setupStealth();
    await this.page.goto('https://www.amazon.com', {
      waitUntil: 'domcontentloaded',
      timeout: 45000,
    });
    await this.page.waitForTimeout(2000);
    await this.dismissPopups();
    console.log('  ✅  Amazon loaded');
  }

  async searchFor(query) {
    console.log(`  🔍  Searching for: "${query}"`);
    const encoded = encodeURIComponent(query);
    await this.page.goto(`https://www.amazon.com/s?k=${encoded}`, {
      waitUntil: 'domcontentloaded',
      timeout: 45000,
    });
    await this.page.waitForTimeout(2500);
    try {
      await this.page.waitForSelector(
        '[data-component-type="s-search-result"], [data-cy="title-recipe"] a, .s-title-instructions-style a',
        { timeout: 30000 }
      );
    } catch {
      throw new Error('Search results did not load');
    }
    console.log('  ✅  Search results loaded');
  }

  async clickFirstProduct() {
    console.log('  🛒  Selecting first product from results...');

    // ── Collect ALL ASINs while still on search page ──────────────────────────
    let asins = [];
    try {
      const items = this.page.locator('[data-component-type="s-search-result"][data-asin]');
      const count = await items.count();
      for (let i = 0; i < Math.min(count, 8); i++) {
        const asin = await items.nth(i).getAttribute('data-asin');
        if (asin && asin.trim().length > 0) asins.push(asin.trim());
      }
      console.log(`  ℹ️   Collected ASINs: ${asins.join(', ')}`);
    } catch (e) {
      console.log(`  ⚠️   ASIN collection failed: ${e.message}`);
    }

    // ── Try each ASIN ─────────────────────────────────────────────────────────
    for (const asin of asins) {
      try {
        console.log(`  ℹ️   Trying: https://www.amazon.com/dp/${asin}`);
        await this.page.goto(`https://www.amazon.com/dp/${asin}`, {
          waitUntil: 'domcontentloaded',
          timeout: 30000,
        });
        await this.page.waitForTimeout(2500);

        // DEBUG: print what page we actually landed on
        const landedUrl   = this.page.url();
        const landedTitle = await this.page.title();
        console.log(`      → URL   : ${landedUrl.substring(0, 80)}`);
        console.log(`      → Title : ${landedTitle.substring(0, 80)}`);

        // Check for #productTitle (standard product page)
        const hasProductTitle = await this.page.locator('#productTitle').isVisible({ timeout: 5000 }).catch(() => false);
        if (hasProductTitle) {
          console.log('  ✅  Product page confirmed via #productTitle');
          return;
        }

        // Check for alternate product page indicators
        const hasAddToCart  = await this.page.locator('#add-to-cart-button').isVisible({ timeout: 2000 }).catch(() => false);
        const hasBuyNow     = await this.page.locator('#buy-now-button').isVisible({ timeout: 2000 }).catch(() => false);
        const hasPrice      = await this.page.locator('.a-price').isVisible({ timeout: 2000 }).catch(() => false);

        console.log(`      → #add-to-cart: ${hasAddToCart} | #buy-now: ${hasBuyNow} | .a-price: ${hasPrice}`);

        if (hasAddToCart || hasBuyNow || hasPrice) {
          console.log('  ✅  Product page confirmed via cart/price elements');
          return;
        }

        console.log(`      → Not a product page, trying next ASIN...`);
      } catch (e) {
        console.log(`  ⚠️   ASIN ${asin} error: ${e.message.substring(0, 60)}`);
        continue;
      }
    }

    throw new Error('Could not open any product detail page');
  }

  async getPrice() {
    console.log('  💰  Extracting product price...');
    const selectors = [
      '.a-price .a-offscreen',
      '#corePriceDisplay_desktop_feature_div .a-offscreen',
      '#price_inside_buybox',
      '#priceblock_ourprice',
      '.priceToPay .a-offscreen',
      '#corePrice_desktop .a-offscreen',
      '#apex_offerDisplay_desktop .a-price .a-offscreen',
    ];
    for (const sel of selectors) {
      try {
        const el = this.page.locator(sel).first();
        await el.waitFor({ state: 'attached', timeout: 4000 });
        const text = await el.textContent();
        if (text && (text.includes('$') || text.includes('₹') || text.includes('€'))) {
          console.log(`  ✅  Price: ${text.trim()}`);
          return text.trim();
        }
      } catch { /* try next */ }
    }
    return 'Price not available';
  }

  async addToCart() {
    console.log('  🛍️   Adding product to cart...');
    await this.handleVariantSelection();
    await this.page.waitForTimeout(800);

    const cartSelectors = [
      '#add-to-cart-button',
      'input[name="submit.add-to-cart"]',
      '#add-to-cart-button-ubb',
    ];

    for (const sel of cartSelectors) {
      try {
        const btn = this.page.locator(sel).first();
        if (await btn.isVisible({ timeout: 6000 })) {
          await btn.hover();
          await this.page.waitForTimeout(300);
          await btn.click();
          await this.page.waitForTimeout(2500);
          await this.dismissPostCartPopups();
          console.log('  ✅  Product added to cart');
          return;
        }
      } catch { /* try next */ }
    }

    try {
      const btn = this.page.getByRole('button', { name: /add to cart/i }).first();
      if (await btn.isVisible({ timeout: 3000 })) {
        await btn.click();
        await this.page.waitForTimeout(2500);
        await this.dismissPostCartPopups();
        console.log('  ✅  Product added to cart (role fallback)');
        return;
      }
    } catch { /* ok */ }

    console.log('  ⚠️   Add to Cart not found — price was logged successfully');
  }

  async handleVariantSelection() {
    try {
      const swatch = this.page.locator(
        '#variation_color_name li:not(.unselectable),' +
        '#variation_size_name li:not(.unselectable),' +
        '.twister li:not(.unselectable)'
      ).first();
      if (await swatch.isVisible({ timeout: 2000 })) {
        console.log('  ℹ️   Selecting first variant...');
        await swatch.click();
        await this.page.waitForTimeout(1200);
      }
    } catch { /* no variants */ }
  }

  async getCartCount() {
    try {
      await this.cartCount.waitFor({ state: 'visible', timeout: 5000 });
      return await this.cartCount.textContent();
    } catch { return 'unknown'; }
  }

  async getProductTitle() {
    try {
      await this.productTitle.waitFor({ state: 'visible', timeout: 10000 });
      const t = await this.productTitle.textContent();
      return t ? t.trim() : 'Title not found';
    } catch { return 'Title not found'; }
  }

  async dismissPopups() {
    for (const sel of ['#sp-cc-accept', 'input[data-action-type="DISMISS"]']) {
      try {
        const el = this.page.locator(sel).first();
        if (await el.isVisible({ timeout: 1500 })) await el.click();
      } catch { /* ok */ }
    }
  }

  async dismissPostCartPopups() {
    for (const sel of [
      'button:has-text("No thanks")',
      'input[value="No thanks"]',
      '#attachSiNoCoverage-announce',
      '.a-popover-closebutton',
    ]) {
      try {
        const el = this.page.locator(sel).first();
        if (await el.isVisible({ timeout: 2000 })) {
          await el.click();
          console.log('  ℹ️   Dismissed popup');
        }
      } catch { /* ok */ }
    }
  }
}

module.exports = { AmazonPage };
