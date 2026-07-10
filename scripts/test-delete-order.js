// Usage: node scripts/test-delete-order.js <email> <password> <orderId>
// Example: node scripts/test-delete-order.js admin@example.com hunter2 order_123

const [,, email, password, orderId] = process.argv;
if (!email || !password || !orderId) {
  console.error('Usage: node scripts/test-delete-order.js <email> <password> <orderId>');
  process.exit(1);
}

const base = process.env.BASE_URL || 'http://localhost:3000';

(async () => {
  try {
    // login
    const loginRes = await fetch(`${base}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ email, password }).toString(),
    });

    const loginJson = await loginRes.json();
    console.log('login status', loginRes.status, loginJson);
    if (!loginRes.ok) {
      console.error('Login failed');
      process.exit(2);
    }

    const token = loginJson.token;
    if (!token) {
      console.error('No token returned');
      process.exit(3);
    }

    // delete
    const delRes = await fetch(`${base}/api/admin/orders`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ orderId }),
    });

    const delJson = await delRes.json().catch(() => null);
    console.log('delete status', delRes.status, delJson);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(4);
  }
})();
