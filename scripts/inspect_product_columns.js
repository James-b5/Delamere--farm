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
    const columns = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'Product'
      ORDER BY ordinal_position;
    `);
    console.log('Product columns:', JSON.stringify(columns, null, 2));

    const missing = await prisma.$queryRawUnsafe(`
      SELECT column_name
      FROM (VALUES
        ('category'),
        ('breed'),
        ('healthStatus'),
        ('ageOrWeight'),
        ('documents')
      ) AS cols(column_name)
      WHERE NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'Product' AND column_name = cols.column_name
      );
    `);
    console.log('Missing product columns:', JSON.stringify(missing, null, 2));

    const productCount = await prisma.$queryRawUnsafe(`SELECT count(*)::text AS count FROM "Product";`);
    console.log('Product row count:', JSON.stringify(productCount, null, 2));
  } catch (error) {
    console.error('ERROR', error.message);
    if (error.meta) {
      console.error('META', JSON.stringify(error.meta, null, 2));
    }
  } finally {
    await prisma.$disconnect();
  }
})();