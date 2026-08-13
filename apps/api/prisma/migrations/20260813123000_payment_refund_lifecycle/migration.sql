CREATE TYPE "RefundStatus" AS ENUM ('REQUESTED', 'MANAGER_APPROVED', 'OWNER_APPROVED', 'PROCESSING', 'EXECUTED', 'REJECTED');

ALTER TYPE "FinancialEntryOrigin" ADD VALUE IF NOT EXISTS 'REFUND';

CREATE TABLE "tenant_refund_policies" (
  "id" UUID NOT NULL,
  "tenant_id" UUID NOT NULL,
  "manager_approval_limit" DECIMAL(18,2) NOT NULL DEFAULT 5000000,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "tenant_refund_policies_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "tenant_refund_policies_manager_limit_check" CHECK ("manager_approval_limit" > 0)
);

CREATE UNIQUE INDEX "tenant_refund_policies_tenant_id_key" ON "tenant_refund_policies"("tenant_id");
ALTER TABLE "tenant_refund_policies" ADD CONSTRAINT "tenant_refund_policies_tenant_id_fkey"
  FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "tenant_refund_policies" ("id", "tenant_id", "manager_approval_limit")
SELECT gen_random_uuid(), "id", 5000000 FROM "tenants";

CREATE TABLE "payment_refunds" (
  "id" UUID NOT NULL,
  "tenant_id" UUID NOT NULL,
  "payment_id" UUID NOT NULL,
  "refund_number" TEXT NOT NULL,
  "amount" DECIMAL(18,2) NOT NULL,
  "method" "PaymentMethod" NOT NULL,
  "status" "RefundStatus" NOT NULL DEFAULT 'REQUESTED',
  "reason" TEXT NOT NULL,
  "is_exception" BOOLEAN NOT NULL DEFAULT false,
  "exception_reason" TEXT,
  "method_change_reason" TEXT,
  "requires_owner_approval" BOOLEAN NOT NULL DEFAULT false,
  "policy_threshold_amount" DECIMAL(18,2) NOT NULL,
  "requester_id" UUID NOT NULL,
  "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "manager_approved_by_id" UUID,
  "manager_approved_at" TIMESTAMP(3),
  "manager_approval_reason" TEXT,
  "owner_approved_by_id" UUID,
  "owner_approved_at" TIMESTAMP(3),
  "owner_approval_reason" TEXT,
  "rejected_by_id" UUID,
  "rejected_at" TIMESTAMP(3),
  "rejection_reason" TEXT,
  "processed_by_id" UUID,
  "refunded_at" TIMESTAMP(3),
  "execution_reference" TEXT,
  "proof_url" TEXT,
  "execution_idempotency_key" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "payment_refunds_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "payment_refunds_amount_check" CHECK ("amount" > 0)
);

CREATE UNIQUE INDEX "payment_refunds_tenant_id_refund_number_key" ON "payment_refunds"("tenant_id", "refund_number");
CREATE INDEX "payment_refunds_tenant_id_payment_id_refunded_at_idx" ON "payment_refunds"("tenant_id", "payment_id", "refunded_at");
CREATE INDEX "payment_refunds_tenant_id_status_requested_at_idx" ON "payment_refunds"("tenant_id", "status", "requested_at");

ALTER TABLE "payment_refunds"
  ADD CONSTRAINT "payment_refunds_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "payment_refunds_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "payment_refunds_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "payment_refunds_manager_approved_by_id_fkey" FOREIGN KEY ("manager_approved_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "payment_refunds_owner_approved_by_id_fkey" FOREIGN KEY ("owner_approved_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "payment_refunds_rejected_by_id_fkey" FOREIGN KEY ("rejected_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "payment_refunds_processed_by_id_fkey" FOREIGN KEY ("processed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "financial_entries" ADD COLUMN "refund_id" UUID;
CREATE UNIQUE INDEX "financial_entries_refund_id_key" ON "financial_entries"("refund_id");
ALTER TABLE "financial_entries" ADD CONSTRAINT "financial_entries_refund_id_fkey"
  FOREIGN KEY ("refund_id") REFERENCES "payment_refunds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
