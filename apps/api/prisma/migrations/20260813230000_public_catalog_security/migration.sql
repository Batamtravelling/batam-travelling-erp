-- Public/internal content separation. Existing ambiguous notes remain internal;
-- public_notes starts empty and must be intentionally populated by an editor.
ALTER TABLE "package_components"
  ADD COLUMN "public_notes" TEXT,
  ADD COLUMN "internal_notes" TEXT;
UPDATE "package_components" SET "internal_notes" = "notes" WHERE "notes" IS NOT NULL;

ALTER TABLE "package_itineraries"
  ADD COLUMN "public_notes" TEXT,
  ADD COLUMN "internal_notes" TEXT;
UPDATE "package_itineraries" SET "internal_notes" = "notes" WHERE "notes" IS NOT NULL;

ALTER TABLE "package_departures"
  ADD COLUMN "public_notes" TEXT,
  ADD COLUMN "internal_notes" TEXT;
UPDATE "package_departures" SET "internal_notes" = "notes" WHERE "notes" IS NOT NULL;

-- Promotion review lifecycle.
ALTER TABLE "promotions"
  ADD COLUMN "approval_status" "ApprovalStatus" NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN "submitted_by_id" UUID,
  ADD COLUMN "submitted_at" TIMESTAMP(3),
  ADD COLUMN "reviewed_by_id" UUID,
  ADD COLUMN "reviewed_at" TIMESTAMP(3),
  ADD COLUMN "review_note" TEXT;

ALTER TABLE "promotions" ADD CONSTRAINT "promotions_submitted_by_id_fkey"
  FOREIGN KEY ("submitted_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "promotions" ADD CONSTRAINT "promotions_reviewed_by_id_fkey"
  FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Existing published promotions are already owner-curated and are grandfathered
-- as approved. New and draft rows must pass the review workflow.
UPDATE "promotions" SET "approval_status" = 'APPROVED' WHERE "status" = 'PUBLISHED';

-- Materialise tenant ownership on public-content joins before replacing their
-- single-column foreign keys with tenant-constrained composite keys.
ALTER TABLE "article_packages" ADD COLUMN "tenant_id" UUID;
UPDATE "article_packages" ap SET "tenant_id" = a."tenant_id"
FROM "articles" a WHERE a."id" = ap."article_id";

ALTER TABLE "promotion_packages" ADD COLUMN "tenant_id" UUID;
UPDATE "promotion_packages" pp SET "tenant_id" = p."tenant_id"
FROM "promotions" p WHERE p."id" = pp."promotion_id";

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM "article_packages" ap
    JOIN "articles" a ON a."id" = ap."article_id"
    JOIN "packages" p ON p."id" = ap."package_id"
    WHERE a."tenant_id" <> p."tenant_id"
  ) THEN
    RAISE EXCEPTION 'Cross-tenant article/package link detected; migration stopped';
  END IF;
  IF EXISTS (
    SELECT 1 FROM "promotion_packages" pp
    JOIN "promotions" r ON r."id" = pp."promotion_id"
    JOIN "packages" p ON p."id" = pp."package_id"
    WHERE r."tenant_id" <> p."tenant_id"
  ) THEN
    RAISE EXCEPTION 'Cross-tenant promotion/package link detected; migration stopped';
  END IF;
END $$;

ALTER TABLE "article_packages" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "promotion_packages" ALTER COLUMN "tenant_id" SET NOT NULL;

CREATE UNIQUE INDEX "packages_tenant_id_id_key" ON "packages"("tenant_id", "id");
CREATE UNIQUE INDEX "articles_tenant_id_id_key" ON "articles"("tenant_id", "id");
CREATE UNIQUE INDEX "promotions_tenant_id_id_key" ON "promotions"("tenant_id", "id");
CREATE INDEX "article_packages_tenant_id_idx" ON "article_packages"("tenant_id");
CREATE INDEX "promotion_packages_tenant_id_idx" ON "promotion_packages"("tenant_id");

ALTER TABLE "article_packages" DROP CONSTRAINT "article_packages_article_id_fkey";
ALTER TABLE "article_packages" DROP CONSTRAINT "article_packages_package_id_fkey";
ALTER TABLE "promotion_packages" DROP CONSTRAINT "promotion_packages_promotion_id_fkey";
ALTER TABLE "promotion_packages" DROP CONSTRAINT "promotion_packages_package_id_fkey";

ALTER TABLE "article_packages" ADD CONSTRAINT "article_packages_tenant_id_article_id_fkey"
  FOREIGN KEY ("tenant_id", "article_id") REFERENCES "articles"("tenant_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "article_packages" ADD CONSTRAINT "article_packages_tenant_id_package_id_fkey"
  FOREIGN KEY ("tenant_id", "package_id") REFERENCES "packages"("tenant_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "promotion_packages" ADD CONSTRAINT "promotion_packages_tenant_id_promotion_id_fkey"
  FOREIGN KEY ("tenant_id", "promotion_id") REFERENCES "promotions"("tenant_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "promotion_packages" ADD CONSTRAINT "promotion_packages_tenant_id_package_id_fkey"
  FOREIGN KEY ("tenant_id", "package_id") REFERENCES "packages"("tenant_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Register the distinct approval capability without granting it implicitly.
-- Role assignment remains an explicit administrator/bootstrap decision.
INSERT INTO "permissions" ("id", "code") VALUES (gen_random_uuid(), 'content.approve')
ON CONFLICT ("code") DO NOTHING;
INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT owner_role."id", approval_permission."id"
FROM "roles" owner_role
CROSS JOIN "permissions" approval_permission
WHERE owner_role."name" = 'Tenant Owner'
  AND owner_role."tenant_id" IS NOT NULL
  AND approval_permission."code" = 'content.approve'
ON CONFLICT DO NOTHING;
