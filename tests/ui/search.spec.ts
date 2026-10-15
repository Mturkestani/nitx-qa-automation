import { test, expect } from '../../fixtures/test';
import search from '../../test-data/search.json';

test.describe('Product search', () => {
  test.beforeEach(async ({ productListPage }) => {
    await productListPage.open();
  });

  for (const term of search.knownTerms) {
    test(`every result matches the search term "${term}"`, async ({ productListPage }) => {
      await productListPage.search(term);

      await expect(productListPage.searchTerm).toHaveText(term);
      const names = await productListPage.productNames.allInnerTexts();
      expect(names.length).toBeGreaterThan(0);
      for (const name of names) {
        expect(name.toLowerCase()).toContain(term.toLowerCase());
      }
    });
  }

  test('shows a clear message when nothing matches', async ({ productListPage }) => {
    await productListPage.search(search.noResultTerm);

    await expect(productListPage.noResults).toHaveText('There are no products found.');
    await expect(productListPage.productNames).toHaveCount(0);
  });
});
