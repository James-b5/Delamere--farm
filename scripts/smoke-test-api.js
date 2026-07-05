// Simple smoke test for local API endpoints
// Usage: set BASE_URL and/or BEARER env vars if needed, then `node scripts/smoke-test-api.js`

const base = process.env.BASE_URL || 'http://localhost:3000';
const token = process.env.BEARER || process.env.BEARER_TOKEN || '';
const headers = token ? { Authorization: `Bearer ${token}` } : {};

const endpoints = [
  '/api/user/wishlist',
  '/api/user/addresses',
  '/api/admin/payments',
  '/moderator/payments',
];

async function check(url) {
  try {
    const res = await fetch(url, { headers });
    const text = await res.text();
    console.log(`GET ${url} -> ${res.status} ${res.statusText}\n${text.slice(0, 1000)}\n---`);
  } catch (err) {
    console.error(`Error fetching ${url}:`, err);
  }
}

(async function run() {
  for (const ep of endpoints) {
    const url = base + ep;
    await check(url);
  }
})();
