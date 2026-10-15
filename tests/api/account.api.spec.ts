import { test, expect } from '@playwright/test';
import users from '../../test-data/users.json';

// This test uses the real demo password (from .env or GitHub Secrets).
// No trace in this file: it would record the password in the request body.
test.use({ trace: 'off' });

test.describe('Users API with the demo account', () => {
  test('a customer can log in and read their own profile @auth', async ({ request }) => {
    const password = process.env[users.customer.passwordEnv];
    test.skip(!password, `Set ${users.customer.passwordEnv} in .env to run this test (see README).`);

    const login = await request.post('/users/login', {
      data: { email: users.customer.email, password },
    });
    expect(login.status()).toBe(200);
    const { access_token } = await login.json();
    expect(access_token).toBeTruthy();

    const me = await request.get('/users/me', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    expect(me.status()).toBe(200);
    expect(await me.json()).toMatchObject({
      email: users.customer.email,
      first_name: users.customer.firstName,
      last_name: users.customer.lastName,
    });
  });
});
