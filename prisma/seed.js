require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');

async function main() {
  const connectionString = process.env.DATABASE_URL;
  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@gmail.com' }
  });

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: 'admin@gmail.com',
        password: hashedPassword,
        name: 'Administrator',
        role: 'admin'
      }
    });
    console.log('Admin user created successfully');
  } else {
    // Ensure role is admin
    await prisma.user.update({
      where: { email: 'admin@gmail.com' },
      data: { role: 'admin' }
    });
    console.log('Admin user already exists, ensured role is admin');
  }

  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
