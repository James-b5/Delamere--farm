const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash('AdminPassword123!', 10);

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@delamere.com',
        name: 'Admin User',
        passwordHash: hashedPassword,
        role: 'ADMIN',
        isActive: true,
      },
    });

    console.log('Admin user created:');
    console.table({
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role,
    });

    // Create a regular user
    const regularUserPassword = await bcrypt.hash('UserPassword123!', 10);
    const regularUser = await prisma.user.create({
      data: {
        email: 'user@delamere.com',
        name: 'Test User',
        passwordHash: regularUserPassword,
        role: 'USER',
        isActive: true,
      },
    });

    console.log('\nRegular user created:');
    console.table({
      id: regularUser.id,
      email: regularUser.email,
      name: regularUser.name,
      role: regularUser.role,
    });
  } catch (e) {
    console.error('Error creating users:', e.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
