import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { User } from '@prisma/client';

async function main() {
  try {
    console.log('Checking existing users...');
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, emailVerified: true, passwordHash: true },
    });

    if (users.length === 0) {
      console.log('No users found. Creating test users...');

      // Create admin user
      const adminHash = await hashPassword('AdminPassword123!');
      const admin = await prisma.user.create({
        data: {
          email: 'admin@delamere.com',
          name: 'Admin User',
          passwordHash: adminHash,
          role: 'ADMIN',
          emailVerified: true,
        },
      });
      console.log('✅ Created admin user:', admin.email);

      // Create moderator user (role OTHER)
      const modHash = await hashPassword('ModeratorPassword123!');
      const moderator = await prisma.user.create({
        data: {
          email: 'moderator@delamere.com',
          name: 'Moderator User',
          passwordHash: modHash,
          role: 'OTHER',
          emailVerified: true,
        },
      });
      console.log('✅ Created moderator user (role=OTHER):', moderator.email);
    } else {
      console.log('Existing users:');
      users.forEach((user: User) => {
        console.log(`- ${user.email} (${user.role}): emailVerified=${user.emailVerified}, hasPassword=${!!user.passwordHash}`);
      });
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
