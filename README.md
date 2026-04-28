# 🛒 Amazon Test Automation

> Automated end-to-end tests for Amazon.com — search, cart, and price logging for iPhone and Samsung Galaxy devices. Built with **Playwright** + **JavaScript** with **parallel execution** support.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Test Cases](#test-cases)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Tests](#running-the-tests)
- [Parallel Execution](#parallel-execution)
- [LambdaTest Cloud Execution](#lambdatest-cloud-execution)
- [Reports](#reports)
- [Architecture Decisions](#architecture-decisions)

---

## 🎯 Project Overview

This project automates the following user flows on Amazon.com:

| Test | Search Term | Action | Expected Output |
|------|-------------|--------|-----------------|
| TC1  | iPhone 15   | Add to Cart | Print product name + price to console |
| TC2  | Samsung Galaxy S24 | Add to Cart | Print product name + price to console |

Both tests run **simultaneously** using Playwright's parallel workers.

---

## 🛠 Tech Stack

| Tool | Purpose |
|------|---------|
| [Playwright](https://playwright.dev/) | Browser automation framework |
| JavaScript (Node.js) | Programming language |
| Page Object Model | Design pattern for clean, maintainable tests |
| dotenv | Environment variable management |
| LambdaTest | Cloud cross-browser testing (bonus) |

**Why Playwright over Selenium/Cypress?**
- Built-in parallel execution with no extra plugins
- Auto-waiting (no manual `sleep()` calls)
- Works with Chromium, Firefox, and WebKit out of the box
- Faster and more reliable than Selenium for modern web apps

---

## 📁 Project Structure

```
amazon-test-automation/
│
├── tests/
│   └── amazon.spec.js          # Main test file (TC1 + TC2)
│
├── utils/
│   └── AmazonPage.js           # Page Object Model for Amazon
│
├── reports/                    # Auto-generated after test run
│   ├── html-report/
│   └── results.json
│
├── playwright.config.js        # Playwright + parallel config
├── lambdatest.config.js        # LambdaTest cloud config
├── package.json
├── .env.example                # Template for environment variables
├── .gitignore
└── README.md
```

---

## 🧪 Test Cases

### Test Case 1 — iPhone

```
1. Open https://www.amazon.com
2. Search for "iPhone 15"
3. Click the first search result
4. Extract and print the price to console
5. Click "Add to Cart"
6. Verify cart count updated
```

### Test Case 2 — Samsung Galaxy

```
1. Open https://www.amazon.com
2. Search for "Samsung Galaxy S24"
3. Click the first search result
4. Extract and print the price to console
5. Click "Add to Cart"
6. Verify cart count updated
```

---

## ✅ Prerequisites

Make sure you have the following installed:

```bash
node --version    # v18.0.0 or higher
npm --version     # v8.0.0 or higher
```

Download Node.js from: https://nodejs.org

---

## 📦 Installation

### Step 1 — Clone the repository

```bash
git clone https://github.com/shivamcsprince/amazon-test-automation.git
cd amazon-test-automation
```

### Step 2 — Install dependencies

```bash
npm install
```

### Step 3 — Install Playwright browsers

```bash
npx playwright install chromium
```

### Step 4 — Set up environment variables (optional, for LambdaTest)

```bash
cp .env.example .env
# Edit .env with your LambdaTest credentials
```

---

## ▶️ Running the Tests

### Run all tests (parallel by default)

```bash
npm test
```

### Run with browser visible (headed mode — great for demos)

```bash
npm run test:headed
```

### Run a specific test case

```bash
# Run only TC1 (iPhone)
npx playwright test --grep "TC1"

# Run only TC2 (Galaxy)
npx playwright test --grep "TC2"
```

### Run with detailed console output

```bash
npx playwright test --reporter=list
```

---

## ⚡ Parallel Execution

Parallel execution is configured in `playwright.config.js`:

```js
fullyParallel: true,   // Each test runs in its own worker
workers: 2,            // 2 workers = TC1 and TC2 run simultaneously
```

**How it works:**
- Playwright spawns 2 browser instances at the same time
- TC1 (iPhone) and TC2 (Galaxy) run in separate browser contexts
- They don't share state — each gets a fresh browser session
- Total time ≈ max(TC1 time, TC2 time) instead of TC1 + TC2

```bash
# Explicitly run with 2 parallel workers
npm run test:parallel
```

---

## ☁️ LambdaTest Cloud Execution

[LambdaTest](https://www.lambdatest.com) lets you run tests on real cloud browsers without local setup.

### Setup

1. Sign up at https://www.lambdatest.com (free tier available)
2. Go to **Profile → Account Settings → Password & Security**
3. Copy your **Username** and **Access Key**
4. Add them to your `.env` file:

```env
LT_USERNAME=your_username
LT_ACCESS_KEY=your_access_key
```

### Run on LambdaTest

```bash
npx playwright test --config=lambdatest.config.js
```

### View Results

After running, go to:
**https://automation.lambdatest.com/build**

You'll see:
- ✅ Pass/Fail status
- 🎥 Video recording of each test
- 📸 Screenshots at each step
- 🌐 Network logs

---

## 📊 Reports

After running tests, open the HTML report:

```bash
npm run test:report
```

This opens a beautiful interactive report in your browser showing:
- Test pass/fail status
- Execution time
- Screenshots on failure
- Step-by-step traces

---

## 🏗 Architecture Decisions

### Page Object Model (POM)
All Amazon selectors live in `utils/AmazonPage.js`. If Amazon updates its UI, you only change one file — not every test.

### Multiple Price Selectors
Amazon renders prices differently based on:
- Whether you're logged in
- Prime membership
- Product type (new vs used vs marketplace)

The `getPrice()` method tries 4 different selector strategies and returns the first one that works.

### Resilient Selectors
Tests use multiple CSS selector fallbacks:
```js
// Instead of one fragile selector:
page.locator('#addToCart')  // ❌ breaks if ID changes

// We use priority fallbacks:
page.locator('#add-to-cart-button, [data-feature-id="add-to-cart"]')  // ✅
```

### Popup Handling
Amazon shows various popups (warranty offers, sign-in prompts, location requests). The `dismissPopups()` and `dismissPostCartPopups()` methods handle these gracefully so tests don't fail unexpectedly.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-test`
3. Commit changes: `git commit -m 'Add new test case'`
4. Push: `git push origin feature/new-test`
5. Open a Pull Request

---

## 📝 License

MIT License — feel free to use this for learning or interviews!
