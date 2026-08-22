-- Add an optional canonical departure to quotations. Existing quotations remain flexible/private.
ALTER TABLE "quotations" ADD COLUMN "departure_id" UUID;

ALTER TABLE "quotations"
  ADD CONSTRAINT "quotations_departure_id_fkey"
  FOREIGN KEY ("departure_id") REFERENCES "package_departures"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "quotations_tenant_id_departure_id_idx"
  ON "quotations"("tenant_id", "departure_id");

-- Four Eyes is enabled for existing and future tenants. Owners can change it through
-- the audited tenant payment-policy endpoint when their approved policy differs.
CREATE TABLE "tenant_payment_policies" (
  "id" UUID NOT NULL,
  "tenant_id" UUID NOT NULL,
  "require_separate_verifier" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "tenant_payment_policies_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "tenant_payment_policies_tenant_id_key"
  ON "tenant_payment_policies"("tenant_id");

ALTER TABLE "tenant_payment_policies"
  ADD CONSTRAINT "tenant_payment_policies_tenant_id_fkey"
  FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "tenant_payment_policies" ("id", "tenant_id")
SELECT gen_random_uuid(), "id" FROM "tenants"
ON CONFLICT ("tenant_id") DO NOTHING;

ALTER TABLE public.tenant_payment_policies ENABLE ROW LEVEL SECURITY;
