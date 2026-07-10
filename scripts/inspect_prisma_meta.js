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

const repoRoot = path.resolve(__dirname, '..');
loadEnv(path.join(repoRoot, '.env'));

async function main() {
  const prisma = new PrismaClient();
  try {
    const tables = await prisma.$queryRawUnsafe(`SELECT table_schema, table_name FROM information_schema.tables WHERE lower(table_name) IN ('_prisma_migrations','schema_migrations') ORDER BY table_schema, table_name;`);
    console.log('migration tables:', JSON.stringify(tables, null, 2));
    for (const row of tables) {
      try {
        const countRows = await prisma.$queryRawUnsafe(`SELECT count(*)::text as count FROM "${row.table_schema}"."${row.table_name}";`);
        console.log(`count for ${row.table_schema}.${row.table_name}:`, JSON.stringify(countRows, null, 2));
      } catch (error) {
        console.error('select error', row.table_schema, row.table_name, error.message);
        if (error.meta) {
          console.error('META:', JSON.stringify(error.meta, null, 2));
        }
      }
    }
    try {
      const rows = await prisma.$queryRawUnsafe('SELECT id, migration_name, checksum, finished_at FROM "public"."_prisma_migrations" ORDER BY finished_at DESC LIMIT 20;');
      console.log('public._prisma_migrations rows:', JSON.stringify(rows, null, 2));
    } catch (error) {
      console.error('public._prisma_migrations select error', error.message);
      if (error.meta) {
        console.error('META:', JSON.stringify(error.meta, null, 2));
      }
    }
  } catch (error) {
    console.error('ERROR:', error.message);
    if (error.meta) {
      console.error('META:', JSON.stringify(error.meta, null, 2));
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});