# BATAM TRAVELLING ERP
# BUSINESS RULES & POLICY

**File Name:** `03_BUSINESS_RULES_AND_POLICY.md`  
**Document Number:** 03  
**Version:** 1.0  
**Status:** APPROVED BUSINESS RULES  
**Project:** Batam Travelling ERP  
**Last Updated:** 2026-08-08

---

# 1. PURPOSE

Dokumen ini mendefinisikan aturan bisnis utama yang menjadi dasar pengembangan ERP Batam Travelling.

Dokumen ini digunakan sebagai referensi untuk:

- CRM
- Sales
- Product
- Package
- Pricing
- Quotation
- Order
- Booking
- Payment
- Invoice
- Refund
- Cancellation
- Reschedule
- Vendor
- Operations
- Employee
- Commission
- Project
- Finance
- Approval
- Reporting
- Website
- POS

Aturan dalam dokumen ini harus diterapkan secara konsisten oleh sistem.

Jika suatu aturan belum ditentukan dalam dokumen ini, sistem tidak boleh mengarang keputusan bisnis sendiri.

Gunakan status:

**BUSINESS DECISION REQUIRED**

untuk aturan yang belum disetujui.

---

# 2. CORE BUSINESS PRINCIPLES

ERP Batam Travelling harus mengikuti prinsip berikut:

1. Customer memiliki satu Customer Record utama.
2. Semua transaksi harus dapat ditelusuri kembali ke customer.
3. Satu transaksi harus dapat ditelusuri dari Lead → Quotation → Booking → Payment → Operation → Completion.
4. Data tidak boleh diduplikasi tanpa alasan.
5. Transaksi penting harus memiliki audit trail.
6. Financial transaction tidak boleh diubah sembarangan.
7. Selling Price dan Cost harus dipisahkan.
8. Booking harus mengikuti availability.
9. Operational harus berasal dari booking/project yang valid.
10. Employee assignment harus memperhatikan availability.
11. Vendor cost harus dapat dikaitkan dengan transaksi.
12. Setiap status transaksi harus jelas.
13. User hanya boleh melakukan tindakan sesuai permission.
14. Business rule tidak boleh hanya tersimpan di dalam source code tanpa dokumentasi.
15. Data historis transaksi harus tetap dapat ditelusuri.
16. Website, POS, CRM, dan ERP harus menggunakan master data yang sama.

---

# 3. CUSTOMER RULES

## 3.1 Customer Master

Setiap customer harus memiliki satu Customer Record utama.

Minimal:

- Customer ID
- Name
- Phone
- Email
- Address
- Customer Type
- Lead Source
- Notes
- Status

---

## 3.2 Duplicate Customer

Sistem harus memberikan warning apabila menemukan kemungkinan customer yang sama berdasarkan:

- Nomor telepon
- Email
- Nama

Duplicate customer tidak boleh dibuat secara sembarangan.

Jika duplicate tetap dibuat, sistem harus mencatat alasan dan user yang membuatnya.

---

# 4. CRM & LEAD RULES

## 4.1 Lead Status

Lead dapat menggunakan:

```text
New
Contacted
Qualified
Quotation
Negotiation
Won
Lost
```

---

## 4.2 Lead Assignment

Lead dapat memiliki:

- Sales/PIC
- Follow-up date
- Requirement
- Estimated travel date
- Estimated pax
- Source
- Notes

Lead yang sudah memiliki PIC harus dapat ditindaklanjuti melalui CRM.

---

## 4.3 CRM Follow-up

CRM harus dapat membuat follow-up/task untuk:

- New lead
- Quotation
- Payment reminder
- Overdue payment
- Cancellation
- Reschedule
- Customer request
- Post-trip follow-up

Payment overdue **wajib dapat menghasilkan CRM Follow-up**.

---

# 5. PRODUCT & PACKAGE RULES

## 5.1 Product

Product memiliki:

- Product ID
- Name
- Category
- Description
- Cost
- Selling Price
- Status

Status:

```text
Draft
Active
Inactive
Archived
```

---

## 5.2 Package

Package memiliki:

- Package ID
- Package Code
- Name
- Category
- Destination
- Duration
- Description
- Itinerary
- Pricing
- Availability
- Payment Policy
- Cancellation Policy
- Reschedule Policy
- Status

---

## 5.3 Package Components

Package dapat terdiri dari:

- Hotel
- Ferry
- Transport
- Driver
- Guide
- Activity
- Ticket
- Meal
- Documentation
- Other services

---

## 5.4 Package Versioning

Perubahan package tidak boleh mengubah historical booking.

Booking harus menyimpan snapshot informasi package yang berlaku ketika transaksi dibuat.

---

# 6. PRICING RULES

## 6.1 Pricing Model

Batam Travelling menggunakan dua model:

### Standard Package

Package memiliki harga jual yang telah ditentukan dan dapat ditampilkan di:

- Website
- POS
- Sales
- Quotation

### Custom Trip

Harga dapat dihitung berdasarkan:

- Hotel
- Ferry
- Transport
- Activity
- Guide
- Driver
- Meal
- Other components
- Cost
- Margin/Markup

---

# 7. PRICE CALCULATION

Harga dapat ditentukan melalui:

### Manual Pricing

Management menetapkan selling price secara manual.

### Automatic Pricing

ERP menghitung harga berdasarkan cost dan pricing rules.

Keduanya harus dapat digunakan.

---

# 8. MARGIN RULE

Margin menjadi standar utama untuk mengukur profitabilitas.

ERP harus menampilkan:

- Cost
- Selling Price
- Profit
- Margin %
- Markup %

Formula:

```text
Profit = Selling Price - Cost

Margin % = Profit / Selling Price × 100

Markup % = Profit / Cost × 100
```

---

# 9. MINIMUM MARGIN CONTROL

ERP menggunakan dua tingkat kontrol:

### Warning

Jika margin mendekati batas minimum:

```text
WARNING
```

Sales masih dapat melanjutkan sesuai permission.

### Critical Margin

Jika margin turun di bawah batas kritis:

```text
APPROVAL REQUIRED
```

Sales tidak boleh melewati batas kritis tanpa authorization.

Nilai minimum margin dan critical margin dibuat sebagai **Business Settings**, bukan hard-coded.

---

# 10. DISCOUNT RULE

Sales boleh memberikan discount dalam batas authority yang ditentukan.

Jika discount melebihi authority:

```text
Discount Request
↓
Approval
↓
Manager / Owner
```

Setiap discount harus menyimpan:

- Original price
- Discount
- Final price
- User
- Date/time
- Reason
- Approval jika diperlukan

---

# 11. CUSTOM PRICE RULE

Custom price di luar aturan harga normal hanya boleh dibuat oleh:

- Owner
- Manager

Sales hanya dapat:

- mengajukan,
- meminta approval,
- menggunakan harga yang telah disetujui.

Custom price harus menyimpan:

- Original price
- Custom price
- Reason
- User
- Approver
- Date
- Effective period jika diperlukan

---

# 12. PAX RULE

ERP mendukung pricing berdasarkan jumlah pax.

Standard Package dapat menggunakan:

- Price per pax
- Tier pricing

Custom Trip dihitung berdasarkan jumlah pax dan komponen cost.

Jumlah pax juga memengaruhi:

- Hotel room
- Ferry seats
- Vehicle
- Guide
- Activity capacity
- Meal
- Operational resources

---

# 13. QUOTATION RULE

Quotation harus memiliki:

- Unique quotation number
- Customer
- Date
- Valid until
- Items
- Price
- Discount
- Total
- Terms
- Sales/PIC

Quotation dapat:

- dibuat,
- diedit,
- dikirim,
- dicetak,
- diubah menjadi booking.

---

# 14. QUOTATION STATUS

```text
Draft
Sent
Viewed
Negotiation
Approved
Rejected
Expired
Cancelled
Converted
```

Quotation yang sudah menjadi booking harus tetap tersimpan sebagai history.

---

# 15. BOOKING RULE

Booking dapat berasal dari:

- Website
- POS
- Sales
- Approved Quotation
- Manual authorized booking

Booking minimal memiliki:

- Customer
- Product/Package
- Travel Date
- Pax
- Price
- Payment Status
- Booking Status

---

# 16. PAYMENT RULE

## 16.1 Standard DP

DP standar:

**50% dari total booking.**

ERP harus otomatis menghitung:

```text
Booking Total
↓
DP Required = 50%
↓
Paid
↓
Outstanding
```

Package tertentu dapat memiliki payment policy khusus jika disetujui dalam package configuration.

---

# 17. FINAL PAYMENT

Pelunasan dapat berbeda berdasarkan jenis/package perjalanan.

Setiap package dapat memiliki:

**Payment Policy**

Payment Policy menentukan:

- DP
- Final payment deadline
- Payment terms
- Reminder schedule

Jika tidak ada policy khusus, gunakan default company policy.

---

# 18. PAYMENT OVERDUE

Jika customer belum melunasi sampai deadline:

```text
Due Date
↓
Not Paid
↓
OVERDUE
↓
CRM Follow-up
↓
Sales/PIC Contact
↓
Manager Review
```

Booking tidak otomatis dibatalkan hanya karena overdue.

Manager menentukan:

- Extend payment
- Continue booking
- Cancel
- Other action

---

# 19. PAYMENT REMINDER

Sistem harus mendukung:

### Automatic Reminder

Reminder dapat dikirim kepada customer melalui channel yang tersedia.

### CRM Follow-up

Sistem juga membuat task untuk Sales/PIC.

Dengan demikian:

```text
Automatic Reminder
+
CRM Follow-up
```

keduanya berjalan bersama.

---

# 20. PAYMENT METHODS

Fase awal menggunakan:

- Bank Transfer
- Cash
- QRIS

Arsitektur harus dibuat extensible agar dapat ditambahkan:

- Payment Gateway
- Virtual Account
- Debit/Credit Card
- Other payment methods

tanpa mengubah struktur inti Booking dan Invoice.

---

# 21. PAYMENT PROOF

Customer atau Sales dapat meng-upload bukti transfer.

Upload bukti tidak otomatis berarti payment confirmed.

Status:

```text
Payment Verification Pending
```

Finance/authorized user harus melakukan verifikasi.

Jika approved:

```text
Payment Confirmed
↓
Invoice Updated
↓
Booking Updated
↓
CRM Updated
```

Jika rejected:

```text
Payment Rejected
↓
CRM Follow-up / Correction
```

Bukti pembayaran harus disimpan sebagai attachment.

---

# 22. CASH PAYMENT

Sales boleh menerima cash.

Namun transaksi harus masuk:

```text
Cash Pending Verification
```

Finance/Cashier melakukan verifikasi.

Setelah diverifikasi:

```text
Cash Confirmed
```

Sistem harus mencatat:

- User penerima
- Amount
- Date/time
- Verification user
- Verification date

---

# 23. INVOICE RULE

Invoice harus memiliki:

- Unique invoice number
- Customer
- Booking/Order
- Items
- Total
- Payment
- Outstanding

Invoice yang telah diterbitkan tidak boleh diubah sembarangan.

Correction menggunakan:

- Adjustment
- Void
- Cancellation
- Replacement invoice

sesuai workflow.

---

# 24. RECEIPT RULE

Payment yang valid dapat menghasilkan receipt.

Receipt minimal:

- Receipt number
- Customer
- Invoice
- Payment amount
- Payment method
- Date
- Reference

---

# 25. REFUND RULE

Refund harus memiliki:

- Refund request
- Reason
- Booking
- Invoice
- Payment reference
- Amount
- Approval
- Date

Refund tidak boleh melebihi jumlah payment customer.

---

# 26. REFUND APPROVAL

Refund kecil:

**Manager**

Refund besar:

**Owner**

Nilai batas antara refund kecil dan besar belum ditentukan.

Batas harus dibuat sebagai **Business Setting** yang dapat diubah Owner.

---

# 27. REFUND EXCEPTION

Exception terhadap Refund Policy hanya boleh disetujui:

**Owner**

Exception harus mencatat:

- Normal policy
- Normal refund
- Exception amount
- Reason
- Requester
- Owner approval
- Date/time

---

# 28. REFUND METHOD

Default:

**Refund kembali ke metode pembayaran asal.**

Jika metode asal tidak memungkinkan:

**Manager dapat menyetujui metode lain.**

Sistem harus mencatat:

- Original payment method
- Refund method
- Reason
- Approver

---

# 29. PARTIAL REFUND

Partial refund diperbolehkan untuk kondisi tertentu.

Partial refund memerlukan:

**Manager Approval**

Jika merupakan exception khusus, dapat dinaikkan kepada Owner.

ERP harus mencatat:

- Original payment
- Eligible refund
- Actual refund
- Remaining amount

---

# 30. CANCELLATION RULE

Cancellation dapat:

- diminta customer,
- diajukan Sales,
- diajukan Operations.

Keputusan cancellation mengikuti workflow dan approval.

---

# 31. WEBSITE CANCELLATION

Customer dapat mengajukan cancellation melalui website.

Namun:

**Website Cancellation Request tidak langsung membatalkan booking.**

Status:

```text
Cancellation Requested
```

Staff melakukan review.

---

# 32. CANCELLATION WORKFLOW

```text
Cancellation Request
↓
Check Policy
↓
Calculate Penalty / Refund
↓
Staff Review
↓
Approval
↓
Cancel Booking
↓
Update Vendor
↓
Update Invoice
↓
Refund jika ada
↓
CRM History
```

---

# 33. CANCELLATION POLICY

Terdapat:

### Company Default Cancellation Policy

Policy standar perusahaan.

### Package Cancellation Policy

Setiap Package/Product dapat memiliki policy khusus.

Package policy dapat meng-override company default.

### Vendor Policy

Vendor policy dapat menjadi faktor dalam perhitungan cancellation.

---

# 34. CANCELLATION POLICY SNAPSHOT

Policy yang berlaku saat booking dibuat harus disimpan sebagai snapshot.

Perubahan policy di masa depan tidak boleh mengubah booking lama.

---

# 35. CANCELLATION POLICY MANAGEMENT

Cancellation Policy hanya dapat diatur oleh:

- Owner
- Manager

Sales, CS, dan Operations hanya dapat:

- melihat,
- menjelaskan,
- mengajukan exception.

---

# 36. CANCELLATION EXCEPTION

Exception terhadap Cancellation Policy:

**Hanya Owner.**

Jika Owner memberikan exception, sistem harus mencatat:

- Original policy
- Normal result
- Exception result
- Reason
- Requester
- Owner
- Date/time

---

# 37. RESCHEDULE RULE

Customer dapat meminta perubahan tanggal.

Reschedule harus memeriksa:

- Availability
- Package policy
- Vendor policy
- Price difference
- Additional cost
- Penalty
- Refund

---

# 38. RESCHEDULE APPROVAL

Reschedule normal dapat diproses sesuai authority.

Jika reschedule menyebabkan:

- Additional cost
- Refund
- Price change
- Policy exception

maka membutuhkan approval:

- Manager
- Owner sesuai level exception

---

# 39. RESCHEDULE LIMIT

Jumlah reschedule ditentukan oleh masing-masing Package/Product.

Contoh:

```text
Package A
Maximum 1 reschedule

Package B
Maximum 2 reschedules

Corporate / Custom
Sesuai contract
```

---

# 40. RESCHEDULE POLICY SNAPSHOT

Policy reschedule yang berlaku pada saat booking harus disimpan sebagai snapshot.

Perubahan policy berikutnya tidak mengubah booking lama.

---

# 41. COMMISSION RULE

Commission dapat diberikan kepada:

- Sales
- Reseller
- Agent
- Partner
- Role lain yang ditentukan oleh policy

---

# 42. COMMISSION POLICY

Commission Policy bersifat fleksibel.

Basis commission dapat berupa:

### Revenue Based

```text
Revenue × Commission %
```

### Profit Based

```text
Profit × Commission %
```

### Fixed

```text
Fixed Amount per Booking
```

Policy dapat berbeda berdasarkan:

- Role
- Product
- Package
- Reseller
- Agent
- Partner

---

# 43. COMMISSION EARNED

Standar:

**Commission dianggap earned setelah customer melunasi seluruh booking.**

DP saja belum membuat commission menjadi earned.

---

# 44. COMMISSION PAYOUT

Commission payout dapat memiliki jadwal berbeda berdasarkan Commission Policy.

Status harus dipisahkan:

```text
Pending
Earned
Eligible
Paid
Adjusted
Reversed
Cancelled
```

---

# 45. COMMISSION CANCELLATION

Jika booking dibatalkan:

### Default

Commission yang belum dibayar:

**Cancelled**

Jika commission sudah earned:

**Commission Adjustment/Reversal**

Manager/Owner dapat memberikan exception sesuai authority.

---

# 46. COMMISSION POLICY AUTHORITY

Hanya:

**Owner**

yang dapat:

- Create Commission Policy
- Edit Commission Policy
- Activate Policy
- Deactivate Policy

---

# 47. COMMISSION VERSIONING

Perubahan Commission Policy tidak mengubah transaksi lama.

Setiap policy memiliki:

- Version
- Effective Date
- Status
- Created by
- Approved by
- Change history

Booking menggunakan policy snapshot yang berlaku saat transaksi.

---

# 48. VENDOR MASTER

Vendor dapat memiliki:

- Vendor ID
- Name
- Service
- Contact
- Address
- Bank information
- Pricing
- Terms
- Payment Terms
- Status

Status:

```text
Pending Approval
Active
Inactive
Blocked
```

---

# 49. VENDOR CREATION

Vendor hanya dapat dibuat oleh user dengan permission:

**Create Vendor**

Owner/Manager menentukan siapa yang memiliki permission tersebut.

---

# 50. VENDOR APPROVAL

**Setiap vendor baru wajib mendapatkan approval Manager.**

Workflow:

```text
Create Vendor
↓
Pending Approval
↓
Manager Review
↓
Approved
↓
Active
```

Vendor yang belum approved tidak boleh digunakan untuk:

- Operational Booking
- Purchase Order
- Vendor Payment

---

# 51. VENDOR PRICE VERSIONING

Harga vendor harus memiliki versioning.

Harga lama tetap disimpan.

Harga baru menjadi version baru.

Harga baru harus mendapatkan:

**Manager Approval**

sebelum aktif.

---

# 52. VENDOR PRICE EFFECTIVE DATE

Vendor price dapat memiliki:

- Effective date
- Expiry date
- Version
- Terms
- Approval

Booking lama tetap menggunakan cost yang berlaku ketika booking dibuat.

---

# 53. VENDOR PRICING CONDITIONS

ERP mendukung vendor pricing berdasarkan berbagai kondisi:

- Pax
- Season
- High Season
- Low Season
- Weekend
- Weekday
- Corporate
- Special Agreement
- Date Range
- Service Type
- Other conditions

Jika beberapa rule cocok, sistem harus menggunakan **pricing priority** yang jelas.

---

# 54. VENDOR AVAILABILITY

Jika vendor tidak tersedia:

ERP harus mencari dan menampilkan vendor alternatif berdasarkan:

- Availability
- Service suitability
- Capacity
- Cost
- Location
- Vendor status

Operations tetap menentukan pilihan akhir.

ERP tidak boleh memilih vendor secara otomatis tanpa keputusan authorized staff.

---

# 55. OPERATIONAL RULE

Setelah booking confirmed, ERP dapat membuat operational requirements:

- Hotel
- Ferry
- Transport
- Driver
- Guide
- Activity
- Meal
- Documentation
- Other resources

---

# 56. TRIP / DEPARTURE SCHEDULE

Trip/Departure Schedule dibuat oleh:

**Operations**

Status awal:

```text
Draft
```

Kemudian:

```text
Manager Review
↓
Approved
↓
Ready for Assignment
```

---

# 57. TRIP STATUS

Trip dapat memiliki status:

```text
Draft
Planned
Ready
Departed
On Going
Completed
Cancelled
```

---

# 58. EMPLOYEE ASSIGNMENT

Satu Trip dapat memiliki beberapa employee/resource.

Contoh:

```text
Trip Leader
Driver
Guide
Support
Operations
Other Role
```

Setiap assignment memiliki:

- Employee
- Role
- Schedule
- Task
- Status

---

# 59. EMPLOYEE AVAILABILITY

Sistem harus memeriksa:

- Employee status
- Availability
- Existing assignment
- Schedule conflict

Jika terjadi conflict:

```text
WARNING
```

Assignment normal tidak boleh dilakukan tanpa authorization.

---

# 60. EMPLOYEE REPLACEMENT

Jika employee yang sudah ditugaskan berhalangan:

ERP menampilkan employee yang:

- Available
- Sesuai role
- Tidak conflict

Operations memilih pengganti.

Jika replacement memiliki dampak penting terhadap trip:

**Approval diperlukan.**

---

# 61. TASK RULE

Task memiliki:

- Task ID
- Title
- PIC
- Due Date
- Priority
- Status
- Related Record

Status:

```text
To Do
In Progress
Blocked
Completed
Cancelled
```

---

# 62. PROJECT RULE

Project dapat memiliki:

- Customer
- Project Manager
- Budget
- Revenue
- Cost
- Vendor
- Employee
- Task
- Schedule
- Documents
- Profit

Status:

```text
Planning
Active
On Hold
Completed
Cancelled
```

---

# 63. EXPENSE RULE

Expense memiliki:

- Date
- Amount
- Category
- Description
- Related Booking/Project
- PIC
- Approval
- Payment Method
- Attachment jika diperlukan

---

# 64. PROFIT RULE

ERP harus dapat menghitung:

```text
Net Revenue
-
Vendor Cost
-
Operational Cost
-
Commission
-
Other Allocated Cost
=
Profit
```

Sistem harus membedakan:

### Estimated Profit

Berdasarkan estimated cost.

### Actual Profit

Berdasarkan actual cost.

---

# 65. WEBSITE RULE

Website menggunakan master data ERP.

Website hanya menampilkan:

```text
Published
+
Active
+
Available
```

Website booking harus mengikuti:

- Availability
- Pricing
- Payment Policy
- Booking Policy
- Customer data requirements

---

# 66. POS RULE

POS harus menggunakan master data yang sama dengan ERP.

POS tidak boleh membuat database terpisah untuk:

- Customer
- Product
- Package
- Booking
- Invoice

POS harus terhubung dengan:

- CRM
- Booking
- Invoice
- Payment

---

# 67. CRM RULE

CRM menjadi pusat customer history.

Customer record harus dapat menampilkan riwayat:

- Lead
- Conversation/Follow-up
- Quotation
- Booking
- Payment
- Invoice
- Cancellation
- Reschedule
- Refund
- Trip
- Feedback
- Sales activity

---

# 68. DOCUMENT RULE

ERP harus dapat menghasilkan:

- Quotation
- Invoice
- Receipt
- Booking Confirmation
- Voucher
- Itinerary
- Manifest
- Purchase Order
- Vendor Document

Dokumen dapat:

- Preview
- Print
- PDF
- Send
- Store

---

# 69. DOCUMENT IMMUTABILITY

Dokumen penting yang telah diterbitkan tidak boleh diedit secara bebas.

Jika terjadi perubahan:

```text
Original
↓
Revision / Adjustment / Cancellation
```

History tetap disimpan.

---

# 70. AUDIT LOG

Aktivitas penting harus dicatat:

- Create
- Update
- Archive
- Approve
- Reject
- Cancel
- Refund
- Payment
- Price Override
- Discount
- Assignment
- Commission Adjustment
- Policy Change

Audit minimal:

- User
- Date/time
- Action
- Record
- Previous value jika relevan
- New value jika relevan

---

# 71. DELETE RULE

Data transaksi penting tidak boleh di-hard-delete oleh user biasa.

Gunakan:

- Archive
- Cancel
- Void
- Deactivate

Hard delete hanya untuk data yang memang aman dihapus dan memiliki authorization.

---

# 72. USER & PERMISSION

Role dapat meliputi:

```text
Owner
Manager
Sales
Customer Service
Operations
Finance
Marketing
Guide
Driver
```

Permission harus mengontrol:

- View
- Create
- Edit
- Approve
- Cancel
- Refund
- Archive
- Export
- Print
- Manage Settings

---

# 73. OWNER AUTHORITY

Owner memiliki visibility tertinggi.

Owner dapat melihat:

- Sales
- Revenue
- Profit
- Finance
- Customer
- Vendor
- Employee
- Operational
- Commission
- Reports
- Business Settings

Owner memiliki authority khusus untuk:

- Policy exception
- Commission Policy
- Special pricing
- High-level refund
- Business configuration

---

# 74. MANAGER AUTHORITY

Manager dapat mengelola sesuai permission:

- Sales
- Operations
- Booking
- Vendor
- Employee
- Project
- Approval
- Refund
- Discount

Manager tidak otomatis memiliki semua Owner authority.

---

# 75. SALES AUTHORITY

Sales dapat:

- Manage assigned leads
- Manage customer
- Create quotation
- Follow-up
- Upload payment proof
- Receive cash sesuai policy
- Create booking sesuai permission

Sales tidak boleh mengubah:

- Commission Policy
- Cancellation Policy
- Business Settings
- Vendor Master approval
- Owner-level exception

---

# 76. FINANCE AUTHORITY

Finance dapat:

- Verify payment
- Invoice
- Receipt
- Refund processing
- Vendor payment
- Expense
- Financial reporting

Finance tidak otomatis memiliki authority untuk mengubah operational data.

---

# 77. OPERATIONS AUTHORITY

Operations dapat:

- Create Trip Draft
- Manage operational requirements
- Assign employee
- Assign resources
- Manage schedule
- Manage vendor service
- Update operational status

Operations tidak otomatis dapat mengubah selling price.

---

# 78. REPORTING

ERP harus mendukung laporan:

### Sales

- Sales
- Revenue
- Conversion
- Lead Source
- Salesperson Performance

### Booking

- Booking
- Departure
- Pax
- Package
- Status

### Finance

- Invoice
- Payment
- Outstanding
- Refund
- Expense

### Vendor

- Vendor
- Cost
- Purchase
- Performance

### Profit

- Revenue
- Cost
- Margin
- Commission
- Profit

### Customer

- New Customer
- Repeat Customer
- Customer Value
- Booking History

---

# 79. BUSINESS SETTINGS

Nilai yang dapat berubah harus berada di Business Settings, bukan hard-coded.

Contoh:

- Default DP
- Minimum Margin
- Critical Margin
- Discount Authority
- Refund Threshold
- Payment Reminder
- Commission Rules
- Tax Settings
- Currency
- Numbering
- Cancellation Policy
- Reschedule Policy

---

# 80. POLICY SNAPSHOT PRINCIPLE

Untuk menjaga historical integrity, policy yang memengaruhi transaksi harus dapat disimpan sebagai snapshot.

Contoh:

```text
Booking
↓
Price Snapshot
Payment Policy Snapshot
Cancellation Policy Snapshot
Reschedule Policy Snapshot
Commission Policy Snapshot
Vendor Cost Snapshot
```

Perubahan policy berikutnya tidak boleh mengubah historical transaction.

---

# 81. APPROVAL PRINCIPLE

Approval harus:

- jelas siapa approver,
- memiliki status,
- memiliki timestamp,
- menyimpan alasan,
- dapat dilacak.

Status:

```text
Pending
Approved
Rejected
Cancelled
```

---

# 82. NOTIFICATION RULE

ERP dapat memberikan notification untuk:

- New Lead
- New Quotation
- Payment Received
- Payment Verification
- Payment Due
- Payment Overdue
- Booking Confirmation
- Trip Upcoming
- Assignment
- Task Deadline
- Approval Request
- Vendor Issue

---

# 83. SECURITY

Data sensitif harus dibatasi berdasarkan role.

Contoh:

- Customer personal information
- Vendor bank information
- Employee information
- Financial data
- Internal notes
- Password/authentication information

---

# 84. DATA RETENTION

Historical transaction harus dipertahankan sesuai kebutuhan bisnis dan peraturan yang berlaku.

Data lama dapat di-archive.

Archive tidak boleh menghilangkan historical relationship.

---

# 85. UNDEFINED BUSINESS RULES

Jika sistem menemukan kondisi yang belum memiliki aturan:

Claude/developer harus:

1. Menandai **BUSINESS DECISION REQUIRED**.
2. Menjelaskan dampaknya.
3. Memberikan pilihan jika diperlukan.
4. Tidak mengarang keputusan bisnis.
5. Tidak hard-code asumsi tanpa approval.

---

# 86. CURRENT UNDEFINED ITEMS

Beberapa nilai bisnis masih perlu ditentukan:

## Pricing

- Minimum margin %
- Critical margin %
- Discount authority limits
- Custom pricing authority details

## Payment

- Package-specific DP rules
- Default final-payment deadline
- Payment reminder schedule

## Refund

- Refund threshold Manager vs Owner

## Finance

- Tax policy
- Tax rate
- Tax-inclusive/exclusive pricing
- Credit customer policy
- Multi-currency requirement

## Commission

- Actual commission rates
- Specific payout schedule
- Commission exceptions

## Operations

- Employee overtime rules
- Resource capacity rules
- Trip cancellation operational rules

Nilai tersebut harus dikonfigurasi setelah management memutuskan.

---

# 87. APPROVED DECISION SUMMARY

Keputusan utama yang telah disetujui:

| Area | Decision |
|---|---|
| Pricing | Standard + Custom |
| Price Calculation | Manual + Automatic |
| Margin Standard | Margin |
| Markup | Displayed as information |
| Discount | Authority-based |
| Minimum Margin | Warning + Approval |
| Custom Price | Owner/Manager |
| Pax Pricing | Standard + Custom |
| Standard DP | 50% |
| Final Payment | Package-based |
| Overdue | CRM Follow-up + Manager Review |
| Payment Reminder | Automatic + CRM |
| Initial Payment Methods | Bank Transfer + Cash + QRIS |
| Payment Proof | Customer or Sales |
| Cash | Pending Verification |
| Refund | Manager/Owner |
| Refund Threshold | Configurable |
| Refund Exception | Owner |
| Refund Method | Original method by default |
| Partial Refund | Allowed with Manager approval |
| Cancellation Request | Customer/Sales/Operations |
| Website Cancellation | Request only |
| Cancellation Policy | Default + Package-specific |
| Cancellation Exception | Owner |
| Reschedule | Allowed subject to availability/policy |
| Reschedule Approval | Authority-based |
| Reschedule Limit | Package-specific |
| Commission | Flexible policy |
| Commission Basis | Revenue/Profit/Fixed |
| Commission Earned | Full payment |
| Commission Payout | Policy-based |
| Commission Cancellation | Default cancel/reversal |
| Commission Policy Authority | Owner |
| Vendor Creation | Permission-based |
| Vendor Approval | Manager mandatory |
| Vendor Price | Versioned + Manager approval |
| Vendor Alternative | System recommends, Operations decides |
| Trip Creation | Operations |
| Trip Approval | Manager |
| Multiple Employee Assignment | Yes |
| Employee Replacement | Operations + approval when required |

---

# 88. IMPLEMENTATION PRINCIPLE

Business rules dalam dokumen ini harus diterjemahkan ke dalam:

- System Requirements
- Module Specifications
- Workflow
- Data Model
- Roles & Permissions
- Validation Rules
- Approval Rules
- UI/UX
- Reports
- API/Integration requirements

Jangan langsung menerjemahkan business rules menjadi code tanpa melalui system requirements.

---

# 89. DOCUMENT STATUS

**APPROVED BUSINESS RULES v1.0**

Dokumen ini merupakan baseline business rules untuk pengembangan ERP Batam Travelling.

Perubahan terhadap business rules setelah versi ini harus:

1. Didokumentasikan.
2. Memiliki version number baru.
3. Memiliki change reason.
4. Menjelaskan impact terhadap sistem.
5. Disetujui oleh pihak yang berwenang.

---

# 90. NEXT DOCUMENT

Dokumen berikutnya:

`04_PRD_SYSTEM_REQUIREMENTS.md`

Tujuan dokumen 04:

Mengubah:

```text
Business Foundation
        ↓
Business Process & SOP
        ↓
Business Rules & Policy
        ↓
SYSTEM REQUIREMENTS
```

Dokumen 04 akan mulai mendefinisikan **apa yang harus bisa dilakukan ERP**, termasuk:

- Dashboard
- CRM
- Customer
- Lead
- Sales
- Product
- Package
- Pricing
- Quotation
- Booking
- POS
- Invoice
- Payment
- Refund
- Cancellation
- Reschedule
- Vendor
- Operations
- Trip
- Employee
- Project
- Workflow
- Planner
- Commission
- Finance
- Reporting
- Website
- User & Permission

**End of Document**