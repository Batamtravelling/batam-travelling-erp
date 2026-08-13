INSERT INTO "permissions" ("id", "code")
VALUES (gen_random_uuid(), 'booking.confirm.override')
ON CONFLICT ("code") DO NOTHING;

INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT DISTINCT owner_permission."role_id", override_permission."id"
FROM "role_permissions" owner_permission
JOIN "permissions" owner_code
  ON owner_code."id" = owner_permission."permission_id"
CROSS JOIN "permissions" override_permission
WHERE owner_code."code" = 'dashboard.owner'
  AND override_permission."code" = 'booking.confirm.override'
ON CONFLICT ("role_id", "permission_id") DO NOTHING;
