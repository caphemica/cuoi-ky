import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const saltRounds = 10;
  
  // Hash the password
  const hashedPassword = await bcrypt.hash('1234567890', saltRounds);

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'uteadmin@gmail.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'uteadmin@gmail.com',
      password: hashedPassword,
      role: 'ADMIN',
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log('Admin user created/updated:', adminUser);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

