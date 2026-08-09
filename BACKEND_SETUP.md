# Backend MVP setup

This repository now contains the first backend slice for the approved MVP:

- NestJS with Fastify in `apps/api`;
- PostgreSQL schema and versioned Prisma migration;
- tenant-scoped users, RBAC seed data, audit logs, and transactional outbox;
- customer and lead CRM APIs with validated lead-state transitions;
- package and pricing persistence models, including time/pax ranges and rule priority;
- OpenAPI starter contract at `apps/api/openapi.yaml` and interactive docs at `/docs` when the API runs.

## Local prerequisites

Install Docker Desktop (or provide a PostgreSQL 16 instance), then:

```powershell
Copy-Item .env.example .env
docker compose up -d
pnpm db:generate
pnpm db:migrate -- --name init
pnpm db:seed
pnpm dev
```

The seed command prints a tenant ID and user ID. In development, protected requests must send them as `x-tenant-id` and `x-dev-user-id`. These headers are explicitly rejected in production; production requires Cognito JWT validation and environment configuration before release.

## Current API scope

- `POST|GET /api/v1/customers`
- `GET|PATCH /api/v1/customers/:id`
- `POST|GET /api/v1/leads`
- `GET|PATCH /api/v1/leads/:id`
- `POST /api/v1/leads/:id/transition`

Commercial rules for quotations, bookings, invoices, payments, discounts, cancellations, and refunds are intentionally not implemented yet: several are defined as business decisions rather than technical defaults.

The package/pricing schema is intentionally data-only in this increment. API endpoints and automatic price selection follow after the selected pricing rule and its acceptance scenarios are confirmed.
