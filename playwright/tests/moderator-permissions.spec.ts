import { test, expect } from '@playwright/test';

test('moderator cannot see admin users through the users API', async ({ request }) => {
  const loginRes = await request.post('/api/auth/login', {
    form: {
      email: 'moderator@delamere.com',
      password: 'ModeratorPassword123!',
    },
  });

  expect(loginRes.ok()).toBeTruthy();
  const loginData = await loginRes.json();

  const usersRes = await request.get('/api/admin/users', {
    headers: {
      Authorization: `Bearer ${loginData.token}`,
    },
  });

  expect(usersRes.ok()).toBeTruthy();
  const users = await usersRes.json();
  const emails = users.map((user: { email: string }) => user.email);

  expect(emails).not.toContain('admin@example.com');
  expect(emails).not.toContain('admin@delamerefarm.co.ke');
  expect(emails).toContain('moderator@delamere.com');
});
