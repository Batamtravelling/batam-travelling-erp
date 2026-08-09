CREATE TYPE "CustomerType" AS ENUM ('INDIVIDUAL', 'FAMILY', 'GROUP', 'CORPORATE', 'AGENT', 'RESELLER', 'OTHER');
CREATE TYPE "CustomerStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED', 'ARCHIVED');
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'QUOTATION', 'NEGOTIATION', 'WON', 'LOST');
CREATE TYPE "LeadPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

CREATE TABLE "tenants" (
  "id" UUID NOT NULL, "name" TEXT NOT NULL, "slug" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "users" (
  "id" UUID NOT NULL, "tenant_id" UUID NOT NULL, "cognito_id" TEXT, "email" TEXT NOT NULL, "name" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "roles" ("id" UUID NOT NULL, "tenant_id" UUID, "name" TEXT NOT NULL, CONSTRAINT "roles_pkey" PRIMARY KEY ("id"));
CREATE TABLE "permissions" ("id" UUID NOT NULL, "code" TEXT NOT NULL, CONSTRAINT "permissions_pkey" PRIMARY KEY ("id"));
CREATE TABLE "user_roles" ("user_id" UUID NOT NULL, "role_id" UUID NOT NULL, CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id", "role_id"));
CREATE TABLE "role_permissions" ("role_id" UUID NOT NULL, "permission_id" UUID NOT NULL, CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_id", "permission_id"));
CREATE TABLE "customers" (
  "id" UUID NOT NULL, "tenant_id" UUID NOT NULL, "customer_code" TEXT NOT NULL,
  "type" "CustomerType" NOT NULL DEFAULT 'INDIVIDUAL', "status" "CustomerStatus" NOT NULL DEFAULT 'ACTIVE',
  "full_name" TEXT NOT NULL, "phone" TEXT, "email" TEXT, "address" TEXT, "city" TEXT, "country" TEXT DEFAULT 'ID',
  "notes" TEXT, "lead_source" TEXT, "assigned_user_id" UUID, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL, "archived_at" TIMESTAMP(3), CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "leads" (
  "id" UUID NOT NULL, "tenant_id" UUID NOT NULL, "lead_code" TEXT NOT NULL, "customer_id" UUID NOT NULL, "source" TEXT NOT NULL,
  "requirement" TEXT, "destination" TEXT, "travel_date" DATE, "return_date" DATE, "pax" INTEGER,
  "estimated_value" DECIMAL(18,2), "assigned_user_id" UUID, "priority" "LeadPriority" NOT NULL DEFAULT 'NORMAL',
  "status" "LeadStatus" NOT NULL DEFAULT 'NEW', "first_contact_at" TIMESTAMP(3), "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "audit_logs" (
  "id" UUID NOT NULL, "tenant_id" UUID NOT NULL, "actor_id" UUID, "action" TEXT NOT NULL, "resource_type" TEXT NOT NULL,
  "resource_id" TEXT NOT NULL, "request_id" TEXT, "metadata" JSONB, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "outbox_events" (
  "id" UUID NOT NULL, "tenant_id" UUID NOT NULL, "event_type" TEXT NOT NULL, "aggregate_type" TEXT NOT NULL,
  "aggregate_id" TEXT NOT NULL, "payload" JSONB NOT NULL, "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "published_at" TIMESTAMP(3), CONSTRAINT "outbox_events_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");
CREATE UNIQUE INDEX "users_cognito_id_key" ON "users"("cognito_id");
CREATE INDEX "users_tenant_id_idx" ON "users"("tenant_id");
CREATE UNIQUE INDEX "users_tenant_id_email_key" ON "users"("tenant_id", "email");
CREATE UNIQUE INDEX "roles_tenant_id_name_key" ON "roles"("tenant_id", "name");
CREATE UNIQUE INDEX "permissions_code_key" ON "permissions"("code");
CREATE INDEX "customers_tenant_id_email_idx" ON "customers"("tenant_id", "email");
CREATE INDEX "customers_tenant_id_phone_idx" ON "customers"("tenant_id", "phone");
CREATE INDEX "customers_tenant_id_full_name_idx" ON "customers"("tenant_id", "full_name");
CREATE UNIQUE INDEX "customers_tenant_id_customer_code_key" ON "customers"("tenant_id", "customer_code");
CREATE INDEX "leads_tenant_id_status_assigned_user_id_idx" ON "leads"("tenant_id", "status", "assigned_user_id");
CREATE UNIQUE INDEX "leads_tenant_id_lead_code_key" ON "leads"("tenant_id", "lead_code");
CREATE INDEX "audit_logs_tenant_id_resource_type_resource_id_idx" ON "audit_logs"("tenant_id", "resource_type", "resource_id");
CREATE INDEX "outbox_events_published_at_occurred_at_idx" ON "outbox_events"("published_at", "occurred_at");

ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "customers" ADD CONSTRAINT "customers_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "leads" ADD CONSTRAINT "leads_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "leads" ADD CONSTRAINT "leads_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "outbox_events" ADD CONSTRAINT "outbox_events_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
