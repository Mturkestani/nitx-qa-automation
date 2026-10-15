import { test, expect } from '@playwright/test';
import users from '../../test-data/users.json';

test.describe('Users API', () => {
  test('POST /users/register with an empty body returns 422 and one message per missing field', async ({
    request,
  }) => {
    // Laravel validation: status 422, and a list of messages for each field that failed.
    // No account is created: the request is rejected before anything is saved.
    const response = await request.post('/users/register', { data: {} });

    expect(response.status()).toBe(422);
    const errors = await response.json();
    expect(errors).toMatchObject({
      first_name: ['The first name field is required.'],
      last_name: ['The last name field is required.'],
      email: ['The email field is required.'],
      password: ['The password field is required.'],
    });
  });

  test('POST /users/login with an empty body is refused', async ({ request }) => {
    const response = await request.post('/users/login', { data: {} });

    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({ error: 'Invalid login request' });
  });

  test('GET /users/me without a token is refused', async ({ request }) => {
    const response = await request.get('/users/me');

    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({ message: 'Unauthorized' });
  });

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
