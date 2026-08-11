# AI-01 — Agent Operating Protocol

## Workflow

1. Read `AGENTS.md`, `PROJECT_INSTRUCTIONS.md`, AI-00, this protocol, and only task-relevant specifications.
2. Inspect repository status, affected code paths, schema, tests, configuration, and recent commits.
3. Classify the change: `PATCH`, `FEATURE`, `REFACTOR`, `MIGRATION`, `SECURITY`, or `CROSS-MODULE`.
4. Map affected modules, contracts, data, permissions, tenant scope, audit, configuration, deployment, and rollback.
5. Identify unresolved business decisions. Do not convert implementation convenience into policy.
6. Implement the smallest coherent change using existing patterns.
7. Add or update tests, including negative and concurrency cases where relevant.
8. Run validation and inspect the diff for accidental or unrelated changes.
9. Synchronize affected documentation and provide an evidence-based completion report.

## Change Controls

- `MIGRATION` requires existing-data analysis, deployment ordering, rollback/recovery, and backup implications.
- `CROSS-MODULE` requires an explicit contract and impact map.
- `SECURITY` requires authorization, ownership, tenant-isolation, audit, and sensitive-data checks.
- Booking/payment/public-order changes require concurrency and idempotency review.

## Output Discipline

Report what changed, files changed, migrations/configuration, commands actually executed, results, tenant/authorization checks, documentation updates, risks/TBDs, and deployment/rollback notes. Never report a test as passed without execution evidence.

