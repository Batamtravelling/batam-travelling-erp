# PROJECT STATUS

**Tanggal audit:** 12 Agustus 2026
**Status:** living documentation berdasarkan kondisi repository aktual
**Sumber kebenaran teknis:** GitHub repository `Batamtravelling/batam-travelling-erp`

## Ringkasan kondisi saat ini

- Repository memiliki branch `main` yang tracking `origin/main`.
- PR `#17` sudah merged dan berisi konsolidasi knowledge docs.
- PR `#16` masih open, base ke `main`, head `codex/finance-controls`, dan saat audit ini masih `MERGEABLE` dengan merge state `CLEAN`.
- Monorepo menggunakan `pnpm`, `apps/api`, `apps/web`, dan Prisma migration di `apps/api/prisma`.
- Database production tidak disentuh oleh audit ini.

## Area yang sudah terlihat di kode

- Core domain sudah mencakup CRM, quotation, booking, payment, invoice, trip, operations, vendor, project, task, file archive, article, promotion, customer portal, dan audit/outbox.
- Prisma schema menunjukkan tenant-scoped data model dengan `tenantId` pada domain utama.
- Booking, quotation, payment, invoice, trip, and assignment memiliki state tersendiri.
- GitHub Actions CI tersedia di `.github/workflows/ci.yml`.

## Area yang belum boleh diasumsikan selesai

- Supabase staging atau hosting production.
- Load test pada staging terisolasi.
- Backup/restore rehearsal dengan hasil RTO/RPO.
- Visual QA pada perangkat nyata.
- Keputusan bisnis untuk refund, cancellation, reschedule, alerting, dan payment reversal.

## Dokumen yang harus tetap menjadi rujukan

- `AGENTS.md`
- `PROJECT_INSTRUCTIONS.md`
- `README.md`
- `docs/32_TECHNOLOGY_AND_ARCHITECTURE_DECISIONS.md`
- `docs/33_MVP_RELEASE_PLAN_AND_PRODUCT_BACKLOG.md`
- `docs/36_DATABASE_MIGRATION_AND_MASTER_DATA_PLAN.md`
- `docs/39_TEST_CASE_UAT_AND_TRACEABILITY_PLAN.md`
- `docs/41_OPERATIONS_RUNBOOK_AND_SUPPORT_MODEL.md`
- `docs/42_ENGINEERING_BOOTSTRAP_AND_REPOSITORY_STANDARDS.md`

## Dokumen lama yang berpotensi digabungkan

- `docs/codex-project/MODULE_ROADMAP.md` -> kandidat digabungkan ke `BACKLOG.md` atau `docs/33_MVP_RELEASE_PLAN_AND_PRODUCT_BACKLOG.md`
- `docs/CHATGPT_CODEX_HANDOFF_2026-08-12.md` -> konteks handoff, bukan baseline kanonik
- `docs/IMPLEMENTATION_STATUS_1_16.md` -> release gate, bukan status produk final

