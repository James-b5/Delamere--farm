const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');

const prisma = new PrismaClient();

(async () => {
  const passwordHash = await bcrypt.hash('AdminPassword123!', 10);
  const email = 'admin@delamerefarm.co.ke';

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name: 'Admin User',
      passwordHash,
      role: 'ADMIN',
      isActive: true,
    },
    create: {
      id: randomUUID(),
      name: 'Admin User',
      email,
      passwordHash,
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log(JSON.stringify({ id: user.id, email: user.email, role: user.role, name: user.name }, null, 2));
  await prisma.$disconnect();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
