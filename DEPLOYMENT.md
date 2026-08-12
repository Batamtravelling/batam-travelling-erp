# DEPLOYMENT

**Status:** deployment guardrail summary
**Tanggal audit:** 12 Agustus 2026

## Current deployment posture

- Production deployment is not approved by this audit.
- Staging and VPS changes require explicit owner approval.
- Database migration on active environments is prohibited without explicit approval.

## Current architecture baseline

- The approved baseline document currently states AWS RDS, ECS Fargate, S3, CloudFront, Cognito, Redis, and Jakarta region.
- The handoff document notes a conflict between that baseline and earlier Supabase/Hostinger discussion.
- This conflict must be reconciled before any infrastructure move.

## Safe order of work

1. Finalize business decisions that block workflows.
2. Verify code, tests, and CI evidence.
3. Reconcile infrastructure baseline.
4. Prepare migration and rollback plan.
5. Only then consider staging or production deployment with approval.

## Documents to keep separate

- `docs/13_DEPLOYMENT_DEVOPS_INFRASTRUCTURE_SPECIFICATION.md`
- `docs/41_OPERATIONS_RUNBOOK_AND_SUPPORT_MODEL.md`

