# DATABASE RULES

**Status:** database governance summary
**Tanggal audit:** 12 Agustus 2026

## Observed database principles

- PostgreSQL is the authoritative transactional store.
- Prisma migration history exists in `apps/api/prisma/migrations`.
- Tenant-owned entities use `tenantId`.
- Business sequences are modeled in the database.
- Idempotency records are modeled in the database.
- Tenant payment policy menyimpan enforcement Four Eyes; absence policy diperlakukan sebagai secure default (`requireSeparateVerifier=true`).
- Quotation dapat menunjuk departure kanonik tanpa mengubah quotation lama yang bersifat private/flexible.
- Audit log and outbox event tables are present.

## Rules that must remain true

- Do not rely on client-side sequencing for transactional identifiers.
- Do not treat cache or search index as source of truth.
- Do not run migration on active production database without explicit approval.
- Do not silently change data model behavior without documenting the impact.

## Merge candidates

- `docs/36_DATABASE_MIGRATION_AND_MASTER_DATA_PLAN.md`
- `docs/14_DATABASE_ARCHITECTURE_AND_DATA_MODEL_SPECIFICATION.md`

