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
});
