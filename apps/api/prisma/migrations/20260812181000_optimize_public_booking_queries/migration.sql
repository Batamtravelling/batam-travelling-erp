CREATE INDEX "packages_tenant_id_status_approval_status_archived_at_idx"
ON "packages"("tenant_id", "status", "approval_status", "archived_at");

CREATE INDEX "bookings_tenant_id_departure_id_status_idx"
ON "bookings"("tenant_id", "departure_id", "status");
