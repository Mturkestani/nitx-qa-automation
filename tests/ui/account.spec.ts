import { test, expect } from '../../fixtures/test';
import users from '../../test-data/users.json';
import { waitForPageOrSkip } from '../../utils/botCheck';
import { ACCOUNT_LOCKED, LOCKED_REASON } from '../../utils/demoAccount';

// These tests use the real demo password (from .env or GitHub Secrets).
// No trace or video in this file: they would record the password.
test.use({ trace: 'off', video: 'off' });

test.describe('Login with the demo account', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open();
  });

  test('a customer can log in and sees their account @auth', async ({ loginPage, page }) => {
    const password = process.env[users.customer.passwordEnv];
    test.skip(!password, `Set ${users.customer.passwordEnv} in .env to run this test (see README).`);

    await loginPage.login(users.customer.email, password!);

    // Wait for the account page, or for one of two things outside our control:
    // the shared account is locked, or Cloudflare's bot check appears.
    const locked = page.getByText(ACCOUNT_LOCKED);
    await waitForPageOrSkip(page, page.getByTestId('page-title').or(locked));
    test.skip(await locked.first().isVisible(), LOCKED_REASON);

    await expect(page).toHaveURL(/\/account/);
    await expect(page.getByTestId('page-title')).toHaveText('My account');
    await expect(page.getByTestId('nav-menu').filter({ visible: true })).toContainText(
      `${users.customer.firstName} ${users.customer.lastName}`,
    );
  });
});
