# ChatGPT → Codex Project Handoff

**Tanggal:** 12 Agustus 2026  
**Status:** catatan konteks untuk direkonsiliasi dengan kode dan dokumen kanonik  
**Ruang lingkup:** pengetahuan penting dari percakapan pemilik proyek Batam Travelling ERP  
**Bukan:** bukti implementasi, persetujuan deployment, atau pengganti spesifikasi kanonik

## 1. Cara menggunakan dokumen ini

Dokumen ini membawa konteks yang sebelumnya hanya hidup dalam percakapan ChatGPT ke repository agar dapat ditemukan oleh Codex dan developer berikutnya.

Urutan otoritas tetap:

1. Instruksi manusia terbaru.
2. `AGENTS.md`.
3. Kode, schema, migration, test, dan CI sebagai bukti implementasi.
4. Dokumen kanonik yang dirujuk `PROJECT_INSTRUCTIONS.md`.
5. Dokumen ini sebagai handoff konteks.

Jika handoff ini berbeda dari kode atau dokumen yang sudah disetujui, jangan diam-diam memilih salah satu. Catat konflik sebagai **BUSINESS DECISION REQUIRED** atau **ARCHITECTURE DECISION REQUIRED**.

## 2. Identitas dan tujuan bisnis

- Produk: ERP internal dan platform operasional untuk **Batam Travelling Tour and Travel** / **PT Batam Travel Indonesia**.
- Tujuan: satu sistem terintegrasi untuk menerima lead, menjual paket, membuat quotation/booking, menerima pembayaran, merencanakan operasi trip, menugaskan staf/vendor, mencatat keuangan, dan menyajikan laporan.
- Sistem harus praktis untuk pekerjaan lapangan, bukan sekadar demo atau company profile.
- Prioritas saat ini adalah memastikan logika ERP benar-benar dapat digunakan sebelum staging.
- AI berat bukan kebutuhan inti ERP dan tidak boleh menjadi dependency utama tanpa persetujuan.

## 3. Batas pengerjaan yang berlaku

- Jangan deploy ke staging atau VPS sebelum logika inti, test, dan keputusan bisnis yang memblokir selesai.
- Jangan menjalankan migration pada database aktif tanpa audit, backup/rollback plan, dan persetujuan eksplisit.
- Jangan mengubah Supabase menjadi Appwrite; gagasan tersebut telah dibatalkan.
- Jangan menyatakan fitur selesai hanya karena halaman/UI tersedia.
- Jangan menghapus dokumentasi lama selama konsolidasi awal.
- Jangan mencampur perubahan dokumentasi ini dengan PR fitur/keuangan seperti PR #16.
- Rahasia, token, password, `.env`, bukti pembayaran, dan data pelanggan tidak boleh masuk Git.

## 4. Modul dan alur yang harus tetap terintegrasi

### Modul komersial

- CRM: lead, customer, histori komunikasi, follow-up, sumber lead, dan repeat customer.
- Package Builder: paket, varian, itinerary, inclusion/exclusion, gambar, harga, biaya, add-on, dan surcharge berbasis jadwal.
- Quotation: versioning, approval, print/PDF, pengiriman, acceptance/rejection, dan konversi ke booking.
- Booking/POS: transaksi dari website, sales, walk-in, dan channel lain memakai domain service yang sama.
- Invoice, payment, receipt, payment proof, refund/void/reversal dengan audit trail.
- Archive tidak boleh memutus histori transaksi atau mengubah laporan keuangan.

### Modul operasional

- Departure schedule/open trip dengan kapasitas maksimum.
- Peringatan kapasitas hampir penuh dan perlindungan overselling.
- Manifest dan daftar peserta.
- Assignment: Tour Guide, Leader, Driver, PIC/Editor, Admin Reservasi, dan staf lain.
- Vendor: ferry, hotel, boat, transport, guide, aktivitas, dokumentasi, dan biaya.
- Planner, workflow, project, task, deadline, konflik jadwal, serta checklist kesiapan trip.
- Trip completion, incident log, dan feedback harus tetap dapat ditelusuri ke booking.

### Modul manajemen dan kontrol

- Dashboard berbasis role: Owner, Manager, karyawan yang relevan, dan portal pelanggan.
- KPI/diagram untuk penjualan, booking, pembayaran, piutang, kapasitas, operasional, task, revenue, cost, dan margin.
- Employee lifecycle: menambah, mengubah role, menonaktifkan, mempertahankan histori assignment/audit, dan mencegah akses setelah nonaktif.
- RBAC, tenant isolation, audit log, approval, notifikasi, file/document management, backup/DR, observability, dan QA.

## 5. Aturan bisnis yang sudah menjadi arah produk

- Satu data sumber untuk entitas utama; hindari database dan logika terpisah per channel.
- Customer menjadi pusat histori lead → quotation → booking → invoice → payment → trip → feedback.
- Harga, surcharge, discount, total, kapasitas, dan permission divalidasi di backend.
- Booking, payment, invoice, departure, dan trip operation adalah state machine terpisah.
- Package content dari back office harus dapat dipakai ulang oleh website, POS, quotation, itinerary, dan dokumen.
- Dokumen bisnis harus dapat dipreview, dicetak/dibuat PDF, dikirim, dan disimpan pada histori transaksi/CRM.
- Revenue dan cost harus tetap terhubung ke sumbernya agar profit dapat dihitung per booking, trip, package, customer, sales, dan periode.
- Peringatan kursi hampir penuh harus informatif; proteksi kapasitas dan transaksi tetap menjadi otoritas backend.
- Public website dan internal ERP memiliki boundary akses yang ketat, tetapi alur produk/order/booking harus tersambung melalui API/domain service yang aman.
- Customer portal ditujukan untuk melihat progres booking dan dokumen yang memang berhak dilihat pelanggan.

## 6. Open trip sebagai skenario acuan

Skenario yang pernah dibahas dan berguna untuk acceptance test:

- Open Trip Singapore, target keberangkatan 22 Desember, kapasitas maksimum 25 peserta.
- Sales/team fokus menjual sampai penuh.
- Sistem menunjukkan sold/remaining/almost full secara konsisten.
- Staf seperti Tour Guide dan Leader dapat ditugaskan tanpa bentrok jadwal.
- Semua booking peserta, pembayaran, manifest, kapasitas, assignment, dan kesiapan operasi terhubung ke departure yang sama.

Tanggal/tarif pada data contoh bukan otomatis master data produksi; validasi dengan keputusan bisnis dan data package aktif.

## 7. UI/UX yang diharapkan

- Warna utama: navy, yellow, white, black.
- Modern, sederhana, elegan, konsisten antarmodul.
- Hindari tampilan “aplikasi jadul”, kartu/icon berlebihan, dan dekorasi yang mengurangi keterbacaan.
- Tabel data, form, navigation, dashboard, dan status harus jelas pada desktop maupun mobile.
- Owner/Manager membutuhkan ringkasan visual, tetapi chart tidak boleh menggantikan angka sumber dan drill-down.
- Review perangkat nyata dan screenshot staging tetap menjadi release evidence, bukan pekerjaan lokal yang dapat diasumsikan selesai.

## 8. Status dan pekerjaan yang masih harus dianggap terbuka

Gunakan `docs/IMPLEMENTATION_STATUS_1_16.md` sebagai release gate. Secara khusus:

- Supabase staging nyata belum boleh dianggap selesai hanya karena migration tersedia.
- Load test harus dijalankan pada staging terisolasi, bukan production.
- Review visual perangkat nyata memerlukan bukti Android dan desktop.
- Backup/restore rehearsal memerlukan target terisolasi dan hasil RTO/RPO.
- Audit final dilakukan setelah bukti tahap sebelumnya lengkap.
- Kebijakan cancellation, reschedule, refund threshold/four-eyes, invoice void/replacement, payment reversal authority, reminder delivery, dan alert ownership tetap membutuhkan keputusan bisnis eksplisit.

## 9. Konflik arsitektur yang wajib direkonsiliasi

**ARCHITECTURE DECISION REQUIRED**

Percakapan terbaru mempertahankan Supabase dan menyebut Hostinger VPS sebagai target deployment praktis. Namun `docs/32_TECHNOLOGY_AND_ARCHITECTURE_DECISIONS.md` menetapkan AWS RDS, ECS Fargate, Cognito, ElastiCache, S3, dan region Jakarta sebagai approved baseline.

Sebelum staging atau perubahan infrastruktur:

1. Audit implementasi dan biaya aktual.
2. Tentukan baseline resmi: Supabase + Hostinger, AWS, atau arsitektur transisi yang terdokumentasi.
3. Buat/revisi ADR dengan konsekuensi, security model, backup, scaling, cost, migration/exit plan, dan owner approval.
4. Sinkronkan dokumen deployment, environment register, auth, storage, observability, dan migration plan.
5. Jangan menjalankan dua baseline production secara diam-diam.

## 10. Aturan kerja Codex setelah handoff

- Mulai dari `main` terbaru dan baca `AGENTS.md` serta dokumen task-relevant.
- Satu kelompok perubahan koheren = satu branch = satu PR.
- Jangan bekerja bersamaan pada modul yang sama tanpa worktree/ownership yang jelas.
- Untuk setiap perubahan: laporkan perilaku, file, migration/config, test aktual, RBAC/tenant checks, risiko, deployment, dan rollback.
- Simpan keputusan bisnis baru di dokumen keputusan yang kanonik; jangan biarkan keputusan penting hanya berada di chat.
- Perbarui status hanya berdasarkan bukti repository/CI/UAT.
- Merge dan deployment memerlukan instruksi eksplisit pemilik.

## 11. Dokumen repository yang harus dibaca lebih dahulu

- `AGENTS.md`
- `PROJECT_INSTRUCTIONS.md`
- `BATAM_TRAVELLING_ERP_KNOWLEDGE.md`
- `docs/IMPLEMENTATION_STATUS_1_16.md`
- `docs/codex-project/MODULE_ROADMAP.md`
- `docs/32_TECHNOLOGY_AND_ARCHITECTURE_DECISIONS.md`
- `docs/33_MVP_RELEASE_PLAN_AND_PRODUCT_BACKLOG.md`
- Spesifikasi bernomor yang relevan dengan task
- Governance/skill yang diarahkan oleh `AGENTS.md`

## 12. Langkah aman berikutnya

1. Review handoff ini dan tandai fakta yang sudah usang.
2. Rekonsiliasi konflik Supabase/Hostinger vs AWS melalui ADR, tanpa deploy.
3. Audit PR terbuka secara terpisah; PR #16 tidak boleh berubah akibat handoff ini.
4. Pilih satu modul prioritas setelah gate PR saat ini selesai.
5. Pertahankan staging sebagai pekerjaan tertunda sampai logika ERP dan keputusan bisnis memadai.
