// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Vegetables
  await prisma.product.createMany({
    data: [
      {
        id: 'seed-product-tomatoes',
        name: 'Tomatoes',
        description: 'Fresh organic tomatoes',
        price: 150,
        stock: 200,
        images: JSON.stringify(['/images/product-placeholder.svg']),
        videos: JSON.stringify([]),
        specs: JSON.stringify({ category: 'Vegetable' }),
      },
      {
        id: 'seed-product-spinach',
        name: 'Spinach',
        description: 'Leafy green spinach',
        price: 80,
        stock: 150,
        images: JSON.stringify(['/images/product-placeholder.svg']),
        videos: JSON.stringify([]),
        specs: JSON.stringify({ category: 'Vegetable' }),
      },
    ],
  });

  // Livestock
  await prisma.product.createMany({
    data: [
      {
        id: 'seed-product-broilers',
        name: 'Chicken (Broilers)',
        description: 'Healthy broiler chickens, 6 weeks old',
        price: 2500,
        stock: 30,
        images: JSON.stringify(['/images/product-placeholder.svg']),
        videos: JSON.stringify(['https://example.com/videos/chicken-tour.mp4']),
        specs: JSON.stringify({ category: 'Livestock', weight: '2kg each' }),
      },
      {
        id: 'seed-product-goats',
        name: 'Goats',
        description: 'Nigerian dwarf goats, male',
        price: 15000,
        stock: 10,
        images: JSON.stringify(['/images/product-placeholder.svg']),
        videos: JSON.stringify(['https://example.com/videos/goat-grazing.mp4']),
        specs: JSON.stringify({ category: 'Livestock', weight: '30kg each' }),
      },
    ],
  });

  // Media / Farm videos
  await prisma.product.createMany({
    data: [
      {
        id: 'seed-product-media',
        name: 'Farm Overview Video',
        description: 'Aerial tour of Delamere Farm',
        price: 0,
        stock: 1,
        images: JSON.stringify([]),
        videos: JSON.stringify(['https://example.com/videos/farm-overview.mp4']),
        specs: JSON.stringify({ category: 'Media' }),
      },
    ],
  });

  // Blog posts
  await prisma.blogPost.createMany({
    data: [
      {
        id: 'seed-blog-cattle-care',
        title: 'Essential Tips for Caring for Your Dairy Cattle',
        slug: 'caring-for-dairy-cattle',
        excerpt: 'Learn best practices for maintaining healthy and productive dairy cattle.',
        content: 'Full article content goes here. Replace with rich content as needed.',
        author: 'Delamere Farm Team',
        published: true,
        publishedAt: new Date(),
        coverImage: 'https://picsum.photos/seed/blog1/1200/600',
      },
      {
        id: 'seed-blog-fresh-milk',
        title: 'The Benefits of Fresh Farm Milk',
        slug: 'benefits-fresh-farm-milk',
        excerpt: 'Discover why fresh, locally-sourced milk is healthier and more nutritious.',
        content: 'Full article content goes here. Replace with rich content as needed.',
        author: 'Delamere Farm Team',
        published: true,
        publishedAt: new Date(),
        coverImage: 'https://picsum.photos/seed/blog2/1200/600',
      },
    ],
  });

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
