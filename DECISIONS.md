# DECISIONS

**Status:** decision register summary
**Tanggal audit:** 13 Agustus 2026

## Decisions already reflected in repository

- Monorepo uses `pnpm` and Node 24.
- API is NestJS + Prisma.
- Web is Next.js + React.
- PostgreSQL is the transactional database.
- Tenant-scoped data model is required.
- AI is excluded from initial core scope.
- Refund sampai dengan Rp5.000.000 memerlukan persetujuan Finance Manager.
- Refund di atas Rp5.000.000 memerlukan dua persetujuan berurutan: Finance Manager lalu Owner; Owner tidak menggantikan pemeriksaan Finance Manager.
- Requester tidak boleh menjadi approver dan refund hanya dapat dieksekusi setelah semua approval selesai.

## Decision record — Refund approval v1.0

- **Tanggal keputusan:** 13 Agustus 2026.
- **Alasan:** menutup risiko self-approval, refund bernilai besar tanpa oversight, duplicate execution, dan ledger outflow sebelum approval lengkap.
- **Dampak implementasi:** workflow request/manager approval/owner approval/rejection/execution terpisah; tenant policy default Rp5.000.000; permission refund terpisah; execution idempotent; approval, bukti, reference, executor, dan audit lineage wajib disimpan.

## Infrastructure decision — Vercel + Supabase v2.0

- **Tanggal keputusan:** 21 Agustus 2026.
- Vercel menjalankan Next.js dan NestJS HTTP API.
- Supabase menyediakan PostgreSQL, Auth, dan Storage.
- Runtime Prisma di Vercel memakai Supavisor transaction pooler melalui `DATABASE_URL`.
- Migration Prisma memakai koneksi direct/session terpisah melalui `DIRECT_URL`.
- Preview dan Production wajib memakai Supabase serta Redis yang terisolasi.
- AWS baseline 9 Agustus 2026 disupersede; AWS tetap menjadi opsi migrasi masa depan melalui ADR baru jika kebutuhan terukur membenarkannya.

## Decisions that appear approved in docs

- Vercel + Supabase production baseline in `docs/32_TECHNOLOGY_AND_ARCHITECTURE_DECISIONS.md`.
- Release gate items 1-16 in `docs/IMPLEMENTATION_STATUS_1_16.md`.
- MVP sequence in `docs/33_MVP_RELEASE_PLAN_AND_PRODUCT_BACKLOG.md`.

## Decisions still open

- Cancellation and reschedule policy.
- Invoice void/replacement policy.
- Payment reversal policy.
- Reminder and alert ownership.
- Redis provider, external error-monitoring provider, production region alignment, and operational owners.

## Merge candidates

- `docs/CHATGPT_CODEX_HANDOFF_2026-08-12.md` should remain a contextual decision-history artifact, not a replacement for canonical ADRs.
- `docs/codex-project/MODULE_ROADMAP.md` should be folded into the backlog or archived as a working note.

