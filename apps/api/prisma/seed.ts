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
  console.log(JSON.stringify({ tenantId: tenant.id, userId: user.id }, null, 2));
}
main().finally(() => prisma.$disconnect());
