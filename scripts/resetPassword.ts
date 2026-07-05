import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

async function main() {
  try {
    const email = process.env.ADMIN_EMAIL || 'admin@example.com';
    const newPassword = process.env.ADMIN_TEMP_PASSWORD || 'AdminPassword123!';
    
    console.log(`Resetting password for ${email}...`);
    
    const passwordHash = await hashPassword(newPassword);
    
    const user = await prisma.user.update({
      where: { email },
      data: {
        passwordHash,
      },
    });
    
    console.log(`✅ Password reset for: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   New Password: ${newPassword}`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
