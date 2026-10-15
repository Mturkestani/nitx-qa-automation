import { Page, Locator } from '@playwright/test';

export type Guest = { email: string; firstName: string; lastName: string };
export type Address = {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  houseNumber: string;
};

/**
 * The checkout: /checkout. It has four steps on one page:
 * 1. Cart  2. Sign in (or continue as guest)  3. Billing address  4. Payment
 */
export class CheckoutPage {
  readonly page: Page;

  // Step 1: cart
  readonly cartProductTitles: Locator;
  readonly proceedFromCart: Locator;

  // Step 2: sign in or guest
  readonly guestTab: Locator;
  readonly guestEmail: Locator;
  readonly guestFirstName: Locator;
  readonly guestLastName: Locator;
  readonly guestSubmit: Locator;
  readonly proceedAsGuest: Locator;

  // Step 3: billing address
  readonly street: Locator;
  readonly city: Locator;
  readonly state: Locator;
  readonly country: Locator;
  readonly postalCode: Locator;
  readonly houseNumber: Locator;
  readonly proceedFromAddress: Locator;

  // Step 4: payment
  readonly paymentMethod: Locator;
  readonly finishButton: Locator;
  readonly paymentSuccess: Locator;

  constructor(page: Page) {
    this.page = page;

    this.cartProductTitles = page.getByTestId('product-title');
    this.proceedFromCart = page.getByTestId('proceed-1');

    this.guestTab = page.getByRole('tab', { name: /guest/i });
    this.guestEmail = page.getByTestId('guest-email');
    this.guestFirstName = page.getByTestId('guest-first-name');
    this.guestLastName = page.getByTestId('guest-last-name');
    this.guestSubmit = page.getByTestId('guest-submit');
    this.proceedAsGuest = page.getByTestId('proceed-2-guest');

    this.street = page.getByTestId('street');
    this.city = page.getByTestId('city');
    this.state = page.getByTestId('state');
    this.country = page.getByTestId('country');
    this.postalCode = page.getByTestId('postal_code');
    this.houseNumber = page.getByTestId('house_number');
    this.proceedFromAddress = page.getByTestId('proceed-3');

    this.paymentMethod = page.getByTestId('payment-method');
    this.finishButton = page.getByTestId('finish');
    this.paymentSuccess = page.getByTestId('payment-success-message');
  }

  async open() {
    await this.page.goto('/checkout');
  }

  async continueAsGuest(guest: Guest) {
    await this.guestTab.click();
    await this.guestEmail.fill(guest.email);
    await this.guestFirstName.fill(guest.firstName);
    await this.guestLastName.fill(guest.lastName);
    await this.guestSubmit.click();
    await this.proceedAsGuest.click();
  }

  async fillAddress(address: Address) {
    await this.country.selectOption({ label: address.country });
    await this.postalCode.fill(address.postalCode);
    await this.houseNumber.fill(address.houseNumber);
    await this.street.fill(address.street);
    await this.city.fill(address.city);
    await this.state.fill(address.state);
  }

  async payWith(method: string) {
    await this.paymentMethod.selectOption(method);
    await this.finishButton.click();
  }
}
