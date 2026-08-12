ALTER TABLE "financial_entries"
  ADD COLUMN "reversed_by_id" UUID,
  ADD COLUMN "reversal_of_id" UUID,
  ADD COLUMN "reversal_reason" TEXT,
  ADD COLUMN "reversed_at" TIMESTAMP(3);

CREATE UNIQUE INDEX "financial_entries_reversal_of_id_key"
  ON "financial_entries"("reversal_of_id");

ALTER TABLE "financial_entries"
  ADD CONSTRAINT "financial_entries_reversed_by_id_fkey"
  FOREIGN KEY ("reversed_by_id") REFERENCES "users"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "financial_entries"
  ADD CONSTRAINT "financial_entries_reversal_of_id_fkey"
  FOREIGN KEY ("reversal_of_id") REFERENCES "financial_entries"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "financial_entries"
  ADD CONSTRAINT "financial_entries_reversal_shape_check"
  CHECK (
    ("reversal_of_id" IS NULL AND "reversal_reason" IS NULL)
    OR
    ("reversal_of_id" IS NOT NULL AND "reversal_reason" IS NOT NULL)
  );
