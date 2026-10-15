import { test, Page, Locator } from '@playwright/test';

/**
 * The site is behind Cloudflare. From some machines (for example GitHub's servers),
 * a full page load can show "Verify you are human" instead of the page.
 * We never try to get past that check. If it appears, the test is skipped with a
 * clear reason, so the report shows "not tested" instead of a false failure.
 */
export function botCheck(page: Page): Locator {
  return page.getByText(/Verify you are human|Performing security verification/i);
}

/** Wait until the page is ready, or skip the test if the bot check appears instead. */
export async function waitForPageOrSkip(page: Page, ready: Locator) {
  const check = botCheck(page);
  await ready.or(check).first().waitFor();
  if (await check.first().isVisible()) {
    test.skip(true, 'Blocked by the site\'s bot protection (Cloudflare) on this machine. Not a test result.');
  }
}
