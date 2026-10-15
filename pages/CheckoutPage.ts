import { Page, Locator, expect } from '@playwright/test';
import { waitForPageOrSkip } from '../utils/botCheck';

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

  // The address form looks up the postal code by itself (see fillAddress).
  private lookupsInFlight = 0;
  private lastLookupActivity = 0;

  readonly cartIcon: Locator;

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

    const isLookup = (url: string) => url.includes('/postcode-lookup');
    page.on('request', (r) => {
      if (isLookup(r.url())) { this.lookupsInFlight++; this.lastLookupActivity = Date.now(); }
    });
    const done = (r: { url(): string }) => {
      if (isLookup(r.url())) { this.lookupsInFlight--; this.lastLookupActivity = Date.now(); }
    };
    page.on('requestfinished', done);
    page.on('requestfailed', done);

    this.cartIcon = page.getByTestId('nav-cart');
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

  /**
   * Open the cart the way a user does: click the cart icon in the header.
   * This stays inside the app (no full page load), and it is the real user path.
   */
  async open() {
    await this.cartIcon.click();
    await waitForPageOrSkip(this.page, this.proceedFromCart);
  }

  async continueAsGuest(guest: Guest) {
    await this.guestTab.click();
    await this.guestEmail.fill(guest.email);
    await this.guestFirstName.fill(guest.firstName);
    await this.guestLastName.fill(guest.lastName);
    await this.guestSubmit.click();
    await this.proceedAsGuest.click();
  }

  /**
   * After country, postal code and house number are entered, the form waits 300 ms
   * and calls /postcode-lookup (sometimes twice), then fills street, city and state
   * by itself. If we type first, the lookup can overwrite our values a moment later.
   * So: enter the three fields, wait until every lookup has finished and nothing new
   * has started for 0.5 s, then type our own street, city and state.
   */
  async fillAddress(address: Address) {
    await this.country.selectOption({ label: address.country });
    await this.postalCode.fill(address.postalCode);
    await this.houseNumber.fill(address.houseNumber);
    await this.waitForPostcodeLookup();
    await this.street.fill(address.street);
    await this.city.fill(address.city);
    await this.state.fill(address.state);
  }

  private async waitForPostcodeLookup() {
    await expect
      .poll(
        () => this.lastLookupActivity > 0 && this.lookupsInFlight === 0 && Date.now() - this.lastLookupActivity > 500,
        { message: 'The postcode lookup did not finish', timeout: 15_000 },
      )
      .toBe(true);
  }

  async payWith(method: string) {
    await this.paymentMethod.selectOption(method);
    await this.finishButton.click();
  }
}
