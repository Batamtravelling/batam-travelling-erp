# AI-05 — Database and Data Integrity Governance

## Baseline

PostgreSQL and approved domain services are canonical. Prisma models, migrations, constraints, indexes, and transactions must preserve business and tenant invariants.

## Tenant and Integrity Rules

- Scope all tenant-owned reads/writes and tenant-local unique constraints by `tenantId`.
- Preserve tenant scope in background jobs, exports, reports, caches, search, and analytics.
- Use foreign keys and database constraints for invariants that must survive application bugs.
- Store money consistently according to the approved model; do not mix currency or floating-point assumptions.
- Preserve timezone semantics and use one documented business timezone policy.
- Treat transaction identifiers as immutable business references.

## Atomic Identifier Allocation

Never generate booking, invoice, payment, receipt, lead, customer, trip, or vendor sequences with `count() + 1`. Use a tenant-and-period counter row, database sequence strategy, or another atomic design with a unique constraint and bounded retry. Test simultaneous requests and retry behavior.

## Migration Gate

Assess existing data, backfill, null/default behavior, uniqueness conflicts, indexes/locking, application compatibility, deployment order, rollback/recovery, backup, and verification query. Destructive changes require explicit approval and a tested recovery path.

