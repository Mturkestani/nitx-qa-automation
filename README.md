# Nitx QA: Test Automation (Section 08)

End-to-end UI tests and API tests written with **Playwright** and **TypeScript**.

They run against [Practice Software Testing](https://practicesoftwaretesting.com), a public demo shop made for testing practice. I chose it because its backend is a **Laravel REST API**, so the API tests check real Laravel behaviour, such as `422` validation errors.

This repository is the Section 08 answer for all three Nitx tests (Studio, Signage and Reach).

## What is tested

| Area | Test | Type |
| --- | --- | --- |
| Login (UI) | Sending the empty form shows "Email is required" and "Password is required" | Negative |
| Login (UI) | Four invalid email formats are rejected (data-driven) | Negative / boundary |
| Login (UI) | An unknown account gets "Invalid email or password" | Negative |
| Login (UI) | A customer logs in and sees "My account" with their name `@auth` | Positive |
| Search (UI) | Every result matches the search term, for three terms (data-driven) | Positive |
| Search (UI) | A term with no match shows "There are no products found." | Negative |
| Checkout (UI) | A guest buys a product: cart, guest details, billing address, payment, "Payment was successful" | End-to-end |
| Checkout (UI) | The address step stays blocked while a required field is empty | Validation |
| Products (API) | `GET /products`: pagination fields and valid product fields | Positive |
| Products (API) | `GET /products/search`: only matching products, for three terms | Positive |
| Products (API) | `GET /products/{id}`: same data as the list | Positive |
| Products (API) | `GET /products/{id}` with an unknown id: `404` | Negative |
| Users (API) | `POST /users/register` with an empty body: `422` with one message per missing field | Negative |
| Users (API) | `POST /users/login` with an empty body: `401` | Negative |
| Users (API) | `GET /users/me` without a token: `401` | Negative |
| Users (API) | A customer logs in and reads their own profile `@auth` | Positive |

UI tests run in **Chromium, Firefox and WebKit** (Safari's engine). In total: 13 UI tests × 3 browsers + 10 API tests = 49 test runs.

## Project structure

```
├── pages/                     Page objects: one class per page, holding its locators and actions
│   ├── LoginPage.ts
│   ├── ProductListPage.ts     home page: product grid and search
│   ├── ProductDetailPage.ts
│   └── CheckoutPage.ts        the 4 checkout steps
├── fixtures/
│   └── test.ts                our `test`: Playwright's test plus ready-made page objects
├── utils/
│   ├── botCheck.ts            skips a test if the site's bot check (Cloudflare) appears
│   ├── products.ts            finds a product that is in stock right now (through the API)
│   └── urls.ts                the site and API addresses, in one place
├── test-data/                 test data, kept out of the test code
│   ├── users.json
│   ├── search.json
│   └── checkout.json
├── tests/
│   ├── ui/                    browser tests
│   └── api/                   API tests (no browser)
├── playwright.config.ts       browsers, base URLs, retries, reports
├── .env.example               settings you can copy to .env
└── .github/workflows/
    └── playwright.yml         runs every test on every push
```

**How the parts fit together:** a test asks for a page object (for example `loginPage`). The page object knows *where* things are on the page. The test only says *what* the user does and *what* should happen. The data comes from `test-data/`. If the site changes a button, only the page object changes, not the tests.

## Install and run

You need **Node.js 20.12 or newer** and Git.

```bash
git clone https://github.com/Mturkestani/nitx-qa-automation.git
cd nitx-qa-automation
npm ci
npx playwright install --with-deps
npx playwright test
```

Open the HTML report after a run:

```bash
npx playwright show-report
```

Other commands:

| Command | What it runs |
| --- | --- |
| `npm test` | everything |
| `npm run test:ui` | UI tests in the three browsers |
| `npm run test:api` | API tests only |
| `npm run test:chromium` | UI tests in Chromium, plus API tests (fastest full check) |
| `npx playwright test --ui` | Playwright's interactive mode |

### Tests that need a password (`@auth`)

Two tests log in with the site's public demo account `customer@practicesoftwaretesting.com`: `tests/ui/account.spec.ts` and `tests/api/account.api.spec.ts`. The password is listed in the [site's README](https://github.com/testsmith-io/practice-software-testing).

To keep passwords out of the code, these tests read it from an environment variable:

```bash
cp .env.example .env
# then set CUSTOMER_PASSWORD in .env
```

Without it, the two tests are **skipped** with a clear message, and everything else still runs. On GitHub, add `CUSTOMER_PASSWORD` under *Settings › Secrets and variables › Actions*.

## Continuous integration

`.github/workflows/playwright.yml` runs on every push and pull request, and can be started by hand. It runs four jobs in parallel: `chromium`, `firefox`, `webkit` and `api`. Each job checks the TypeScript types, runs its tests, and uploads its HTML report as an artifact (kept 14 days).

## Design choices

- **Stable locators.** The site gives its elements `data-test` attributes. The config makes them the default for `getByTestId()`, so the tests do not depend on CSS classes or layout.
- **No fixed waits.** There is no `waitForTimeout`. Assertions wait by themselves. Where the page needs time, the page object waits for a real signal: after a search, the grid sets `data-test="search_completed"`, and `ProductListPage.search()` waits for it. Without this, a test could read the products that were on the page before the search.
- **No fixed product.** The site resets its data often, and stock changes. Checkout tests ask the API for a product that is in stock, then find it in the shop by its exact name.
- **Each test is independent.** Every checkout test fills its own cart, so tests can run in any order and in parallel.
- **The real user path.** Checkout tests open the cart with the cart icon in the header, as a user does, instead of loading `/checkout` directly.
- **Honest results when the site blocks us.** The site is behind Cloudflare. From some machines (for example GitHub's servers), a page load can show "Verify you are human" instead of the page. The tests never try to get past that check: the test is **skipped** with the reason "Blocked by the site's bot protection", so the report shows "not tested" instead of a false pass or a false failure.
- **The password never reaches the reports.** `fill()` writes the typed value into the HTML report, so `LoginPage.fillPassword()` sets the password without logging it. The two files that use the password turn off trace and video, which would record it.
- **No accounts are created.** The register test sends an empty body, which the API rejects before saving anything.
- **Careful with a shared public site.** Two workers in CI, one retry in CI only (for network hiccups), and a trace, screenshot and video when a test fails.

## Limits

- The site is public and shared. Its products or texts can change, and it can be slow or down. A failure is not always a bug in the tests: check the report first.
- Cloudflare's bot check can appear on CI machines. Affected tests are skipped, not passed. Check the skipped count in the report.
- Not covered: registration of a new account (it would create real accounts on a shared site), logged-in checkout, payment methods other than cash on delivery, and the admin area.
