CREATE TYPE "RefundStatus" AS ENUM ('POSTED', 'CANCELLED');

ALTER TYPE "FinancialEntryOrigin" ADD VALUE IF NOT EXISTS 'REFUND';

CREATE TABLE "payment_refunds" (
  "id" UUID NOT NULL,
  "tenant_id" UUID NOT NULL,
  "payment_id" UUID NOT NULL,
  "refund_number" TEXT NOT NULL,
  "amount" DECIMAL(18,2) NOT NULL,
  "method" "PaymentMethod" NOT NULL,
  "status" "RefundStatus" NOT NULL DEFAULT 'POSTED',
  "reason" TEXT NOT NULL,
  "reference" TEXT,
  "processed_by_id" UUID NOT NULL,
  "refunded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "payment_refunds_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "payment_refunds_amount_check" CHECK ("amount" > 0)
);

CREATE UNIQUE INDEX "payment_refunds_tenant_id_refund_number_key"
  ON "payment_refunds"("tenant_id", "refund_number");
CREATE INDEX "payment_refunds_tenant_id_payment_id_refunded_at_idx"
  ON "payment_refunds"("tenant_id", "payment_id", "refunded_at");

ALTER TABLE "payment_refunds"
  ADD CONSTRAINT "payment_refunds_tenant_id_fkey"
  FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "payment_refunds_payment_id_fkey"
  FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "payment_refunds_processed_by_id_fkey"
  FOREIGN KEY ("processed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "financial_entries" ADD COLUMN "refund_id" UUID;
CREATE UNIQUE INDEX "financial_entries_refund_id_key" ON "financial_entries"("refund_id");
ALTER TABLE "financial_entries"
  ADD CONSTRAINT "financial_entries_refund_id_fkey"
  FOREIGN KEY ("refund_id") REFERENCES "payment_refunds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
