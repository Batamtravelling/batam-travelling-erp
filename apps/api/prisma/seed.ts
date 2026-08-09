import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const permissions = [
  'lead.create', 'lead.read', 'lead.update', 'lead.assign', 'lead.convert',
  'customer.create', 'customer.read', 'customer.update', 'audit.read',
];

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'batam-travelling' },
    update: {},
    create: { name: 'Batam Travelling', slug: 'batam-travelling' },
  });
  const role = await prisma.role.upsert({
    where: { tenantId_name: { tenantId: tenant.id, name: 'Tenant Owner' } },
    update: {},
    create: { tenantId: tenant.id, name: 'Tenant Owner' },
  });
  for (const code of permissions) {
    const permission = await prisma.permission.upsert({ where: { code }, update: {}, create: { code } });
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } }, update: {},
      create: { roleId: role.id, permissionId: permission.id },
    });
  }
  const user = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'owner@batamtravelling.local' } },
    update: {}, create: { tenantId: tenant.id, email: 'owner@batamtravelling.local', name: 'Tenant Owner' },
  });
  await prisma.userRole.upsert({ where: { userId_roleId: { userId: user.id, roleId: role.id } }, update: {}, create: { userId: user.id, roleId: role.id } });

  const customer = await prisma.customer.upsert({
    where: { tenantId_customerCode: { tenantId: tenant.id, customerCode: 'CUS-000001' } },
    update: {},
    create: {
      tenantId: tenant.id,
      customerCode: 'CUS-000001',
      fullName: 'Rina Suryani',
      phone: '081234567890',
      email: 'rina@example.com',
      city: 'Batam',
      notes: 'Seeded customer',
    },
  });

  await prisma.lead.upsert({
    where: { tenantId_leadCode: { tenantId: tenant.id, leadCode: 'LEAD-000001' } },
    update: {},
    create: {
      tenantId: tenant.id,
      leadCode: 'LEAD-000001',
      customerId: customer.id,
      source: 'Website',
      requirement: 'Family trip to Bintan',
      destination: 'Bintan',
      pax: 4,
      estimatedValue: 1200000,
      priority: 'HIGH',
      status: 'QUOTATION',
      notes: 'Seeded lead',
    },
  });

  console.log(JSON.stringify({ tenantId: tenant.id, userId: user.id }, null, 2));
}
main().finally(() => prisma.$disconnect());
