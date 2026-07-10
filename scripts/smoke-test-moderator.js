const base = 'http://localhost:3000';

async function postJson(path, body, token) {
  const res = await fetch(base + path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  return res;
}

async function login(email, password) {
  const res = await postJson('/api/auth/login', { email, password });
  const data = await res.json();
  return { ok: res.ok, data };
}

async function register(name, email, password) {
  const res = await postJson('/api/auth/register', { name, email, password, confirmPassword: password });
  const data = await res.json();
  return { ok: res.ok, data };
}

async function createProduct(token) {
  const res = await fetch(base + '/api/admin/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name: 'Smoke Test Product', description: 'Test', price: 10, stock: 5 }),
  });
  const data = await res.json();
  return { ok: res.ok, data };
}

async function createOrder(token, productId) {
  const res = await fetch(base + '/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ items: [{ productId, quantity: 1, price: 10 }], shippingInfo: {} }),
  });
  const data = await res.json();
  return { ok: res.ok, data };
}

async function deleteOrderAs(token, orderId) {
  const res = await fetch(base + '/api/orders', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ orderId }),
  });
  const data = await res.json();
  return { ok: res.ok, data };
}

(async () => {
  console.log('Starting smoke test');

  // 1. Login as moderator
  const modEmail = 'moderator@delamere.com';
  const modPassword = 'ModeratorPassword123!';
  console.log('Logging in as moderator', modEmail);
  let r = await login(modEmail, modPassword);
  if (!r.ok) {
    console.error('Moderator login failed:', r.data);
    process.exit(1);
  }
  const modToken = r.data.token;
  console.log('Moderator token ok');

  // 2. Create product as moderator
  console.log('Creating product as moderator');
  r = await createProduct(modToken);
  if (!r.ok) {
    console.error('Create product failed:', r.data);
    process.exit(1);
  }
  const product = r.data;
  console.log('Product created:', product.id || product);

  // 3. Register a new user
  const ts = Date.now();
  const userEmail = `smokeuser+${ts}@example.com`;
  const userPass = 'TestPass123!';
  console.log('Registering user', userEmail);
  r = await register('Smoke User', userEmail, userPass);
  if (!r.ok) {
    console.error('Register failed:', r.data);
    process.exit(1);
  }
  const userToken = r.data.token;
  console.log('User registered and logged in');

  // 4. Create order as user
  console.log('Creating order as user');
  r = await createOrder(userToken, product.id);
  if (!r.ok) {
    console.error('Create order failed:', r.data);
    process.exit(1);
  }
  const order = r.data;
  console.log('Order created:', order.id);

  // 5. Delete order as owner
  console.log('Deleting order as owner');
  r = await deleteOrderAs(userToken, order.id);
  console.log('Owner delete response:', r.ok, r.data);

  // 6. Create another order to test moderator delete
  console.log('Creating second order as user');
  r = await createOrder(userToken, product.id);
  if (!r.ok) {
    console.error('Create second order failed:', r.data);
    process.exit(1);
  }
  const order2 = r.data;
  console.log('Second order created:', order2.id);

  // 7. Delete order as moderator
  console.log('Deleting order as moderator');
  r = await deleteOrderAs(modToken, order2.id);
  console.log('Moderator delete response:', r.ok, r.data);

  console.log('Smoke test complete');
})();
