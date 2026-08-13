CREATE TABLE "customer_booking_claims" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tenant_id" UUID NOT NULL,
  "account_id" UUID NOT NULL,
  "booking_id" UUID NOT NULL,
  "verified_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "customer_booking_claims_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "customer_booking_claims_account_id_booking_id_key"
  ON "customer_booking_claims"("account_id", "booking_id");
CREATE INDEX "customer_booking_claims_tenant_id_account_id_verified_at_idx"
  ON "customer_booking_claims"("tenant_id", "account_id", "verified_at");
CREATE INDEX "customer_booking_claims_tenant_id_booking_id_idx"
  ON "customer_booking_claims"("tenant_id", "booking_id");

ALTER TABLE "customer_booking_claims"
  ADD CONSTRAINT "customer_booking_claims_tenant_id_fkey"
  FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "customer_booking_claims"
  ADD CONSTRAINT "customer_booking_claims_account_id_fkey"
  FOREIGN KEY ("account_id") REFERENCES "customer_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "customer_booking_claims"
  ADD CONSTRAINT "customer_booking_claims_booking_id_fkey"
  FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "customer_booking_claims" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "customer_booking_claims" FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "customer_booking_claims" FROM PUBLIC;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON TABLE "customer_booking_claims" FROM anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON TABLE "customer_booking_claims" FROM authenticated;
  END IF;
END
$$;
