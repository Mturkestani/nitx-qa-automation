import { Page, Locator } from '@playwright/test';

/** One product's page: /product/{id} */
export class ProductDetailPage {
  readonly page: Page;
  readonly name: Locator;
  readonly unitPrice: Locator;
  readonly addToCartButton: Locator;
  readonly cartQuantity: Locator;

  constructor(page: Page) {
    this.page = page;
    this.name = page.getByTestId('product-name');
    this.unitPrice = page.getByTestId('unit-price');
    this.addToCartButton = page.getByTestId('add-to-cart');
    this.cartQuantity = page.getByTestId('cart-quantity');
  }

  async addToCart() {
    await this.addToCartButton.click();
  }
}
