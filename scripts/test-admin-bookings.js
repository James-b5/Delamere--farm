(async () => {
  const base = 'http://localhost:3000';
  const fetch = global.fetch;
  const resLogin = await fetch(base + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'moderator@delamere.com', password: 'ModeratorPassword123!' }) });
  const loginData = await resLogin.json();
  console.log('login status', resLogin.status, loginData);
  const token = loginData.token;
  const res = await fetch(base + '/api/admin/bookings', { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json();
  console.log('admin bookings status', res.status, data);
})();
