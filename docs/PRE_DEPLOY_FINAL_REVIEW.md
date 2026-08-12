# Batam Travelling ERP — Final Pre-Deploy Review

Deployment is prohibited until every required item below is evidenced and approved by the owner.

## Ownership and recovery

- [ ] Supabase organization belongs to PT Batam Travel Indonesia / Kariadi, not a third party.
- [ ] Owner and recovery email are controlled by the company.
- [ ] MFA is enabled for GitHub, Supabase, hosting, and recovery email.
- [ ] At least two named company administrators exist.
- [ ] Secrets are stored only in the hosting secret manager.

## Database bootstrap (run only after approval)

1. Take a Supabase backup or create an isolated staging project.
2. Set `DATABASE_URL` to the Supabase session/direct connection.
3. Run `pnpm --filter @batam/api exec prisma migrate deploy`.
4. Set `ERP_OWNER_EMAIL` to exactly the email created in Supabase Auth.
5. Run `NODE_ENV=production pnpm db:seed` once.
6. Confirm `_prisma_migrations`, `tenants`, the owner user, roles, and permissions.
7. Run Supabase security and performance advisors.
8. Create a private `erp-private` Storage bucket and verify public access is disabled.
9. Verify payment-proof signed URLs expire and cannot be opened anonymously.

## Release gates

- [ ] `pnpm check` passes from a clean checkout.
- [ ] Production dependency audit reports zero known vulnerabilities.
- [ ] Empty-database migration test passes.
- [ ] Tenant-isolation, permission, idempotency, capacity, and payment concurrency tests pass.
- [ ] Backup and restore rehearsal passes on an isolated database.
- [ ] K6 staging thresholds pass.
- [ ] Android and desktop screenshots are reviewed.
- [ ] Package/itinerary print and Save-as-PDF are reviewed on Android Chrome and desktop Chrome.
- [ ] Private payment-proof upload, MIME validation, signed access, verification, and audit trail pass.
- [ ] No example phone, local URL, development header, or secret appears in production.
- [ ] Owner gives explicit deploy approval after final review.

## Rollback

- Preserve the previous application image and database backup.
- Stop rollout when readiness fails or error/latency thresholds regress.
- Roll back the application first; database rollback requires an approved forward-fix or tested restore plan.
- Run `scripts/backup-restore-rehearsal.sh` only with `ALLOW_RESTORE_REHEARSAL=true` and a non-production `RESTORE_DATABASE_LABEL`.
