import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Create sample SKUs
  const sku1 = await prisma.sKU.upsert({
    where: { code: 'LAPTOP-001' },
    update: {},
    create: {
      code: 'LAPTOP-001',
      description: 'Laptop Dell Inspiron 15',
      unit: 'EA',
    },
  });

  const sku2 = await prisma.sKU.upsert({
    where: { code: 'MOUSE-001' },
    update: {},
    create: {
      code: 'MOUSE-001',
      description: 'Mouse USB Wireless',
      unit: 'EA',
    },
  });

  const sku3 = await prisma.sKU.upsert({
    where: { code: 'KEYBOARD-001' },
    update: {},
    create: {
      code: 'KEYBOARD-001',
      description: 'Keyboard Mechanical RGB',
      unit: 'EA',
    },
  });

  // Create initial stock balances
  await prisma.stockBalance.upsert({
    where: { skuId: sku1.id },
    update: { quantity: 50 },
    create: {
      skuId: sku1.id,
      quantity: 50,
    },
  });

  await prisma.stockBalance.upsert({
    where: { skuId: sku2.id },
    update: { quantity: 100 },
    create: {
      skuId: sku2.id,
      quantity: 100,
    },
  });

  await prisma.stockBalance.upsert({
    where: { skuId: sku3.id },
    update: { quantity: 25 },
    create: {
      skuId: sku3.id,
      quantity: 25,
    },
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
