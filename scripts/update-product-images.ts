import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Updating product images to use local /uploads paths...');

  const updates = [
    {
      name: 'Jersey Dairy Cow - Premium Milk Producer',
      images: ['/uploads/jersey.svg'],
    },
    {
      name: 'Dairy Goats - Boer Goat Does (5 animals)',
      images: ['/uploads/boer.svg'],
    },
    {
      name: 'Layers - Point of Lay Pullets (500 birds)',
      images: ['/uploads/layer-hens.svg'],
    },
    {
      name: 'Friesian Dairy Herd - 5 Cows Package',
      images: ['/uploads/friesian.svg'],
    },
    {
      name: 'Angus Beef Cattle - Prime Breeding Stock',
      images: ['/uploads/angus.svg'],
    },
    {
      name: 'Broiler Chicks - Day Old (1000 birds)',
      images: ['/uploads/broiler.svg'],
    },
    {
      name: 'Turkey Poults - Premium Breeding Stock',
      images: ['/uploads/turkey.svg'],
    },
    {
      name: 'Milking Machine - Portable 4-Cow Unit',
      images: ['/uploads/milking-machine.svg'],
    },
  ];

  for (const u of updates) {
    const product = await prisma.product.findFirst({ where: { name: u.name } });
    if (!product) {
      console.log('Product not found:', u.name);
      continue;
    }
    await prisma.product.update({
      where: { id: product.id },
      data: { images: JSON.stringify(u.images) },
    });
    console.log('Updated images for:', u.name);
  }

  console.log('Done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
