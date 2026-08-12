# WORKFLOWS

**Status:** canonical working workflow summary
**Tanggal audit:** 13 Agustus 2026

## End-to-end commercial workflow

`Inquiry -> Lead -> Follow-up -> Qualified -> Quotation -> Negotiation -> Booking -> Invoice -> Payment Verification -> Operations -> Trip Completion -> Customer Follow-up -> Repeat Booking`

### 1. Inquiry dan Lead

- Inquiry masuk dari website, WhatsApp, Instagram, referral, walk-in, atau sales.
- CRM membuat Lead dan mencatat source, customer/contact, kebutuhan, travel date, pax, product interest, sales owner/PIC, dan next follow-up.
- Lead bergerak melalui `NEW -> CONTACTED -> QUALIFIED -> QUOTATION_SENT -> NEGOTIATION -> WON/LOST`.
- Lead tidak menciptakan revenue atau kapasitas booking.

### 2. Quotation

- Sales memilih customer dan package/product yang kanonik.
- Backend menghitung harga berdasarkan aturan produk, tanggal, pax/category, service level, room/unit, surcharge, add-on, dan diskon yang diizinkan.
- Quotation menyimpan detail penawaran dan revision/history yang diperlukan.
- Customer acceptance mengizinkan conversion ke Booking; data tidak diketik ulang.

### 3. Booking

- Booking dibuat dari quotation atau authorized direct-sale/POS flow.
- Sistem memvalidasi customer, tanggal, participant, price, package/departure, tenant, dan capacity di backend.
- Booking menyimpan price snapshot dan lineage transaksi.
- Untuk Open Trip, capacity reservation/update harus atomik agar tidak terjadi overselling.
- Booking menjadi reference utama untuk Finance, Operations, Vendor, Documents, dan Reporting.

### 4. Invoice dan Payment

- Invoice diterbitkan terhadap booking sesuai payment terms.
- Customer/sales dapat mengunggah payment proof sebagai bukti, tetapi bukti belum berarti uang terverifikasi.
- Finance memverifikasi atau menolak payment.
- Hanya `VERIFIED` payment yang memperbarui paid/outstanding, menghasilkan receipt bila berlaku, dan diposting ke canonical financial ledger.
- Koreksi pembayaran harus menggunakan refund/reversal yang menjaga histori; jangan menghapus transaksi terverifikasi.

### 5. Operations

- Booking yang siap operasi ditautkan ke departure/trip.
- Sistem membentuk kebutuhan participant/manifest dan assignment.
- Manager/PIC menugaskan tour guide, driver, leader, atau staf lain sesuai kebutuhan.
- Vendor/service requirements ditautkan ke trip/booking untuk transport, hotel, boat, attraction, guide, dan komponen lain.
- Perubahan booking yang berdampak ke jadwal, pax, atau capacity harus diteruskan secara konsisten ke operations.

### 6. Trip completion dan CRM retention

- Setelah trip selesai, status operasional ditutup tanpa menghapus histori transaksi.
- CRM memperbarui last booking, booking count/value, dan data hubungan customer yang dapat diturunkan dari transaksi.
- Follow-up pascatour, review, dan repeat-sale dapat dibuat sebagai aktivitas CRM baru.
- Repeat booking memakai Customer yang sama, bukan membuat profil customer baru.

## Finance workflow

`Invoice -> Payment Proof -> Pending Verification -> Verified/Rejected -> Ledger Posting -> Reconciliation -> Refund/Reversal when authorized`

- CRM hanya membaca ringkasan finansial yang dibutuhkan untuk pelayanan customer.
- Finance/ledger adalah sumber kebenaran untuk penerimaan, outstanding, reconciliation, dan reversal.
- Verified payment harus memiliki lineage yang dapat ditelusuri ke invoice dan booking.

## Open Trip workflow

`Departure Created -> Capacity Published -> Sales/Booking -> Capacity Check/Lock -> Occupancy Update -> Assignment -> Manifest -> Departure -> Completed`

- Warning occupancy di UI hanya bantuan; backend tetap enforcement utama.
- Booking tidak boleh melewati kapasitas walaupun request paralel.
- Cancellation/reschedule baru boleh melepaskan kapasitas sesuai policy yang disetujui.

## Content dan product workflow

`Back Office Product/Package -> Pricing/Availability -> Website/Public Presentation -> CRM/Quotation/POS Reuse -> Booking -> Documents`

Data paket yang dijual di channel berbeda harus merujuk pada produk kanonik yang sama agar itinerary, pricing rule, surcharge, availability, dan reporting tidak terpecah menjadi sumber data terpisah.

## Control workflow

`Authentication -> Tenant Validation -> Permission/RBAC -> Business Validation -> Approval when required -> Transaction -> Audit Log -> Outbox/Event when needed`

Frontend tidak boleh menjadi satu-satunya enforcement untuk permission, price, capacity, payment state, atau tenant isolation.

## Data ownership antar modul

| Data | Source of truth |
| --- | --- |
| Customer relationship & lead pipeline | CRM |
| Package, itinerary, pricing rules | Product/Package |
| Transaction commitment & price snapshot | Booking |
| Invoice obligation | Invoice |
| Payment verification | Payment |
| Financial posting/reconciliation | Finance ledger |
| Departure capacity & trip execution | Operations |
| Staff responsibility | Assignment/HR references |
| Vendor service/cost | Vendor/Finance references |
| Generated commercial/operational documents | Documents referencing canonical entities |

## Open decisions

- Cancellation dan reschedule eligibility, fee, approval, dan capacity-release rules.
- Refund threshold, authority, dan four-eyes approval.
- Invoice void/replacement workflow.
- Payment reversal authority.
- DP/final-payment terms dan package-specific exceptions.
- Discount/price-override authority by role.
- Reminder channels, timing, alert ownership, dan escalation path.
