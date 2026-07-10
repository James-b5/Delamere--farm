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

async function createBookingPublic(name, email, phone) {
  const res = await postJson('/api/bookings', {
    name,
    email,
    phone,
    bookingDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    numberOfPeople: 2,
    notes: 'Smoke test booking',
  });
  const data = await res.json();
  return { ok: res.ok, data };
}

async function getAdminBookings(token) {
  const res = await fetch(base + '/api/admin/bookings', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return await res.json();
}

async function patchAdminBookings(token, payload) {
  const res = await fetch(base + '/api/admin/bookings', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  return { ok: res.ok, data: await res.json() };
}

async function deleteAdminBookings(token, id) {
  const res = await fetch(base + '/api/admin/bookings', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ id }),
  });
  return { ok: res.ok, data: await res.json() };
}

async function createArticle(token, title) {
  const res = await fetch(base + '/api/moderator/articles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ title, excerpt: 'smoke', content: 'smoke content' }),
  });
  return { ok: res.ok, data: await res.json() };
}

async function uploadMedia(token) {
  // Create a tiny PNG binary (1x1 transparent) base64
  const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';
  const buffer = Buffer.from(pngBase64, 'base64');

  const form = new FormData();
  form.append('type', 'IMAGE');
  form.append('title', 'smoke-image');
  form.append('description', 'smoke upload');
  form.append('order', '1');
  form.append('file', new Blob([buffer], { type: 'image/png' }), 'smoke.png');

  const res = await fetch(base + '/api/admin/media', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  return { ok: res.ok, data: await res.json() };
}

(async () => {
  console.log('Extended smoke test starting');
  const modEmail = 'moderator@delamere.com';
  const modPassword = 'ModeratorPassword123!';
  let r = await login(modEmail, modPassword);
  if (!r.ok) { console.error('Moderator login failed', r.data); process.exit(1); }
  const modToken = r.data.token;
  console.log('Moderator logged in');

  // Create public booking
  r = await createBookingPublic('Smoke Tester', 'smoke@test.com', '+254700000000');
  if (!r.ok) { console.error('Create booking failed', r.data); process.exit(1); }
  console.log('Booking created:', r.data.bookingId);

  // Moderator fetch bookings
  const bookings = await getAdminBookings(modToken);
  console.log('Admin bookings count:', bookings.length || 0);
  const b = bookings.find(x => x.email === 'smoke@test.com');
  if (!b) { console.error('Booking not found in admin list'); process.exit(1); }
  console.log('Found booking id:', b.id);

  // Update booking status
  r = await patchAdminBookings(modToken, { id: b.id, status: 'CONFIRMED' });
  console.log('Update booking status:', r.ok, r.data?.status || r.data);

  // Delete booking
  r = await deleteAdminBookings(modToken, b.id);
  console.log('Delete booking:', r.ok, r.data);

  // Create article
  r = await createArticle(modToken, 'Smoke test article ' + Date.now());
  console.log('Create article:', r.ok, r.data?.id || r.data);

  // Upload media
  r = await uploadMedia(modToken);
  console.log('Upload media:', r.ok, r.data?.id || r.data);

  console.log('Extended smoke test complete');
})();
