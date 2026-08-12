# BUSINESS RULES

**Status:** canonical working summary
**Tanggal audit:** 13 Agustus 2026

## Prinsip bisnis inti

- Multi-tenant boundary harus ditegakkan di server.
- Customer adalah pusat histori bisnis dan tidak dibuat ulang untuk setiap transaksi.
- CRM mengelola hubungan dan pipeline; Booking menjadi jembatan transaksi ke Finance dan Operations.
- Quotation, booking, invoice, payment, departure, trip, assignment, dan task memiliki lifecycle masing-masing tetapi saling terhubung melalui identifier yang stabil.
- Pricing, capacity, approval, dan access control divalidasi di backend.
- Database adalah sumber kebenaran, bukan UI, cache, atau spreadsheet operasional.
- Data transaksi tidak boleh dihapus atau ditulis ulang hanya untuk memperbaiki histori; koreksi harus mempertahankan audit trail.

## CRM dan customer lifecycle

1. Inquiry dari website, WhatsApp, Instagram, referral, walk-in, atau input manual dibuat sebagai Lead.
2. Lead menyimpan source, kebutuhan perjalanan, produk/minat, tanggal perjalanan, jumlah peserta, kontak, owner/PIC sales, follow-up berikutnya, dan status pipeline.
3. Pipeline minimum: `NEW -> CONTACTED -> QUALIFIED -> QUOTATION_SENT -> NEGOTIATION -> WON/LOST`.
4. Lead belum merupakan revenue dan belum boleh diperlakukan sebagai booking hanya karena customer meminta harga.
5. Saat identitas customer sudah cukup, lead ditautkan ke Customer yang sama; sistem harus mencegah duplikasi kontak lintas lead dalam tenant sesuai aturan normalisasi yang berlaku.
6. Customer menyimpan histori lead, quotation, booking, pembayaran, aktivitas, dan nilai hubungan untuk kebutuhan Customer 360.
7. Setiap lead dan booking harus memiliki ownership yang jelas agar follow-up dan pelayanan tidak kehilangan PIC.

## Quotation dan pricing

- Sales memilih produk/package dan komponen harga dari sumber produk yang kanonik; harga transaksi tidak boleh bergantung pada input bebas frontend.
- Backend menentukan base price, participant category, service level, room/unit, add-on, surcharge berbasis tanggal, diskon yang diizinkan, dan komponen lain yang berlaku.
- Quotation adalah penawaran dan belum menjadi pendapatan.
- Quotation yang diterima dapat dikonversi menjadi Booking tanpa mengetik ulang customer, itinerary, participant, dan komponen harga.
- Override harga atau diskon di luar batas kewenangan harus melalui approval dan audit trail.

## Booking sebagai pusat transaksi

- Booking adalah transaksi komersial utama yang menghubungkan CRM, Finance, Operations, Vendor, Documents, dan Reporting.
- Booking menyimpan price snapshot pada saat transaksi dikonfirmasi. Perubahan harga package di masa depan tidak boleh mengubah booking lama.
- Booking harus mempertahankan lineage ke quotation bila berasal dari quotation.
- Booking harus mempertahankan participant count, travel/service date, package/departure, sales owner, operational PIC, dan komponen harga yang membentuk total.
- Booking ke Open Trip/departure wajib memeriksa kapasitas di backend dan tidak boleh menyebabkan overselling walaupun dua transaksi terjadi bersamaan.
- Pembatalan/reschedule yang memengaruhi kapasitas harus melepaskan atau memindahkan kapasitas secara atomik setelah kebijakan bisnis disetujui.

## Invoice dan payment

- Invoice merepresentasikan tagihan terhadap booking; Booking dan Invoice tidak boleh dianggap sama.
- Upload payment proof tidak berarti pembayaran telah diterima.
- Payment lifecycle minimum: `PENDING_VERIFICATION -> VERIFIED/REJECTED`.
- Hanya payment `VERIFIED` yang boleh memengaruhi paid amount, outstanding balance, receipt, dan canonical financial ledger.
- Outstanding dihitung dari kewajiban invoice dikurangi payment terverifikasi dan adjustment sah; angka ini tidak boleh diketik manual sebagai sumber kebenaran.
- Payment yang sudah masuk ledger tidak dihapus. Koreksi menggunakan refund/reversal workflow yang mempertahankan lineage dan audit trail.
- CRM boleh menampilkan status pembayaran, tetapi Finance/ledger tetap menjadi sumber kebenaran finansial.

## Operations dan assignment

- Booking yang memenuhi syarat operasional menghasilkan atau ditautkan ke departure/trip yang relevan.
- Assignment untuk PIC, tour guide, driver, dan personel lain harus mereferensikan trip/departure/booking yang benar dan tenant yang sama.
- Manifest/participant list berasal dari data booking yang kanonik, bukan salinan manual terpisah.
- Vendor cost, transport, hotel, boat, attraction, guide, dan kebutuhan lain harus dapat ditautkan kembali ke booking/trip agar margin dapat dihitung.

## Reporting

Dashboard dan laporan harus dapat menurunkan metrik dari data transaksi kanonik, termasuk lead volume, lead source, follow-up due, conversion rate, quotation-to-booking, booking value, verified revenue, outstanding, occupancy, cost, gross margin, sales performance, repeat customer, dan product performance.

## Aturan yang tercermin di schema/repository

- Booking code, quotation number, invoice number, payment number, trip code, dan lead code memakai identitas unik per tenant.
- Package dan departure memiliki relasi ke itinerary, components, gallery, assignments, dan bookings.
- Payment proof disimpan sebagai entitas terpisah dengan akses terproteksi.
- Audit log dan outbox event tersedia untuk jejak perubahan dan integrasi.
- Canonical financial ledger menerima payment yang telah diverifikasi dengan lineage ke payment/invoice/booking.

## Aturan yang masih perlu keputusan bisnis eksplisit

- Refund threshold dan four-eyes approval.
- Cancellation dan reschedule eligibility, fee, dan kapasitas release.
- Invoice void/replacement policy.
- Payment reversal authority.
- Payment reminder channel, provider, dan jadwal.
- Alert ownership dan escalation path.
- Package-specific DP/final payment exceptions.
- Batas diskon/price override per role.

## Dokumen lama yang tumpang tindih

- `PROJECT_INSTRUCTIONS.md` memuat prinsip bisnis umum dan perlu dianggap sebagai landasan, bukan satu-satunya detail operasional.
- `docs/03_BUSINESS_RULES_AND_POLICY.md` adalah kandidat utama untuk digabungkan dengan dokumen ini bila ingin satu sumber aturan bisnis yang lebih rapi.
