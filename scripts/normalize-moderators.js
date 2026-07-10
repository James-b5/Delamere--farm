const fs = require('fs');
const path = require('path');

async function normalize() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    const fallbackPath = path.join(process.cwd(), 'data', 'prisma-fallback-store.json');
    if (!fs.existsSync(fallbackPath)) {
      console.error('Fallback store not found at', fallbackPath);
      process.exit(1);
    }
    const raw = fs.readFileSync(fallbackPath, 'utf8');
    const parsed = JSON.parse(raw || '{}');
    const users = parsed.user || parsed.User || parsed.users || [];
    let changed = 0;
    for (const u of users) {
      if (u.role === 'OTHER') {
        u.role = 'MODERATOR';
        changed++;
      }
    }
    fs.writeFileSync(fallbackPath, JSON.stringify(parsed, null, 2));
    console.log(`Updated ${changed} fallback user(s) from OTHER -> MODERATOR`);
    process.exit(0);
  }

  // If DATABASE_URL is set, try to update via @prisma/client
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const res = await prisma.user.updateMany({ where: { role: 'OTHER' }, data: { role: 'MODERATOR' } });
    console.log('Updated users count:', res.count);
    await prisma.$disconnect();
    process.exit(0);
  } catch (e) {
    console.error('Error updating DB users via @prisma/client:', e);
    process.exit(1);
  }
}

normalize();
