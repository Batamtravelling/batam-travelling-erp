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
- Data transaksi yang sudah posted tidak boleh dihapus atau ditulis ulang untuk memperbaiki histori; koreksi harus mempertahankan audit trail melalui adjustment, refund, atau reversal.
- Setiap angka keuangan harus dapat ditelusuri dari Dashboard -> Ledger -> Transaction -> Invoice/Payment -> Booking -> Customer dan sebaliknya.

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
- Satu invoice dapat dibayar melalui beberapa payment.
- Arsitektur Finance tidak boleh mengasumsikan Payment dan Invoice selalu one-to-one; satu transfer dapat dialokasikan ke beberapa invoice bila business flow membutuhkannya.
- CRM boleh menampilkan status pembayaran, tetapi Finance/ledger tetap menjadi sumber kebenaran finansial.

## Fondasi Finance dan Transaction Control

### Canonical financial ledger

- Semua kejadian bisnis yang berdampak keuangan harus bermuara pada ledger kanonik.
- Posting ledger harus berasal dari business event yang sah seperti verified payment, approved refund, vendor payment, approved adjustment, atau reversal; bukan angka bebas dari dashboard.
- Setiap ledger entry wajib mempertahankan lineage ke transaksi sumber yang relevan.
- Payment yang telah posted ke ledger tidak boleh dihapus.

### Transaction Journal, Adjustment, dan Reversal

- Sistem menyediakan mekanisme Transaction Journal & Adjustment untuk salah nominal, duplicate payment, overpayment, underpayment, salah alokasi, biaya tambahan, koreksi vendor cost, write-off, refund, customer credit, dan koreksi periode sebelumnya.
- Koreksi transaksi posted dilakukan dengan transaksi lawan/reversal atau adjustment baru, bukan mengubah histori asli.
- Adjustment minimum menyimpan reason, createdBy, approvedBy bila diperlukan, originalTransactionId/reference, timestamp, tenant, dan audit trail.
- Reversal harus idempotent: transaksi yang sama tidak boleh direversal dua kali.
- Automatic payment ledger tidak boleh dibatalkan melalui manual cashflow; harus melalui payment/refund workflow yang sah.

### Approval engine

- Approval ditentukan berdasarkan transaction type, nominal, risiko, role, dan tenant policy.
- Sistem harus mendukung approval bertingkat, misalnya Sales -> Manager, Finance -> Finance Manager, atau Finance -> Manager -> Owner.
- Discount/price override, refund, manual journal, write-off, dan locked-period adjustment dapat memiliki threshold approval berbeda.
- Approval tidak boleh dilakukan oleh user tanpa permission yang sesuai; keputusan approval wajib masuk audit trail.

### Accounting period lock

- Periode accounting yang sudah ditutup tidak boleh diedit secara diam-diam.
- Backdated transaction ke periode terkunci harus ditolak atau diarahkan ke controlled adjustment sesuai policy.
- Membuka kembali periode harus merupakan privileged action dengan alasan dan audit trail.

### Bank reconciliation

- Verified payment dan settlement pada rekening/bank merupakan dua fakta yang harus dapat direkonsiliasi.
- Reconciliation minimal mengenali `MATCHED`, `UNMATCHED`, `PARTIAL_MATCH`, `DUPLICATE`, `OVERPAYMENT`, dan `NEEDS_REVIEW`.
- Unmatched transaction tidak boleh disembunyikan hanya agar laporan terlihat seimbang.

### Overpayment dan customer credit

- Bila payment melebihi kewajiban invoice, kelebihan tidak boleh menaikkan nilai invoice.
- Kelebihan dicatat sebagai unapplied amount/customer credit dengan lineage ke payment asal.
- Customer credit dapat dialokasikan ke invoice/booking lain atau direfund hanya melalui workflow dan approval yang sah.

### Payment allocation

- Satu invoice dapat memiliki banyak payment allocation.
- Satu payment dapat dialokasikan ke satu atau beberapa invoice bila diperlukan.
- Total allocation tidak boleh melebihi available payment amount.
- Paid dan outstanding invoice dihitung dari allocation/payment yang sah, bukan field manual.

### Refund

- Refund bukan delete atau edit payment asli.
- Flow minimum: `REFUND_REQUESTED -> APPROVAL -> REFUND_EXECUTED/REJECTED`.
- Refund yang dieksekusi menghasilkan financial outflow/ledger entry baru dengan lineage ke payment, invoice, booking, customer, dan approval terkait.
- Cancellation/reschedule harus menghitung refund, credit, cancellation fee, tambahan harga, dan capacity effect sesuai policy.

### Multi-currency

- Sistem harus siap menyimpan transaction currency, transaction amount, exchange rate, base currency, dan base amount untuk transaksi multi-currency.
- Exchange rate yang dipakai transaksi harus menjadi snapshot; perubahan kurs berikutnya tidak mengubah histori transaksi.
- Kebijakan sumber kurs dan realized/unrealized FX treatment harus diputuskan sebelum fitur multi-currency diaktifkan penuh.

### Receivable, payable, cost, dan margin

- Customer receivable/cash inflow harus dibedakan dari vendor payable/cost outflow.
- Hotel, ferry/boat, transport, attraction, guide, vendor, dan operational cost harus dapat ditelusuri ke booking/trip/departure yang relevan.
- Profitability harus dapat dihitung per Booking, Trip, Departure, Package/Product, Sales Channel, Customer Segment, dan periode.
- Gross profit dan margin tidak boleh hanya berasal dari angka manual dashboard.

### Budget vs actual

- Trip/departure dapat memiliki budget biaya sebelum operasional.
- Actual cost berasal dari transaksi/vendor cost yang telah dicatat secara sah.
- Variance material harus terlihat dan dapat menjadi exception untuk review.

### Exception dan risk dashboard

Owner/Finance membutuhkan exception view yang menonjolkan masalah, minimal:

- payment terlalu lama pending verification;
- overdue outstanding;
- duplicate payment;
- overpayment/customer credit belum terselesaikan;
- unmatched bank transaction;
- negative atau abnormal margin;
- vendor cost melebihi budget;
- manual adjustment/refund besar;
- backdated/locked-period attempt;
- abnormal discount/price override;
- repeated reversal;
- verified payment yang gagal memiliki canonical ledger entry;
- ledger/payment/invoice lineage mismatch.

## Operations dan assignment

- Booking yang memenuhi syarat operasional menghasilkan atau ditautkan ke departure/trip yang relevan.
- Assignment untuk PIC, tour guide, driver, dan personel lain harus mereferensikan trip/departure/booking yang benar dan tenant yang sama.
- Manifest/participant list berasal dari data booking yang kanonik, bukan salinan manual terpisah.
- Vendor cost, transport, hotel, boat, attraction, guide, dan kebutuhan lain harus dapat ditautkan kembali ke booking/trip agar margin dapat dihitung.

## Reporting

Dashboard dan laporan harus dapat menurunkan metrik dari data transaksi kanonik, termasuk lead volume, lead source, follow-up due, conversion rate, quotation-to-booking, booking value, verified revenue, outstanding, occupancy, cost, gross margin, sales performance, repeat customer, product performance, customer credit, reconciliation exceptions, budget variance, dan adjustment/reversal activity.

## Aturan yang tercermin di schema/repository

- Booking code, quotation number, invoice number, payment number, trip code, dan lead code memakai identitas unik per tenant.
- Package dan departure memiliki relasi ke itinerary, components, gallery, assignments, dan bookings.
- Payment proof disimpan sebagai entitas terpisah dengan akses terproteksi.
- Audit log dan outbox event tersedia untuk jejak perubahan dan integrasi.
- Canonical financial ledger menerima payment yang telah diverifikasi dengan lineage ke payment/invoice/booking.

## Aturan yang masih perlu keputusan bisnis eksplisit

- Nilai threshold dan four-eyes approval untuk refund, adjustment, discount, write-off, dan journal.
- Cancellation dan reschedule eligibility, fee, refund/credit, dan capacity release.
- Invoice void/replacement policy.
- Payment reversal/refund authority.
- Payment reminder channel, provider, dan jadwal.
- Alert ownership dan escalation path.
- Package-specific DP/final payment exceptions.
- Batas diskon/price override per role.
- Accounting close schedule dan siapa yang dapat reopen period.
- Sumber exchange rate dan kebijakan FX.
- Customer credit expiry/refund/allocation policy.

## Dokumen lama yang tumpang tindih

- `PROJECT_INSTRUCTIONS.md` memuat prinsip bisnis umum dan perlu dianggap sebagai landasan, bukan satu-satunya detail operasional.
- `docs/03_BUSINESS_RULES_AND_POLICY.md` adalah kandidat utama untuk digabungkan dengan dokumen ini bila ingin satu sumber aturan bisnis yang lebih rapi.
