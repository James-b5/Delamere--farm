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
    const tables = await prisma.$queryRawUnsafe(
      `SELECT table_schema, table_name FROM information_schema.tables WHERE lower(table_name) IN ('_prisma_migrations','schema_migrations') ORDER BY table_schema, table_name;`
    );
    console.log('migration tables:', JSON.stringify(tables, null, 2));
    for (const row of tables) {
      try {
        const count = await prisma.$queryRawUnsafe(
          `SELECT count(*) FROM "${row.table_schema}"."${row.table_name}";`
        );
        console.log(`count for ${row.table_schema}.${row.table_name}:`, JSON.stringify(count, null, 2));
      } catch (error) {
        console.error('select error', row.table_schema, row.table_name, error.message);
      }
    }
  } catch (error) {
    console.error('ERROR', error.message);
    if (error.meta) {
      console.error('META', JSON.stringify(error.meta, null, 2));
    }
  } finally {
    await prisma.$disconnect();
  }
})();