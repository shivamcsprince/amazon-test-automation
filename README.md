# 🛒 Amazon Test Automation

Automated end-to-end tests for Amazon.com built with **Playwright** + **JavaScript**.  
Tests run in **parallel** — TC1 (iPhone) and TC2 (Samsung Galaxy) execute simultaneously.

---

## 📋 Test Cases

| Test | Search | Action | Output |
|------|--------|--------|--------|
| TC1 | iPhone 15 | Add to Cart | Prints product name + price to console |
| TC2 | Samsung Galaxy S24 | Add to Cart | Prints product name + price to console |

---

## 🛠 Tech Stack

- [Playwright](https://playwright.dev/) — Browser automation
- JavaScript / Node.js — Language
- Page Object Model — Design pattern
- LambdaTest — Cloud execution (bonus)

---

## ✅ Prerequisites

- Node.js v18+ → https://nodejs.org
- Google Chrome installed

---

## 📦 Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/amazon-test-automation.git
cd amazon-test-automation

# 2. Install dependencies
npm install

# 3. Install Playwright Chrome browser
npx playwright install chrome
```

---

## ▶️ Running Tests

```bash
# Run both tests in parallel (recommended)
npm test

# Run with visible browser
npm run test:headed

# Run only TC1 - iPhone
npx playwright test --grep "TC1"

# Run only TC2 - Galaxy
npx playwright test --grep "TC2"

# View HTML report after run
npm run test:report
```

---

## ⚡ Parallel Execution

Both tests run simultaneously using Playwright workers:

```js
// playwright.config.js
fullyParallel: true,
workers: 2,
```

TC1 and TC2 each get their own browser instance — total time = max(TC1, TC2) instead of TC1 + TC2.

---

## 📁 Project Structure

```
amazon-test-automation/
├── tests/
│   └── amazon.spec.js        # TC1 + TC2 test cases
├── utils/
│   └── AmazonPage.js         # Page Object Model
├── playwright.config.js      # Parallel + browser config
├── lambdatest.config.js      # Cloud execution config
├── .env.example              # Environment variable template
└── README.md
```

---

## ☁️ LambdaTest Cloud (Bonus)

1. Sign up at https://www.lambdatest.com
2. Get credentials from **Profile → Account Settings → Security**
3. Create a `.env` file:

```env
LT_USERNAME=your_username
LT_ACCESS_KEY=your_access_key
```

4. Run on cloud:

```bash
npx playwright test --config=lambdatest.config.js
```

---

## 📊 Reports

```bash
npx playwright show-report reports/html-report
```

---

## 🏗 Architecture

**Page Object Model** — All Amazon selectors live in `utils/AmazonPage.js`.  
If Amazon updates its UI, only one file changes — not every test.

**Anti-bot Measures** — Headed Chrome with stealth flags and human-like typing delays to avoid detection.

**Resilient Selectors** — Multiple CSS selector fallbacks so tests survive minor Amazon UI updates.
