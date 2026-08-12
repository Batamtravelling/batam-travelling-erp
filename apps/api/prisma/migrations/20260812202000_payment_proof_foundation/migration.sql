CREATE TABLE "payment_proofs" (
  "id" UUID NOT NULL,
  "tenant_id" UUID NOT NULL,
  "payment_id" UUID NOT NULL,
  "uploaded_by_id" UUID NOT NULL,
  "original_name" TEXT NOT NULL,
  "storage_path" TEXT NOT NULL,
  "mime_type" TEXT NOT NULL,
  "size" INTEGER NOT NULL,
  "sha256" VARCHAR(64) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "payment_proofs_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "payment_proofs_positive_size" CHECK ("size" > 0)
);

CREATE UNIQUE INDEX "payment_proofs_tenant_id_storage_path_key" ON "payment_proofs"("tenant_id", "storage_path");
CREATE INDEX "payment_proofs_tenant_id_payment_id_created_at_idx" ON "payment_proofs"("tenant_id", "payment_id", "created_at");

ALTER TABLE "payment_proofs" ADD CONSTRAINT "payment_proofs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "payment_proofs" ADD CONSTRAINT "payment_proofs_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "payment_proofs" ADD CONSTRAINT "payment_proofs_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "payment_proofs" ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON "payment_proofs" FROM anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON "payment_proofs" FROM authenticated;
  END IF;
END $$;
