# BUSINESS RULES

**Status:** canonical working summary
**Tanggal audit:** 12 Agustus 2026

## Prinsip bisnis yang sudah terbukti di repository

- Multi-tenant boundary harus ditegakkan di server.
- Customer adalah pusat histori bisnis.
- Quotation, booking, invoice, payment, departure, trip, dan task adalah alur yang terpisah tetapi saling terhubung.
- Pricing, capacity, approval, dan access control divalidasi di backend.
- Database adalah sumber kebenaran, bukan UI atau cache.

## Aturan yang tercermin di schema

- Booking code, quotation number, invoice number, payment number, trip code, dan lead code memakai identitas unik per tenant.
- Package dan departure memiliki relasi ke itinerary, components, gallery, assignments, dan bookings.
- Payment proof disimpan sebagai entitas terpisah dengan akses terproteksi.
- Audit log dan outbox event tersedia untuk jejak perubahan dan integrasi.

## Aturan yang masih perlu keputusan bisnis eksplisit

- Refund threshold dan four-eyes approval.
- Cancellation dan reschedule eligibility, fee, dan kapasitas release.
- Invoice void/replacement policy.
- Payment reversal authority.
- Payment reminder channel, provider, dan jadwal.
- Alert ownership dan escalation path.
- Package-specific DP/final payment exceptions.

## Dokumen lama yang tumpang tindih

- `PROJECT_INSTRUCTIONS.md` memuat prinsip bisnis umum dan perlu dianggap sebagai landasan, bukan satu-satunya detail operasional.
- `docs/03_BUSINESS_RULES_AND_POLICY.md` adalah kandidat utama untuk digabungkan dengan dokumen ini bila ingin satu sumber aturan bisnis yang lebih rapi.

