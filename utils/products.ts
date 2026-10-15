import { APIRequestContext, expect } from '@playwright/test';
import { apiUrl } from './urls';

type Product = { name: string; in_stock: boolean; is_rental: boolean };

/**
 * The site resets its data often, and stock changes, so a fixed product name
 * can be out of stock on the day the tests run. Ask the API for a product
 * that can be bought right now.
 */
export async function findBuyableProduct(request: APIRequestContext): Promise<string> {
  const response = await request.get(`${apiUrl()}/products`, {
    params: { page: 1 },
    headers: { Accept: 'application/json' },
  });
  expect(response.ok()).toBeTruthy();
  const { data } = (await response.json()) as { data: Product[] };
  const product = data.find((p) => p.in_stock && !p.is_rental);
  expect(product, 'No product in stock on the first page').toBeTruthy();
  return product!.name;
}
