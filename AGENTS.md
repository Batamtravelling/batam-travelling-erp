# Batam Travelling ERP — Agent Instructions

These instructions apply to the whole repository. Human instructions remain authoritative, but an agent must not silently violate an approved business rule, security boundary, or data-integrity invariant.

## Project Context

- Monorepo: pnpm 11, Node.js 24.
- Web: Next.js 15 and React 19 in `apps/web`.
- API: NestJS 11 and Prisma 6 in `apps/api`.
- Database: PostgreSQL 16.
- Product: multi-tenant travel commerce, CRM, booking, POS, finance, operations, public content, and customer portal.
- Core product must not depend on AI features unless explicitly approved.

## Instruction Routing

Before changing code, read:

1. `PROJECT_INSTRUCTIONS.md` and the task-relevant canonical specification.
2. `docs/ai-governance/AI-00_AGENT_CONSTITUTION.md`.
3. `docs/ai-governance/AI-01_AGENT_OPERATING_PROTOCOL.md`.
4. Only the task-relevant governance files listed below.

- Architecture/cross-module → `AI-02`
- Booking, travel products, departures, POS, operations → `AI-03`
- API, website orders, webhooks, integrations → `AI-04`
- Prisma, PostgreSQL, migrations, identifiers → `AI-05`
- Authentication, authorization, tenant scope, audit → `AI-06`
- Refactor, replacement, legacy migration → `AI-07`
- Tests and validation → `AI-08`
- Review, merge, deploy, rollback → `AI-09`

Use `$batam-travelling-erp-guardian` for production-affecting changes, reviews, migrations, booking/payment logic, public ordering, or deployment preparation.

## Non-Negotiable Invariants

- Every tenant-owned query and write must be scoped by authoritative server-side tenant context.
- Booking status, payment status, invoice status, departure status, and operational trip status are separate state machines.
- Website, POS, CRM, and internal booking flows must share canonical domain services; do not copy business logic between controllers or UI pages.
- Prices, totals, discounts, capacity, and permissions must be validated on the backend.
- Financial finalization, refund, void, and verification must be auditable and retry-safe.
- Database, not UI, cache, search, seed data, or analytics, is the source of truth.
- Do not place localhost URLs, demo identities, credentials, or placeholder contacts in production data/configuration.
- Do not delete or rename existing public routes, database fields, transaction identifiers, or contracts without an approved compatibility plan.

## Transaction Identifier Rule

Booking codes use `BTV-YYYYMM-NNNN`. `YYYYMM` is derived from the booking travel/departure month using the canonical travel date. The sequence resets per tenant and travel month.

The sequence must be generated atomically in the database and unique per tenant and month. Never use `count() + 1`, `max() + 1` without locking, or client-generated sequencing. Concurrent requests, deletion, cancellation, historical imports, and retries must not produce duplicates or reuse a finalized code.

Apply the same reliability standard to invoice, payment, receipt, customer, lead, trip, and vendor identifiers.

## Public Content and Ordering

- Server-rendered public pages must use a production-safe server API origin, explicit cache policy, and observable error handling.
- Do not silently convert API/configuration failure into a normal empty-content state.
- Published content queries must enforce tenant, status, publication time, and visibility.
- Demo content must be isolated from production seeding and use deployable media URLs.
- Public order endpoints require validation, rate limiting, idempotency, capacity protection, canonical pricing, and transaction-safe creation of customer/lead/booking/invoice records.

## Change Discipline

- Inspect existing code, schema, tests, and recent history before editing.
- Prefer the smallest coherent patch. Do not rewrite working modules without explicit approval.
- Do not mix unrelated formatting, dependency upgrades, or broad renames into a business change.
- Never claim a command passed unless it was executed and its exit status was successful.
- Never deploy or merge on the user's behalf unless explicitly requested.

## Required Validation

For code changes, run the narrowest relevant checks, then before production handoff run:

```bash
pnpm lint
pnpm test
pnpm build
```

Use `pnpm check` when the full repository gate is appropriate. Database changes also require Prisma validation, migration review, existing-data assessment, and rollback/recovery notes.

## Completion Report

Report: change classification; behavior changed; files changed; migrations/configuration; tests actually run; authorization/tenant checks; documentation impact; remaining risks; deployment and rollback notes.

