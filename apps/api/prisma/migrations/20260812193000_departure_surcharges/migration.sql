CREATE TYPE "SurchargeBasis" AS ENUM ('PER_PAX', 'PER_BOOKING');
ALTER TABLE "package_departures"
  ADD COLUMN "surcharge_label" TEXT,
  ADD COLUMN "surcharge_amount" DECIMAL(18,2) NOT NULL DEFAULT 0,
  ADD COLUMN "surcharge_basis" "SurchargeBasis" NOT NULL DEFAULT 'PER_PAX';
