const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  const text = fs.readFileSync(filePath, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx);
    let value = trimmed.slice(idx + 1);
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnv(path.join(process.cwd(), '.env'));

(async () => {
  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.findUnique({ where: { email: 'admin@example.com' } });
    console.log('user found:', !!user);
    if (user) {
      console.log('user role:', user.role);
      console.log('passwordHash present:', !!user.passwordHash);
    }
  } catch (error) {
    console.error('db lookup error', error.message);
  } finally {
    await prisma.$disconnect();
  }

  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'AdminPassword123!' }),
    });
    const body = await response.text();
    console.log('status:', response.status);
    console.log('body:', body);
  } catch (error) {
    console.error('api fetch error:', error.message);
  }
})();
