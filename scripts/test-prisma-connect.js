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
  const client = new PrismaClient();
  try {
    const result = await client.$queryRawUnsafe('SELECT 1 AS value');
    console.log('Prisma query result:', JSON.stringify(result));
  } catch (error) {
    console.error('Prisma connection error:', error.message);
    if (error.meta) {
      console.error('Prisma meta:', JSON.stringify(error.meta));
    }
    process.exitCode = 1;
  } finally {
    await client.$disconnect();
  }
})();
