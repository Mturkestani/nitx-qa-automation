import { test, expect } from '../../fixtures/test';
import users from '../../test-data/users.json';

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open();
  });

  test('shows "required" errors when the form is sent empty', async ({ loginPage }) => {
    await loginPage.submitButton.click();

    await expect(loginPage.emailError).toHaveText('Email is required');
    await expect(loginPage.passwordError).toHaveText('Password is required');
  });

  // Data-driven: one test per invalid email in test-data/users.json
  for (const email of users.invalidEmails) {
    test(`rejects an invalid email format: "${email}"`, async ({ loginPage }) => {
      await loginPage.emailInput.fill(email);
      await loginPage.submitButton.click();

      await expect(loginPage.emailError).toHaveText('Email format is invalid');
    });
  }

  test('shows an error for an account that does not exist', async ({ loginPage, page }) => {
    await loginPage.login(users.unknownUser.email, users.unknownUser.password);

    await expect(loginPage.loginError).toContainText('Invalid email or password');
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('a customer can log in and sees their account @auth', async ({ loginPage, page }) => {
    const password = process.env[users.customer.passwordEnv];
    test.skip(!password, `Set ${users.customer.passwordEnv} in .env to run this test (see README).`);

    await loginPage.login(users.customer.email, password!);

    await expect(page).toHaveURL(/\/account/);
    await expect(page.getByTestId('page-title')).toHaveText('My account');
    await expect(page.getByTestId('nav-menu').filter({ visible: true })).toContainText(
      `${users.customer.firstName} ${users.customer.lastName}`,
    );
  });
});
