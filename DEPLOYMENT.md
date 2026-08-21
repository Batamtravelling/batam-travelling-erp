# DEPLOYMENT

**Status:** deployment guardrail summary
**Tanggal audit:** 21 Agustus 2026

## Current deployment posture

- Baseline provider conflict is resolved in favor of Vercel + Supabase.
- Production deployment is still not approved until the release evidence below is complete.
- Staging and VPS changes require explicit owner approval.
- Database migration on active environments is prohibited without explicit approval.

## Current architecture baseline

- Vercel hosts the Next.js application and NestJS HTTP API function.
- Supabase provides isolated PostgreSQL, Auth, and Storage resources for each environment.
- Managed Redis provides distributed rate limiting; the provider is operational configuration, not business source of truth.
- `DATABASE_URL` is the Supabase transaction pooler connection for Vercel runtime.
- `DIRECT_URL` is the Supabase direct/session connection used only by migration and administration commands.
- The superseded AWS baseline is not an active deployment target.

## Safe order of work

1. Provision isolated Supabase and Redis resources for Preview/Staging.
2. Configure environment-scoped Vercel variables without copying production secrets into Preview.
3. Verify production environment keys with `pnpm verify:production-env`.
4. Apply reviewed Prisma migrations through `DIRECT_URL` outside the request lifecycle.
5. Run lint, tests, build, Supabase advisors, smoke tests, and backup/restore rehearsal.
6. Promote the tested Vercel artifact only after explicit owner approval.

## Rollback boundary

- Application rollback: re-point production to the previous known-good Vercel deployment.
- Database rollback: prefer backward-compatible migrations and a forward fix; restore only from verified backup with explicit approval.
- Storage/Auth changes require their own recovery evidence and are not rolled back by a Vercel deployment rollback.

## Documents to keep separate

- `docs/13_DEPLOYMENT_DEVOPS_INFRASTRUCTURE_SPECIFICATION.md`
- `docs/41_OPERATIONS_RUNBOOK_AND_SUPPORT_MODEL.md`

