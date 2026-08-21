-- Register package publication approval for existing databases.
-- Tenant Owner is the approved tenant-scoped publication authority.
INSERT INTO "permissions" ("id", "code") VALUES (gen_random_uuid(), 'package.approve')
ON CONFLICT ("code") DO NOTHING;

INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT owner_role."id", approval_permission."id"
FROM "roles" owner_role
CROSS JOIN "permissions" approval_permission
WHERE owner_role."name" = 'Tenant Owner'
  AND owner_role."tenant_id" IS NOT NULL
  AND approval_permission."code" = 'package.approve'
ON CONFLICT DO NOTHING;
