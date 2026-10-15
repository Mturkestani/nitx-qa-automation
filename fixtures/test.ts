import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ProductListPage } from '../pages/ProductListPage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { CheckoutPage } from '../pages/CheckoutPage';

type Pages = {
  loginPage: LoginPage;
  productListPage: ProductListPage;
  productDetailPage: ProductDetailPage;
  checkoutPage: CheckoutPage;
};

/**
 * Our own `test`: the same as Playwright's, plus ready-made page objects.
 * A test asks for what it needs, for example `async ({ loginPage }) => ...`,
 * and gets a new object for its own browser page.
 */
export const test = base.extend<Pages>({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  productListPage: async ({ page }, use) => use(new ProductListPage(page)),
  productDetailPage: async ({ page }, use) => use(new ProductDetailPage(page)),
  checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),
});

export { expect } from '@playwright/test';
