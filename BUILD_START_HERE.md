# Batam Travelling ERP — Build Start Here

**Purpose:** turn the approved specifications into a safe, traceable MVP delivery.

## First: apply the approved decisions

The decisions in [Document 32](docs/32_TECHNOLOGY_AND_ARCHITECTURE_DECISIONS.md) are now approved. Apply them during repository bootstrap:

1. Backend runtime and framework.
2. Frontend and rendering approach.
3. Database.
4. Cache, queue, and worker runtime.
5. Storage and CDN.
6. Hosting, region, domain, and DNS.
7. Authentication and MFA.
8. Logs, metrics, traces, and alerts.

Record one ADR for each decision with owner, date, alternatives, consequences, cost, security impact, and migration/exit plan.

## Then: establish the engineering foundation

Follow [Document 42](docs/42_ENGINEERING_BOOTSTRAP_AND_REPOSITORY_STANDARDS.md):

- initialise Git and protect the main branch;
- set up review and issue tracking;
- create development, staging, and production environments;
- configure a managed secret store;
- make CI run formatting, linting, type checks, tests, dependency/security scans, and migration validation;
- create `openapi.yaml` and migration tooling.

## MVP delivery sequence

The MVP objective is stated in [Document 33](docs/33_MVP_RELEASE_PLAN_AND_PRODUCT_BACKLOG.md).

1. Tenant identity, roles, audit, migration tooling, and CI.
2. CRM, packages, prices, and quotations.
3. Bookings, invoices, payments, and notifications.
4. Vendors, schedules, assignments, and trip readiness.
5. Reports, UAT, production-readiness review, and launch.

Use [Document 34](docs/34_RBAC_PERMISSION_MATRIX.md), [Document 35](docs/35_API_CONTRACT_AND_EVENT_CATALOG.md), [Document 36](docs/36_DATABASE_MIGRATION_AND_MASTER_DATA_PLAN.md), and [Document 39](docs/39_TEST_CASE_UAT_AND_TRACEABILITY_PLAN.md) as hard delivery gates.

## Non-negotiable release checks

- Tenant isolation and authorisation are verified server-side.
- Financial actions are auditable and approval-controlled.
- API schemas, database migrations, and event schemas are reviewed before implementation.
- Secrets never enter source control.
- A backup restore drill passes before production release.
- UAT includes the seven scenarios in Document 39.
- Legal, privacy, retention, provider, and support owners are assigned before public launch.

## Known documentation status

Documents 07 and 25 are intentionally absent from the recovered source set. Do not create or infer them until their scope is approved through change control. The alternate Document 09 is retained as a variant, not a replacement for the canonical Document 09.
