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
    const statements = [
      `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "category" TEXT`,
      `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "breed" TEXT`,
      `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "healthStatus" TEXT`,
      `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "ageOrWeight" TEXT`,
      `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "documents" TEXT NOT NULL DEFAULT '[]'`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "CartItem_userId_productId_key" ON "CartItem"("userId", "productId")`,
    ];

    console.log('Running SQL to add missing Product fields and CartItem unique index...');
    for (const statement of statements) {
      console.log('Executing:', statement);
      await prisma.$executeRawUnsafe(statement);
    }
    console.log('Schema repair SQL executed successfully.');
  } catch (error) {
    console.error('ERROR executing schema repair SQL:', error.message);
    if (error.meta) {
      console.error('META', JSON.stringify(error.meta, null, 2));
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();