(async () => {
  const base = 'http://localhost:3000';
  const fetch = global.fetch;

  async function postJson(path, body, token) {
    const res = await fetch(base + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body),
    });
    return { status: res.status, body: await res.json() };
  }

  async function getJson(path, token) {
    const res = await fetch(base + path, { headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
    let text = await res.text();
    try { return { status: res.status, body: JSON.parse(text) }; } catch { return { status: res.status, body: text }; }
  }

  // login moderator
  const loginRes = await fetch(base + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'moderator@delamere.com', password: 'ModeratorPassword123!' }) });
  const loginData = await loginRes.json();
  console.log('login', loginRes.status, loginData.user?.role);
  const token = loginData.token;

  console.log('POST /api/bookings (public)');
  const create = await postJson('/api/bookings', { name: 'Debug Tester', email: 'debug@test.com', phone: '+254700000001', bookingDate: new Date(Date.now()+3600*1000).toISOString(), numberOfPeople: 3, notes: 'debug' });
  console.log('create', create.status, create.body);
  const bookingId = create.body?.bookingId;

  console.log('GET /api/admin/bookings (as moderator)');
  const list1 = await getJson('/api/admin/bookings', token);
  console.log('list1', list1.status, JSON.stringify(list1.body));

  if (!bookingId) { console.error('No bookingId returned; aborting'); process.exit(1); }

  console.log('PATCH /api/admin/bookings -> CONFIRMED');
  const patchRes = await fetch(base + '/api/admin/bookings', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ id: bookingId, status: 'CONFIRMED' }),
  });
  let patchBody;
  try { patchBody = await patchRes.json(); } catch { patchBody = await patchRes.text(); }
  console.log('patch', patchRes.status, patchBody);

  console.log('GET after patch');
  const list2 = await getJson('/api/admin/bookings', token);
  console.log('list2', list2.status, JSON.stringify(list2.body));

  console.log('DELETE /api/admin/bookings');
  const delRes = await fetch(base + '/api/admin/bookings', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ id: bookingId }),
  });
  let delBody;
  try { delBody = await delRes.json(); } catch { delBody = await delRes.text(); }
  console.log('delete', delRes.status, delBody);

  console.log('Final GET');
  const list3 = await getJson('/api/admin/bookings', token);
  console.log('list3', list3.status, JSON.stringify(list3.body));
})();
