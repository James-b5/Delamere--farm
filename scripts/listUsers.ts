import { prisma } from '../lib/prisma';

async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, role: true, isActive: true }
    });
    console.log('📋 Users in the system:');
    console.table(users);
  } catch (err) {
    console.error('❌ Error fetching users:', err);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();
