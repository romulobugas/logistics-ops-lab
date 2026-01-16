import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createTestUser() {
  const email = 'teste@logistics.com';
  const password = 'teste@123';

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log(`Usuário com email ${email} já existe.`);
      return;
    }

    // Create the user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
      },
    });

    console.log('Usuário de teste criado com sucesso:', user);
  } catch (error) {
    console.error('Erro ao criar usuário de teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
