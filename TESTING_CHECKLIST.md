# TESTING CHECKLIST

**Status:** release-oriented checklist based on current docs and code surface
**Tanggal audit:** 12 Agustus 2026

## Before code release

- `pnpm lint`
- `pnpm test`
- `pnpm build`

## Domain checks to expect

- Tenant isolation negative tests
- RBAC authorization tests
- Booking, quotation, and payment state tests
- Idempotency and sequence tests
- Migration validation on fresh database
- API and integration tests for public/private boundaries

## Release evidence still required

- CI green
- UAT evidence
- Device screenshots
- Load test on isolated staging
- Backup/restore rehearsal result

## Notes

- Do not mark a workflow complete without code, tests, and UAT evidence.
- Do not replace missing test evidence with documentation-only claims.

