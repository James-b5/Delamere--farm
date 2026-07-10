const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'desmo48023@gmail.com';
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error('Admin user not found');
    process.exit(1);
  }

  let product = await prisma.product.findFirst({ where: { deleted: false } });
  if (!product) {
    product = await prisma.product.create({
      data: {
        id: `prod-${Date.now()}`,
        name: 'Debug Test Product',
        description: 'Temporary product for admin orders debug',
        price: 19.99,
        stock: 10,
      },
    });
  }

  const orderId = `order-debug-${Date.now()}`;
  const orderItemId = `item-debug-${Date.now()}`;

  await prisma.order.create({
    data: {
      id: orderId,
      userId: user.id,
      totalAmount: 19.99,
      status: 'PENDING',
      OrderItem: {
        create: {
          id: orderItemId,
          productId: product.id,
          quantity: 1,
          price: 19.99,
        },
      },
    },
  });

  console.log(JSON.stringify({ orderId, productId: product.id, userId: user.id }));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
