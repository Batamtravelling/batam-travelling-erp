CREATE TYPE "FinancialEntryOrigin" AS ENUM ('MANUAL', 'PAYMENT');
CREATE TYPE "FinancialEntryStatus" AS ENUM ('POSTED', 'REVERSED');

ALTER TABLE "financial_entries"
  ADD COLUMN "payment_id" UUID,
  ADD COLUMN "invoice_id" UUID,
  ADD COLUMN "booking_id" UUID,
  ADD COLUMN "origin" "FinancialEntryOrigin" NOT NULL DEFAULT 'MANUAL',
  ADD COLUMN "status" "FinancialEntryStatus" NOT NULL DEFAULT 'POSTED';

CREATE UNIQUE INDEX "financial_entries_payment_id_key"
  ON "financial_entries"("payment_id");

CREATE INDEX "financial_entries_tenant_id_status_transaction_date_idx"
  ON "financial_entries"("tenant_id", "status", "transaction_date");

CREATE INDEX "financial_entries_tenant_id_invoice_id_idx"
  ON "financial_entries"("tenant_id", "invoice_id");

CREATE INDEX "financial_entries_tenant_id_booking_id_idx"
  ON "financial_entries"("tenant_id", "booking_id");

ALTER TABLE "financial_entries"
  ADD CONSTRAINT "financial_entries_payment_id_fkey"
  FOREIGN KEY ("payment_id") REFERENCES "payments"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "financial_entries"
  ADD CONSTRAINT "financial_entries_invoice_id_fkey"
  FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "financial_entries"
  ADD CONSTRAINT "financial_entries_booking_id_fkey"
  FOREIGN KEY ("booking_id") REFERENCES "bookings"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
