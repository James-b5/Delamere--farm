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
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnv(path.join(process.cwd(), '.env'));
const prisma = new PrismaClient();

(async () => {
  try {
    const duplicates = await prisma.$queryRawUnsafe(`
      SELECT "userId", "productId", count(*) AS count
      FROM "CartItem"
      GROUP BY "userId", "productId"
      HAVING count(*) > 1
      ORDER BY count DESC
      LIMIT 20;
    `);
    console.log('CartItem duplicate rows:', JSON.stringify(duplicates, null, 2));

    const hasIndex = await prisma.$queryRawUnsafe(`
      SELECT indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND tablename = 'CartItem'
        AND indexname = 'CartItem_userId_productId_key';
    `);
    console.log('CartItem unique index exists:', JSON.stringify(hasIndex, null, 2));
  } catch (error) {
    console.error('ERROR', error.message);
    if (error.meta) {
      console.error('META', JSON.stringify(error.meta, null, 2));
    }
  } finally {
    await prisma.$disconnect();
  }
})();