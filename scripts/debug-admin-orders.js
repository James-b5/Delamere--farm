const fetch = globalThis.fetch || require('node-fetch');
const base = 'http://localhost:3000';
const email = 'desmo48023@gmail.com';
const pass = 'AdminPassword123!';

(async () => {
  try {
    const login = await fetch(`${base}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ email, password: pass }).toString(),
    });
    const loginJson = await login.json();
    console.log('login', login.status, JSON.stringify(loginJson));
    if (!login.ok) return;
    const token = loginJson.token;

    const orders = await fetch(`${base}/api/admin/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const ordersJson = await orders.json();
    console.log('orders', orders.status, JSON.stringify(ordersJson));
  } catch (e) {
    console.error(e);
  }
})();
