// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { prisma } from '@/lib/prisma';
import { User } from '@prisma/client';

async function main() {
  try {
    console.log('Updating emailVerified for test users...');
    
    const result = await prisma.user.updateMany({
      where: {
        email: {
          in: ['admin@delamere.com', 'moderator@delamere.com', 'user@delamere.com']
        }
      },
      data: {
        emailVerified: true
      }
    });

    console.log(`✅ Updated ${result.count} users`);

    // Verify the changes
    const users = await prisma.user.findMany({
      where: {
        email: {
          in: ['admin@delamere.com', 'moderator@delamere.com', 'user@delamere.com']
        }
      },
      select: { email: true, emailVerified: true, role: true }
    });

    console.log('\nUpdated users:');
    users.forEach((user: User) => {
      console.log(`✓ ${user.email} (${user.role}): emailVerified=${user.emailVerified}`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
