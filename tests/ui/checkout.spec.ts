import { test, expect } from '../../fixtures/test';
import checkout from '../../test-data/checkout.json';
import { findBuyableProduct } from '../../utils/products';

test.describe('Checkout as a guest', () => {
  let product: string;

  test.beforeEach(async ({ request, productListPage, productDetailPage }) => {
    // Start every test with one product in the cart.
    // The product is picked at run time, because stock on the site changes.
    product = await findBuyableProduct(request);
    await productListPage.open();
    await productListPage.search(product);
    await productListPage.openProduct(product);
    await expect(productDetailPage.name).toHaveText(product);
    await productDetailPage.addToCart();
    await expect(productDetailPage.cartQuantity).toHaveText('1');
  });

  test('a guest can buy a product from cart to payment', async ({ checkoutPage }) => {
    await checkoutPage.open();

    // Step 1: cart
    await expect(checkoutPage.cartProductTitles).toHaveCount(1);
    await expect(checkoutPage.cartProductTitles.first()).toContainText(product);
    await checkoutPage.proceedFromCart.click();

    // Step 2: continue as guest
    await checkoutPage.continueAsGuest(checkout.guest);

    // Step 3: billing address
    await checkoutPage.fillAddress(checkout.address);
    await expect(checkoutPage.proceedFromAddress).toBeEnabled();
    await checkoutPage.proceedFromAddress.click();

    // Step 4: payment
    await checkoutPage.payWith(checkout.paymentMethod);
    await expect(checkoutPage.paymentSuccess).toHaveText(checkout.successMessage);
  });

  test('cannot leave the address step while required fields are empty', async ({ checkoutPage }) => {
    await checkoutPage.open();
    await checkoutPage.proceedFromCart.click();
    await checkoutPage.continueAsGuest(checkout.guest);

    // Nothing filled in yet: the button must stay disabled.
    await expect(checkoutPage.proceedFromAddress).toBeDisabled();

    // Fill everything except the city: still disabled.
    await checkoutPage.fillAddress(checkout.address);
    await checkoutPage.city.clear();
    await expect(checkoutPage.proceedFromAddress).toBeDisabled();

    // Add the city back: now it is enabled.
    await checkoutPage.city.fill(checkout.address.city);
    await expect(checkoutPage.proceedFromAddress).toBeEnabled();
  });
});
