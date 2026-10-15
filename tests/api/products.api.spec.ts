import { test, expect } from '@playwright/test';
import search from '../../test-data/search.json';

test.describe('Products API', () => {
  test('GET /products returns the first page with valid products', async ({ request }) => {
    const response = await request.get('/products', { params: { page: 1 } });

    expect(response.status()).toBe(200);
    const body = await response.json();

    // Pagination fields (Laravel's standard paginator)
    expect(body.current_page).toBe(1);
    expect(body.per_page).toBeGreaterThan(0);
    expect(body.total).toBeGreaterThan(0);
    expect(body.data.length).toBeLessThanOrEqual(body.per_page);

    // Each product has the fields the shop needs, with sensible values
    for (const product of body.data) {
      expect(product).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          price: expect.any(Number),
          in_stock: expect.any(Boolean),
        }),
      );
      expect(product.price).toBeGreaterThan(0);
    }
  });

  for (const term of search.knownTerms) {
    test(`GET /products/search?q=${term} returns only matching products`, async ({ request }) => {
      const response = await request.get('/products/search', { params: { q: term } });

      expect(response.status()).toBe(200);
      const { data } = await response.json();
      expect(data.length).toBeGreaterThan(0);
      for (const product of data) {
        expect(product.name.toLowerCase()).toContain(term);
      }
    });
  }

  test('GET /products/{id} returns the same product as the list', async ({ request }) => {
    const list = await (await request.get('/products')).json();
    const first = list.data[0];

    const response = await request.get(`/products/${first.id}`);

    expect(response.status()).toBe(200);
    const product = await response.json();
    expect(product.id).toBe(first.id);
    expect(product.name).toBe(first.name);
    expect(product.price).toBe(first.price);
  });

  test('GET /products/{id} returns 404 for an unknown id', async ({ request }) => {
    const response = await request.get('/products/00000000000000000000000000');

    expect(response.status()).toBe(404);
    expect(await response.json()).toEqual({ message: 'Requested item not found' });
  });
});
