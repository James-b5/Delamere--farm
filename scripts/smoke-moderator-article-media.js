(async () => {
  const base = 'http://localhost:3000';
  const fetch = global.fetch;

  async function postJson(path, body, token) {
    const res = await fetch(base + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body),
    });
    return res;
  }

  async function login(email, password) {
    const res = await postJson('/api/auth/login', { email, password });
    return await res.json();
  }

  async function createArticle(token, title) {
    const res = await fetch(base + '/api/moderator/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title, excerpt: 'smoke', content: 'smoke content' }),
    });
    return { status: res.status, data: await res.json() };
  }

  async function uploadMedia(token) {
    const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';
    const buffer = Buffer.from(pngBase64, 'base64');
    const form = new FormData();
    form.append('type', 'IMAGE');
    form.append('title', 'smoke-image');
    form.append('description', 'smoke upload');
    form.append('order', '1');
    // Node's FormData needs Blob polyfill; using fetch in Node v18 supports Blob
    form.append('file', new Blob([buffer], { type: 'image/png' }), 'smoke.png');

    const res = await fetch(base + '/api/admin/media', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    return { status: res.status, data: await res.json() };
  }

  try {
    console.log('Logging in as moderator...');
    const loginRes = await login('moderator@delamere.com', 'ModeratorPassword123!');
    if (!loginRes?.token) { console.error('Login failed', loginRes); process.exit(1); }
    const token = loginRes.token;
    console.log('Logged in, token length:', token.length);

    console.log('Creating article...');
    const articleRes = await createArticle(token, 'Smoke article ' + Date.now());
    console.log('Article response:', articleRes.status, articleRes.data);

    console.log('Uploading media...');
    const mediaRes = await uploadMedia(token);
    console.log('Media response:', mediaRes.status, mediaRes.data);

    console.log('Tests complete');
  } catch (e) {
    console.error('Test script error', e);
    process.exit(1);
  }
})();
