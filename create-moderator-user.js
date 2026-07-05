const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash('ModeratorPassword123!', 10);

    // Check if moderator already exists
    const existing = await prisma.user.findUnique({
      where: { email: 'moderator@delamere.com' },
    });

    if (existing) {
      console.log('Moderator user already exists');
      return;
    }

    // Create moderator user (role set to OTHER)
    const moderatorUser = await prisma.user.create({
      data: {
        email: 'moderator@delamere.com',
        name: 'Moderator User',
        passwordHash: hashedPassword,
        role: 'OTHER',
        isActive: true,
      },
    });

    console.log('Moderator user created:');
    console.table({
      id: moderatorUser.id,
      email: moderatorUser.email,
      name: moderatorUser.name,
      role: moderatorUser.role,
    });
  } catch (e) {
    console.error('Error creating moderator user:', e.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
