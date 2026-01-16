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
