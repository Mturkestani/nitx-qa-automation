import { Page, Locator } from '@playwright/test';
import { waitForPageOrSkip } from '../utils/botCheck';

/** The home page: the product grid, search box and filters. */
export class ProductListPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly searchTerm: Locator;
  readonly productNames: Locator;
  readonly noResults: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.getByTestId('search-query');
    this.searchButton = page.getByTestId('search-submit');
    this.searchTerm = page.getByTestId('search-term');
    this.productNames = page.getByTestId('product-name');
    this.noResults = page.getByTestId('no-results');
  }

  /** Open the home page and wait for the first products to load. */
  async open() {
    await this.page.goto('/');
    // If we search before the first products arrive, they can arrive late
    // and replace the search results on the page.
    await waitForPageOrSkip(this.page, this.productNames.first());
  }

  /** Search, then wait until the page says the search is finished. */
  async search(term: string) {
    await this.searchInput.fill(term);
    await this.searchButton.click();
    // The grid sets data-test="search_completed" when the new results are shown.
    // Without this wait, a test can read the old products that were on the page before.
    await this.page.getByTestId('search_completed').waitFor();
  }

  async openProduct(name: string) {
    await this.productNames.filter({ hasText: name }).first().click();
  }
}
