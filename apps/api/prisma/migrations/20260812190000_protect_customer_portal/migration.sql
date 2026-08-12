CREATE TABLE "public_access_attempts" (
  "id" UUID NOT NULL,
  "tenant_id" UUID NOT NULL,
  "fingerprint" TEXT NOT NULL,
  "attempt_count" INTEGER NOT NULL DEFAULT 1,
  "window_started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "public_access_attempts_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "public_access_attempts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "public_access_attempts_tenant_id_fingerprint_key" ON "public_access_attempts"("tenant_id", "fingerprint");
CREATE INDEX "public_access_attempts_window_started_at_idx" ON "public_access_attempts"("window_started_at");
ALTER TABLE "public_access_attempts" ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='anon') THEN REVOKE ALL ON "public_access_attempts" FROM anon; END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='authenticated') THEN REVOKE ALL ON "public_access_attempts" FROM authenticated; END IF;
END $$;
