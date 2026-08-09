CREATE TYPE "PackageStatus" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED');
CREATE TYPE "PriceType" AS ENUM ('STANDARD', 'MANUAL', 'AUTOMATIC', 'CUSTOM', 'SEASONAL', 'TIER', 'PAX_BASED', 'SPECIAL_AGREEMENT');

CREATE TABLE "packages" (
  "id" UUID NOT NULL,
  "tenant_id" UUID NOT NULL,
  "package_code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "category" TEXT,
  "destination" TEXT,
  "duration_days" INTEGER,
  "description" TEXT,
  "public_description" TEXT,
  "internal_notes" TEXT,
  "status" "PackageStatus" NOT NULL DEFAULT 'DRAFT',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "archived_at" TIMESTAMP(3),
  CONSTRAINT "packages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "package_prices" (
  "id" UUID NOT NULL,
  "tenant_id" UUID NOT NULL,
  "package_id" UUID NOT NULL,
  "type" "PriceType" NOT NULL,
  "cost" DECIMAL(18,2),
  "selling_price" DECIMAL(18,2) NOT NULL,
  "pax_from" INTEGER,
  "pax_to" INTEGER,
  "starts_at" DATE,
  "ends_at" DATE,
  "priority" INTEGER NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "package_prices_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "packages_tenant_id_package_code_key" ON "packages"("tenant_id", "package_code");
CREATE INDEX "packages_tenant_id_status_idx" ON "packages"("tenant_id", "status");
CREATE INDEX "package_prices_tenant_id_package_id_active_priority_idx" ON "package_prices"("tenant_id", "package_id", "active", "priority");
ALTER TABLE "packages" ADD CONSTRAINT "packages_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "package_prices" ADD CONSTRAINT "package_prices_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
