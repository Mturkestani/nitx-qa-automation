/**
 * The demo account is shared by everyone who uses this public practice site.
 * It locks after 3 wrong passwords, so other people's mistakes can lock it.
 * When that happens, the tests that use it are skipped with this reason,
 * so the report shows "not tested" instead of a false failure.
 */
export const ACCOUNT_LOCKED = /Account locked/i;

export const LOCKED_REASON =
  'The shared demo account is locked (too many failed logins on this public site, not by these tests). Not a test result.';
