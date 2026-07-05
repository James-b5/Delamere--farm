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
      
      // Test admin password hashing
      const adminPassword = 'AdminPassword123!';
      const adminHash = await bcrypt.hash(adminPassword, 10);
      console.log(`\nAdmin password: ${adminPassword}`);
      console.log(`Admin hash: ${adminHash}\n`);
      
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
      const modPassword = 'ModeratorPassword123!';
      const modHash = await bcrypt.hash(modPassword, 10);
      console.log(`\nModerator password: ${modPassword}`);
      console.log(`Moderator hash: ${modHash}\n`);
      
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
      const userPassword = 'UserPassword123!';
      const userHash = await bcrypt.hash(userPassword, 10);
      console.log(`\nUser password: ${userPassword}`);
      console.log(`User hash: ${userHash}\n`);
      
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
        'admin@delamere.com': 'AdminPassword123!',
        'moderator@delamere.com': 'ModeratorPassword123!',
        'user@delamere.com': 'UserPassword123!'
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
