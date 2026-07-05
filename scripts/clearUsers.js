const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const count = await prisma.user.count();
    if (count === 0) {
      console.log('No users to delete.');
      return;
    }
    await prisma.user.deleteMany();
    console.log(`Deleted ${count} user(s).`);
  } catch (e) {
    console.error('Error clearing users:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
