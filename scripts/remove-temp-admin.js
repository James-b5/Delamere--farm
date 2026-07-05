const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: node remove-temp-admin.js <email>');
    process.exit(1);
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log('User not found:', email);
      process.exit(0);
    }
    await prisma.user.delete({ where: { email } });
    console.log('Deleted user:', email);
  } catch (e) {
    console.error('Error deleting user:', e.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
