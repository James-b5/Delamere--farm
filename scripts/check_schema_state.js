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
    const result = await prisma.$queryRawUnsafe(`
      SELECT
        EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='User') AS user_table,
        EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='Product') AS product_table,
        EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='Order') AS order_table,
        EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='CartItem') AS cartitem_table,
        EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='Media') AS media_table,
        EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='BlogPost') AS blogpost_table,
        EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='Address') AS address_table,
        EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='Wishlist') AS wishlist_table,
        EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='Product' AND column_name='category') AS product_category,
        EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='Product' AND column_name='breed') AS product_breed,
        EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='Product' AND column_name='healthstatus') AS product_healthStatus,
        EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='Product' AND column_name='ageorweight') AS product_ageOrWeight,
        EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='Product' AND column_name='documents') AS product_documents,
        EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='User' AND column_name='permissions') AS user_permissions,
        EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND tablename='CartItem' AND indexname='CartItem_userId_productId_key') AS cartitem_unique;
    `);
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('ERROR', error.message);
    if (error.meta) {
      console.error('META', JSON.stringify(error.meta, null, 2));
    }
  } finally {
    await prisma.$disconnect();
  }
})();