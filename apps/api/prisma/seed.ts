import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Create roles
  const adminRole = await (prisma as any).role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'System administrator with full access',
    },
  });

  const userRole = await (prisma as any).role.upsert({
    where: { name: 'USER' },
    update: {},
    create: {
      name: 'USER',
      description: 'Regular user with limited access',
    },
  });

  // Create permissions
  const permissions = [
    { name: 'users:create', resource: 'users', action: 'create', description: 'Create users' },
    { name: 'users:read', resource: 'users', action: 'read', description: 'Read users' },
    { name: 'users:update', resource: 'users', action: 'update', description: 'Update users' },
    { name: 'users:delete', resource: 'users', action: 'delete', description: 'Delete users' },
    { name: 'stock:create', resource: 'stock', action: 'create', description: 'Create stock items' },
    { name: 'stock:read', resource: 'stock', action: 'read', description: 'Read stock items' },
    { name: 'stock:update', resource: 'stock', action: 'update', description: 'Update stock items' },
    { name: 'stock:delete', resource: 'stock', action: 'delete', description: 'Delete stock items' },
    { name: 'reports:read', resource: 'reports', action: 'read', description: 'Read reports' },
  ];

  for (const perm of permissions) {
    await (prisma as any).permission.upsert({
      where: { resource_action: { resource: perm.resource, action: perm.action } },
      update: {},
      create: perm,
    });
  }

  // Assign all permissions to admin role
  const allPermissions = await (prisma as any).permission.findMany();
  for (const permission of allPermissions) {
    await (prisma as any).rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: (adminRole as any).id,
          permissionId: (permission as any).id,
        },
      },
      update: {},
      create: {
        roleId: (adminRole as any).id,
        permissionId: (permission as any).id,
      },
    });
  }

  // Assign limited permissions to user role
  const userPermissions = await (prisma as any).permission.findMany({
    where: { action: 'read' },
  });
  for (const permission of userPermissions) {
    await (prisma as any).rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: (userRole as any).id,
          permissionId: (permission as any).id,
        },
      },
      update: {},
      create: {
        roleId: (userRole as any).id,
        permissionId: (permission as any).id,
      },
    });
  }

  // Create sample users
  const adminPassword = Buffer.from('teste@123salt').toString('base64');
  const userPassword = Buffer.from('user123salt').toString('base64');

  const adminUser = await (prisma as any).user.upsert({
    where: { email: 'teste@logistics.com' },
    update: {},
    create: {
      email: 'teste@logistics.com',
      username: 'teste',
      password: adminPassword,
      firstName: 'Teste',
      lastName: 'Administrator',
      isActive: true,
    },
  });

  const regularUser = await (prisma as any).user.upsert({
    where: { email: 'user@logistics.com' },
    update: {},
    create: {
      email: 'user@logistics.com',
      username: 'user',
      password: userPassword,
      firstName: 'Regular',
      lastName: 'User',
      isActive: true,
    },
  });

  // Assign roles to users
  await (prisma as any).userRole.upsert({
    where: { userId_roleId: { userId: (adminUser as any).id, roleId: (adminRole as any).id } },
    update: {},
    create: {
      userId: (adminUser as any).id,
      roleId: (adminRole as any).id,
    },
  });

  await (prisma as any).userRole.upsert({
    where: { userId_roleId: { userId: (regularUser as any).id, roleId: (userRole as any).id } },
    update: {},
    create: {
      userId: (regularUser as any).id,
      roleId: (userRole as any).id,
    },
  });

  // Create route permissions
  const routePermissions = [
    { role: 'ADMIN', route: '/auth/*', method: '*' },
    { role: 'ADMIN', route: '/stock/*', method: '*' },
    { role: 'ADMIN', route: '/users/*', method: '*' },
    { role: 'USER', route: '/auth/login', method: 'POST' },
    { role: 'USER', route: '/auth/me', method: 'GET' },
    { role: 'USER', route: '/auth/permissions', method: 'GET' },
    { role: 'USER', route: '/stock/*', method: 'GET' },
    { role: 'USER', route: '/health', method: 'GET' },
  ];

  for (const routePerm of routePermissions) {
    await (prisma as any).routePermission.upsert({
      where: {
        role_route_method: {
          role: routePerm.role,
          route: routePerm.route,
          method: routePerm.method,
        },
      },
      update: {},
      create: routePerm,
    });
  }

  const unit = await prisma.unit.upsert({
    where: { abbreviation: 'UN' },
    update: {},
    create: {
      name: 'Unidade',
      abbreviation: 'UN',
    },
  });

  const productA = await prisma.product.upsert({
    where: { code: 'PROD-001' },
    update: {},
    create: {
      code: 'PROD-001',
      name: 'Tênis Sprint',
      controlsBatch: false,
      controlsExpiry: false,
    },
  });

  const productB = await prisma.product.upsert({
    where: { code: 'PROD-002' },
    update: {},
    create: {
      code: 'PROD-002',
      name: 'Suplemento Whey 900g',
      controlsBatch: true,
      controlsExpiry: true,
    },
  });

  const productC = await prisma.product.upsert({
    where: { code: 'PROD-003' },
    update: {},
    create: {
      code: 'PROD-003',
      name: 'Kit Garrafa Térmica',
      controlsBatch: true,
      controlsExpiry: false,
    },
  });

  const sku1 = await prisma.sKU.upsert({
    where: { ean: '7891000000010' },
    update: {},
    create: {
      ean: '7891000000010',
      productId: productA.id,
      unitId: unit.id,
      brand: 'LogiBrand',
      color: 'Azul',
      size: '42',
    },
  });

  const sku2 = await prisma.sKU.upsert({
    where: { ean: '7891000000027' },
    update: {},
    create: {
      ean: '7891000000027',
      productId: productB.id,
      unitId: unit.id,
      brand: 'NutriLab',
      size: '900g',
    },
  });

  const sku3 = await prisma.sKU.upsert({
    where: { ean: '7891000000034' },
    update: {},
    create: {
      ean: '7891000000034',
      productId: productC.id,
      unitId: unit.id,
      brand: 'ThermoX',
      color: 'Preto',
    },
  });

  const locationSeeds = [
    { deposit: 'DEP-01', street: 'Rua A', block: 'A', level: '1', apartment: '01' },
    { deposit: 'DEP-01', street: 'Rua A', block: 'A', level: '1', apartment: '02' },
    { deposit: 'DEP-01', street: 'Rua A', block: 'B', level: '1', apartment: '01' },
    { deposit: 'DEP-01', street: 'Rua B', block: 'A', level: '1', apartment: '01' },
    { deposit: 'DEP-01', street: 'Rua B', block: 'A', level: '2', apartment: '01' },
    { deposit: 'DEP-01', street: 'Rua C', block: 'B', level: '1', apartment: '03' },
    { deposit: 'DEP-02', street: 'Rua D', block: 'A', level: '1', apartment: '01' },
    { deposit: 'DEP-02', street: 'Rua D', block: 'B', level: '2', apartment: '02' },
    { deposit: 'DEP-02', street: 'Rua E', block: 'A', level: '1', apartment: '04' },
    { deposit: 'DEP-02', street: 'Rua F', block: 'C', level: '3', apartment: '01' },
  ];

  await prisma.stockLocation.createMany({ data: locationSeeds, skipDuplicates: true });
  const locations = await prisma.stockLocation.findMany({ orderBy: { createdAt: 'asc' } });

  const existingLots = await prisma.stockLot.count();
  if (existingLots === 0 && locations.length) {
    const lotSeeds: Array<{
      skuId: string;
      locationId: string;
      lotCode?: string;
      expiryDate?: Date;
      quantity: number;
    }> = [];

    const skuConfigs = [
      { sku: sku1, lotPrefix: 'TEN', expiry: false },
      { sku: sku2, lotPrefix: 'WHEY', expiry: true },
      { sku: sku3, lotPrefix: 'KIT', expiry: false },
    ];

    skuConfigs.forEach((config, skuIndex) => {
      for (let i = 0; i < 3; i += 1) {
        const location = locations[(skuIndex * 3 + i) % locations.length];
        const quantity = 20 + skuIndex * 10 + i * 5;
        const expiryDate = config.expiry ? new Date(2026, skuIndex, 10 + i) : undefined;

        lotSeeds.push({
          skuId: config.sku.id,
          locationId: location.id,
          lotCode: `${config.lotPrefix}-${i + 1}`,
          expiryDate,
          quantity,
        });
      }
    });

    const totals = new Map<string, number>();
    for (const lot of lotSeeds) {
      await prisma.stockLot.create({ data: lot });
      totals.set(lot.skuId, (totals.get(lot.skuId) ?? 0) + lot.quantity);
    }

    for (const [skuId, quantity] of totals.entries()) {
      await prisma.stockBalance.upsert({
        where: { skuId },
        update: { quantity },
        create: { skuId, quantity },
      });
    }
  }

  console.log('Seeding finished.');
  console.log('Admin user: teste@logistics.com / teste@123');
  console.log('Regular user: user@logistics.com / user123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
