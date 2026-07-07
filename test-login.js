const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('\n🔍 Checking database users...\n');
    
    const users = await prisma.user.findMany({
      select: { 
        id: true, 
        email: true, 
        name: true, 
        role: true, 
        emailVerified: true, 
        passwordHash: true 
      },
    });

    if (users.length === 0) {
      console.log('❌ No users found in database!');
      console.log('\n📝 Creating test users...');
      
      // Test admin password hashing - read from env to avoid committing secrets
      const adminPassword = process.env.TEST_ADMIN_PASSWORD || null;
      if (!adminPassword) {
        console.warn('No TEST_ADMIN_PASSWORD set; creating user with a generated password. Set TEST_ADMIN_PASSWORD to a known value for predictable tests.');
      }
      const adminHash = await bcrypt.hash(adminPassword || Math.random().toString(36).slice(2, 12), 10);
      
      const admin = await prisma.user.create({
        data: {
          email: 'admin@delamere.com',
          name: 'Admin User',
          passwordHash: adminHash,
          role: 'ADMIN',
          emailVerified: true,
        },
      });
      console.log('✅ Created admin user');
      
      // Test moderator password hashing
      const modPassword = process.env.TEST_MODERATOR_PASSWORD || null;
      if (!modPassword) {
        console.warn('No TEST_MODERATOR_PASSWORD set; creating moderator with a generated password.');
      }
      const modHash = await bcrypt.hash(modPassword || Math.random().toString(36).slice(2, 12), 10);
      
      const moderator = await prisma.user.create({
        data: {
          email: 'moderator@delamere.com',
          name: 'Moderator User',
          passwordHash: modHash,
          role: 'OTHER',
          emailVerified: true,
        },
      });
      console.log('✅ Created moderator user (role=OTHER)');
      
      // Create regular user
      const userPassword = process.env.TEST_USER_PASSWORD || null;
      if (!userPassword) {
        console.warn('No TEST_USER_PASSWORD set; creating user with a generated password.');
      }
      const userHash = await bcrypt.hash(userPassword || Math.random().toString(36).slice(2, 12), 10);
      
      const regularUser = await prisma.user.create({
        data: {
          email: 'user@delamere.com',
          name: 'Regular User',
          passwordHash: userHash,
          role: 'USER',
          emailVerified: true,
        },
      });
      console.log('✅ Created regular user\n');
      
      console.log('🧪 Testing password verification...');
      const match = await bcrypt.compare(adminPassword, adminHash);
      console.log(`Password verification: ${match ? '✅ PASS' : '❌ FAIL'}\n`);
      
    } else {
      console.log(`Found ${users.length} users:\n`);
      users.forEach(user => {
        console.log(`${user.email}`);
        console.log(`  - Role: ${user.role}`);
        console.log(`  - Email Verified: ${user.emailVerified}`);
        console.log(`  - Has Password: ${!!user.passwordHash}`);
        if (user.passwordHash) {
          console.log(`  - Password Hash (first 20 chars): ${user.passwordHash.substring(0, 20)}...`);
        }
        console.log();
      });
      
      // Test password verification for each user
      console.log('🧪 Testing password verification:\n');
      const testPasswords = {
        'admin@delamere.com': process.env.TEST_ADMIN_PASSWORD || null,
        'moderator@delamere.com': process.env.TEST_MODERATOR_PASSWORD || null,
        'user@delamere.com': process.env.TEST_USER_PASSWORD || null
      };
      
      for (const [email, password] of Object.entries(testPasswords)) {
        const user = users.find(u => u.email === email);
        if (user && user.passwordHash) {
          const match = await bcrypt.compare(password, user.passwordHash);
          console.log(`${email}: ${match ? '✅ Password matches' : '❌ Password does NOT match'}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
