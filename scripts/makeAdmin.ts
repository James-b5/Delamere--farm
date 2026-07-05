import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

async function main() {
  try {
    const email = process.env.ADMIN_EMAIL || 'admin@example.com';
    
    console.log(`Checking user: ${email}...`);
    
    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      console.log(`✓ User found. Updating to ADMIN...`);
      user = await prisma.user.update({
        where: { email },
        data: {
          role: 'ADMIN',
          emailVerified: true,
        },
      });
      console.log(`✅ Updated: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Email Verified: ${user.emailVerified}`);
    } else {
      console.log(`User not found. Creating ADMIN user...`);
      
      // Generate a temporary password
      const tempPassword = process.env.ADMIN_TEMP_PASSWORD || 'AdminPassword123!';
      const passwordHash = await hashPassword(tempPassword);
      
      user = await prisma.user.create({
        data: {
          email,
          name: 'Admin User',
          passwordHash,
          role: 'ADMIN',
          emailVerified: true,
        },
      });
      
      console.log(`✅ Created new ADMIN user: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Email Verified: ${user.emailVerified}`);
      console.log(`   Temporary Password: ${tempPassword}`);
    }
    
    console.log('\n✓ User now has full ADMIN access (manage, delete, update, edit)');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
