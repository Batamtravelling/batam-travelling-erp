ALTER TABLE "bookings" ADD COLUMN "lead_id" UUID;
ALTER TABLE "tasks" ADD COLUMN "trip_id" UUID;
ALTER TABLE "tasks" ALTER COLUMN "project_id" DROP NOT NULL;

ALTER TABLE "bookings" ADD CONSTRAINT "bookings_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_owner_check" CHECK (num_nonnulls("project_id", "trip_id") = 1);

CREATE INDEX "bookings_tenant_id_lead_id_idx" ON "bookings"("tenant_id", "lead_id");
CREATE INDEX "tasks_tenant_id_trip_id_status_idx" ON "tasks"("tenant_id", "trip_id", "status");
