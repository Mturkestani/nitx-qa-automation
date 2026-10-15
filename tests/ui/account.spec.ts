import { test, expect } from '../../fixtures/test';
import users from '../../test-data/users.json';
import { waitForPageOrSkip } from '../../utils/botCheck';

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

    await expect(page).toHaveURL(/\/account/);
    await waitForPageOrSkip(page, page.getByTestId('page-title'));
    await expect(page.getByTestId('page-title')).toHaveText('My account');
    await expect(page.getByTestId('nav-menu').filter({ visible: true })).toContainText(
      `${users.customer.firstName} ${users.customer.lastName}`,
    );
  });
});
