const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const timestamp = Date.now();
  const email = `temp-admin-${timestamp}@local.test`;
  const password = `TempPass!${Math.floor(Math.random()*900000+100000)}`;
  const hashed = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        email,
        name: 'Temp Admin',
        passwordHash: hashed,
        role: 'ADMIN',
        emailVerified: true,
        isActive: true,
      },
    });

    console.log('TEMP ADMIN CREATED');
    console.table({ id: user.id, email: user.email, role: user.role });
    console.log('PASSWORD:', password);
  } catch (e) {
    console.error('Error creating temp admin:', e.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
