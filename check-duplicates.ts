import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type ProductRecord = {
  id: string;
  name: string;
  price: number;
  createdAt: Date | null;
};

async function main() {
  console.log('\n📊 Checking for duplicate products...\n');

  // Get all products
  const allProducts = await prisma.product.findMany({
    select: { id: true, name: true, price: true, createdAt: true },
    orderBy: { name: 'asc' }
  }) as ProductRecord[];

  console.log(`Total products: ${allProducts.length}\n`);

  // Group by name
  const grouped = new Map<string, ProductRecord[]>();
  allProducts.forEach((p: ProductRecord) => {
    if (!grouped.has(p.name)) {
      grouped.set(p.name, []);
    }
    grouped.get(p.name)!.push(p);
  });

  // Find duplicates
  let duplicateCount = 0;
  grouped.forEach((products, name) => {
    if (products.length > 1) {
      duplicateCount++;
      console.log(`⚠️  Duplicate: "${name}" (${products.length} copies)`);
      products.forEach((p, idx) => {
        console.log(`   [${idx + 1}] ID: ${p.id} | Price: ${p.price} | Created: ${p.createdAt}`);
      });
      console.log('');
    }
  });

  if (duplicateCount === 0) {
    console.log('✅ No duplicates found!\n');
  } else {
    console.log(`\n⚠️  Found ${duplicateCount} products with duplicates\n`);
  }

  // List all products
  console.log('📋 All products in database:\n');
  allProducts.forEach(p => {
    console.log(`  • ${p.name} (ID: ${p.id.substring(0, 8)}... | Price: ${p.price})`);
  });
  console.log('');
}

main()
  .catch(e => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
