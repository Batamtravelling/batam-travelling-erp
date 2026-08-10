# Peta Modul ERP Batam Travelling

Dokumen ini merangkum modul yang sudah ada, yang perlu dilengkapi, dan urutan implementasi agar ERP tetap rapi saat skalanya membesar.

## Modul inti yang wajib kuat

### 1) CRM

- Lead, customer, dan histori interaksi
- Status follow up dan reminder otomatis
- Segmentasi customer: baru, aktif, repeat, VIP, pending payment
- Catatan internal per customer
- Template follow up WhatsApp / email

### 2) Booking / Sales Order

- Booking per trip/destinasi
- Multi peserta: dewasa, anak, bayi
- Multi varian paket dalam trip yang sama
- Pembatasan 1 trip per pesanan untuk destinasi yang sama
- Voucher, invoice, tiket, dan bukti transaksi yang bisa dicetak

### 3) Task & Project

- Kanban, table, dan diagram ringkas
- Multi petugas dalam 1 task
- Progress, last update, dan completed time
- Comment / activity log per task
- Template task untuk proses yang berulang

### 4) Finance

- Kas masuk dan kas keluar
- Invoice pelanggan dan tagihan vendor
- Operasional tetap
- Pelunasan, piutang, dan hutang
- Laporan sederhana per periode

## Modul penunjang yang membuat sistem lebih matang

### 5) Vendor & Procurement

- Master vendor
- Harga modal dan term pembayaran
- Tagihan vendor
- Riwayat pembelian layanan / produk

### 6) Operations

- Jadwal trip
- Assignment petugas
- Kapasitas dan ketersediaan
- Checklist operasional sebelum trip
- Incident log

### 7) Inventory / Asset

- Stok dan aset operasional
- Pemakaian barang
- Maintenance / servis
- Penomoran aset dan lokasi penyimpanan

### 8) Report & Dashboard

- KPI ringkas
- Booking per periode
- Conversion follow up
- Overdue payment
- Task completion rate
- Revenue dan margin

### 9) Approval & Audit Trail

- Approval diskon, refund, booking khusus, pengeluaran besar
- Riwayat perubahan data sensitif
- Log siapa mengubah apa dan kapan

### 10) Security

- Role-based access yang lebih detail
- Proteksi data sensitif customer
- Masking data di UI publik
- Batasan akses berdasarkan divisi

## Urutan implementasi yang disarankan

### Tahap 1

- CRM
- Booking
- Task & Project

### Tahap 2

- Finance
- Vendor
- Operations

### Tahap 3

- Dashboard
- Report
- Approval
- Audit trail

### Tahap 4

- Security hardening
- Inventory / Asset
- Template otomatis
- Notifikasi lanjutan

## Prinsip desain yang dipakai

- 1 data source untuk 1 entitas utama
- Semua status punya jejak waktu
- Semua perubahan penting tercatat
- Data sensitif tidak ditampilkan mentah di area publik
- Template dipakai untuk mengurangi input manual berulang

## Target hasil

ERP harus bisa:

- menerima lead
- mengubah lead menjadi booking
- mengatur tugas internal
- mencatat transaksi
- memantau vendor
- menampilkan dashboard yang mudah dibaca
- menyimpan audit trail yang rapi

