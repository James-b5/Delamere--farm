import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Delete existing data (optional)
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // Create sample admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      passwordHash: 'hashedplaceholder', // replace with real hash in real app
      role: 'ADMIN',
    },
  });

  // Create sample products
  const products = await prisma.product.createMany({
    data: [
      {
        name: 'Organic Apples',
        description: 'Freshly picked organic apples.',
        price: 2.99,
        stock: 50,
        images: JSON.stringify(['/images/product-placeholder.svg']),
        videos: JSON.stringify([]),
        specs: '{}',
      },
      {
        name: 'Heritage Wheat Flour',
        description: 'Stone‑ground heritage wheat flour, 1kg bag.',
        price: 4.5,
        stock: 30,
        images: JSON.stringify(['/images/product-placeholder.svg']),
        videos: JSON.stringify([]),
        specs: '{}',
      },
      {
        name: 'Raw Honey',
        description: 'Unfiltered raw honey from local beekeepers.',
        price: 8.75,
        stock: 20,
        images: JSON.stringify(['/images/product-placeholder.svg']),
        videos: JSON.stringify([]),
        specs: '{}',
      },
    ],
  });

  console.log('Seed data created:', { adminId: admin.id, productCount: products.count });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
