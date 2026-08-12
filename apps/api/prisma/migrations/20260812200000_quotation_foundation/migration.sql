CREATE TYPE "QuotationStatus" AS ENUM (
  'DRAFT', 'READY', 'SENT', 'VIEWED', 'NEGOTIATION',
  'ACCEPTED', 'CONVERTED', 'REJECTED', 'EXPIRED', 'CANCELLED'
);

CREATE TYPE "QuotationAcceptanceMethod" AS ENUM (
  'PORTAL', 'MANUAL', 'EMAIL', 'WHATSAPP', 'OTHER'
);

CREATE TABLE "quotations" (
  "id" UUID NOT NULL,
  "tenant_id" UUID NOT NULL,
  "quotation_number" TEXT NOT NULL,
  "customer_id" UUID NOT NULL,
  "lead_id" UUID,
  "package_id" UUID,
  "created_by_id" UUID NOT NULL,
  "sent_by_id" UUID,
  "accepted_by_id" UUID,
  "status" "QuotationStatus" NOT NULL DEFAULT 'DRAFT',
  "version" INTEGER NOT NULL DEFAULT 1,
  "travel_date" DATE NOT NULL,
  "return_date" DATE,
  "pax" INTEGER NOT NULL,
  "destination" TEXT,
  "package_name" TEXT,
  "subtotal_amount" DECIMAL(18,2) NOT NULL,
  "total_amount" DECIMAL(18,2) NOT NULL,
  "currency" VARCHAR(3) NOT NULL DEFAULT 'IDR',
  "valid_until" DATE NOT NULL,
  "terms" TEXT,
  "notes" TEXT,
  "sent_at" TIMESTAMP(3),
  "accepted_at" TIMESTAMP(3),
  "acceptance_method" "QuotationAcceptanceMethod",
  "rejected_at" TIMESTAMP(3),
  "rejection_reason" TEXT,
  "converted_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "quotations_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "quotations_positive_pax" CHECK ("pax" > 0),
  CONSTRAINT "quotations_nonnegative_totals" CHECK ("subtotal_amount" >= 0 AND "total_amount" >= 0),
  CONSTRAINT "quotations_valid_date_range" CHECK ("return_date" IS NULL OR "return_date" >= "travel_date"),
  CONSTRAINT "quotations_validity_range" CHECK ("valid_until" >= "created_at"::date)
);

CREATE TABLE "quotation_items" (
  "id" UUID NOT NULL,
  "tenant_id" UUID NOT NULL,
  "quotation_id" UUID NOT NULL,
  "service_product_id" UUID,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "quantity" DECIMAL(12,2) NOT NULL,
  "unit" TEXT NOT NULL,
  "unit_price" DECIMAL(18,2) NOT NULL,
  "total_price" DECIMAL(18,2) NOT NULL,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "quotation_items_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "quotation_items_positive_quantity" CHECK ("quantity" > 0),
  CONSTRAINT "quotation_items_nonnegative_prices" CHECK ("unit_price" >= 0 AND "total_price" >= 0)
);

CREATE TABLE "quotation_versions" (
  "id" UUID NOT NULL,
  "tenant_id" UUID NOT NULL,
  "quotation_id" UUID NOT NULL,
  "version" INTEGER NOT NULL,
  "snapshot" JSONB NOT NULL,
  "created_by_id" UUID NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "quotation_versions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "quotation_versions_positive_version" CHECK ("version" > 0)
);

ALTER TABLE "bookings" ADD COLUMN "quotation_id" UUID;

CREATE UNIQUE INDEX "quotations_tenant_id_quotation_number_key" ON "quotations"("tenant_id", "quotation_number");
CREATE INDEX "quotations_tenant_id_status_created_at_idx" ON "quotations"("tenant_id", "status", "created_at");
CREATE INDEX "quotations_tenant_id_customer_id_created_at_idx" ON "quotations"("tenant_id", "customer_id", "created_at");
CREATE INDEX "quotations_tenant_id_lead_id_idx" ON "quotations"("tenant_id", "lead_id");
CREATE INDEX "quotation_items_tenant_id_quotation_id_sort_order_idx" ON "quotation_items"("tenant_id", "quotation_id", "sort_order");
CREATE UNIQUE INDEX "quotation_versions_quotation_id_version_key" ON "quotation_versions"("quotation_id", "version");
CREATE INDEX "quotation_versions_tenant_id_quotation_id_created_at_idx" ON "quotation_versions"("tenant_id", "quotation_id", "created_at");
CREATE UNIQUE INDEX "bookings_quotation_id_key" ON "bookings"("quotation_id");

ALTER TABLE "quotations" ADD CONSTRAINT "quotations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_sent_by_id_fkey" FOREIGN KEY ("sent_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_accepted_by_id_fkey" FOREIGN KEY ("accepted_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "quotation_items" ADD CONSTRAINT "quotation_items_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "quotation_items" ADD CONSTRAINT "quotation_items_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "quotations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "quotation_items" ADD CONSTRAINT "quotation_items_service_product_id_fkey" FOREIGN KEY ("service_product_id") REFERENCES "service_products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "quotation_versions" ADD CONSTRAINT "quotation_versions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "quotation_versions" ADD CONSTRAINT "quotation_versions_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "quotations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "quotation_versions" ADD CONSTRAINT "quotation_versions_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "quotations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "quotations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "quotation_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "quotation_versions" ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON "quotations", "quotation_items", "quotation_versions" FROM anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON "quotations", "quotation_items", "quotation_versions" FROM authenticated;
  END IF;
END $$;
