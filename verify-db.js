const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('\n=== DATABASE VERIFICATION ===\n');

    // Check User model
    const userCount = await prisma.user.count();
    console.log(`✓ User table: ${userCount} records`);

    // Check Product model
    const productCount = await prisma.product.count();
    console.log(`✓ Product table: ${productCount} records`);

    // Check Order model
    const orderCount = await prisma.order.count();
    console.log(`✓ Order table: ${orderCount} records`);

    // Check ContactMessage model
    const messageCount = await prisma.contactMessage.count();
    console.log(`✓ ContactMessage table: ${messageCount} records`);

    // Check Booking model
    const bookingCount = await prisma.booking.count();
    console.log(`✓ Booking table: ${bookingCount} records`);

    // Check CartItem model
    const cartCount = await prisma.cartItem.count();
    console.log(`✓ CartItem table: ${cartCount} records`);

    // Check Review model
    const reviewCount = await prisma.review.count();
    console.log(`✓ Review table: ${reviewCount} records`);

    // Check OrderItem model
    const orderItemCount = await prisma.orderItem.count();
    console.log(`✓ OrderItem table: ${orderItemCount} records`);

    console.log('\n=== ADMIN USER VERIFICATION ===\n');
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@delamere.com' },
      select: { email: true, name: true, role: true, isActive: true }
    });

    if (adminUser) {
      console.log('✓ Admin user exists:');
      console.table(adminUser);
    } else {
      console.log('✗ Admin user not found');
    }

    console.log('\n=== ALL MODELS VALIDATED ===\n');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
