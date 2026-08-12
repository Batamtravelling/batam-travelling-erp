# DECISIONS

**Status:** decision register summary
**Tanggal audit:** 12 Agustus 2026

## Decisions already reflected in repository

- Monorepo uses `pnpm` and Node 24.
- API is NestJS + Prisma.
- Web is Next.js + React.
- PostgreSQL is the transactional database.
- Tenant-scoped data model is required.
- AI is excluded from initial core scope.

## Decisions that appear approved in docs

- AWS-based production baseline in `docs/32_TECHNOLOGY_AND_ARCHITECTURE_DECISIONS.md`.
- Release gate items 1-16 in `docs/IMPLEMENTATION_STATUS_1_16.md`.
- MVP sequence in `docs/33_MVP_RELEASE_PLAN_AND_PRODUCT_BACKLOG.md`.

## Decisions still open

- Refund policy and approval threshold.
- Cancellation and reschedule policy.
- Invoice void/replacement policy.
- Payment reversal policy.
- Reminder and alert ownership.
- Staging and production infrastructure reconciliation if the team reconsiders the AWS baseline.

## Merge candidates

- `docs/CHATGPT_CODEX_HANDOFF_2026-08-12.md` should remain a contextual decision-history artifact, not a replacement for canonical ADRs.
- `docs/codex-project/MODULE_ROADMAP.md` should be folded into the backlog or archived as a working note.

