import { Page, Locator } from '@playwright/test';
import { waitForPageOrSkip } from '../utils/botCheck';

/** The login page: /auth/login */
export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly emailError: Locator;
  readonly passwordError: Locator;
  readonly loginError: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByTestId('email');
    this.passwordInput = page.getByTestId('password');
    this.submitButton = page.getByTestId('login-submit');
    this.emailError = page.getByTestId('email-error');
    this.passwordError = page.getByTestId('password-error');
    this.loginError = page.getByTestId('login-error');
  }

  async open() {
    await this.page.goto('/auth/login');
    await waitForPageOrSkip(this.page, this.submitButton);
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.fillPassword(password);
    await this.submitButton.click();
  }

  /**
   * fill() writes the typed value into the HTML report ("Fill \"...\"").
   * For a password we set the value without logging it, then fire the same
   * input event a user's typing would fire, so the form sees the change.
   */
  async fillPassword(password: string) {
    await this.passwordInput.evaluate((el, value) => {
      const input = el as HTMLInputElement;
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }, password);
  }
}
