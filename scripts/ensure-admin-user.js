const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  const text = fs.readFileSync(filePath, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx);
    let value = trimmed.slice(idx + 1);
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnv(path.join(process.cwd(), '.env'));

(async () => {
  const prisma = new PrismaClient();
  try {
    const existing = await prisma.user.findUnique({ where: { email: 'admin@example.com' } });
    if (existing) {
      console.log('admin@example.com already exists');
      console.log(JSON.stringify(existing, null, 2));
      return;
    }

    const passwordHash = await bcrypt.hash('AdminPassword123!', 10);
    const user = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        name: 'Admin User',
        passwordHash,
        role: 'ADMIN',
        isActive: true,
      },
    });
    console.log('created admin@example.com');
    console.log(JSON.stringify(user, null, 2));
  } catch (error) {
    console.error('ensure admin user error:', error.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
