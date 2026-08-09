# BATAM TRAVELLING ERP
## BUSINESS PROCESS & SOP

**File Name:** `02_BUSINESS_PROCESS_AND_SOP.md`  
**Document Number:** 02  
**Version:** 1.0  
**Status:** Foundation Draft  
**Project:** Batam Travelling ERP

---

# 1. DOCUMENT PURPOSE

Dokumen ini menjelaskan bagaimana Batam Travelling menjalankan proses bisnis sehari-hari.

Dokumen ini menjadi dasar untuk:

- Workflow
- SOP
- Role & Responsibility
- Sales Process
- CRM Process
- Package Management
- Booking
- POS
- Quotation
- Invoice
- Payment
- Vendor
- Operational
- Trip
- Employee Assignment
- Planner
- Project
- Finance
- Reporting

Dokumen ini berfokus pada **bagaimana bisnis bekerja**, bukan bagaimana sistem teknis dibangun.

---

# 2. CORE BUSINESS PROCESS

Alur utama bisnis:

```text
Marketing / Referral / Website / Social Media
↓
Lead
↓
CRM
↓
Customer Inquiry
↓
Sales / Customer Service
↓
Quotation
↓
Customer Approval
↓
Booking
↓
Invoice
↓
Payment
↓
Operational Planning
↓
Vendor & Resource Confirmation
↓
Employee Assignment
↓
Trip Execution
↓
Trip Completion
↓
Finance
↓
Profit
↓
Customer Feedback
↓
Repeat Customer / Referral
```

---

# 3. CUSTOMER ACQUISITION

Customer dapat datang melalui:

- Website
- WhatsApp
- Instagram
- Facebook
- TikTok
- Telepon
- Walk-in
- Sales
- Referral
- Reseller
- Advertising
- Repeat Customer
- Corporate inquiry

Setiap lead sebaiknya dicatat dalam CRM.

## Lead Source

Lead source dapat berupa:

- Website
- Instagram
- Facebook
- TikTok
- WhatsApp
- Google
- Advertising
- Referral
- Walk-in
- Reseller
- Existing Customer
- Other

Lead source digunakan untuk mengetahui efektivitas channel marketing.

---

# 4. CRM PROCESS

CRM merupakan pusat informasi customer.

## 4.1 Customer Record

Customer Record dapat berisi:

- Nama
- Nomor telepon
- Email
- Alamat
- Customer type
- Lead source
- Catatan
- Communication history
- Quotation
- Booking
- Invoice
- Payment
- Trip
- Feedback

## 4.2 Customer Lifecycle

```text
Lead
↓
Prospect
↓
Customer
↓
Active Customer
↓
Repeat Customer
```

Status final dapat ditentukan dalam Business Rules.

---

# 5. CUSTOMER SERVICE PROCESS

Customer Service menggunakan prinsip komunikasi:

> Menjawab dengan santun dan menanyakan apakah ada yang dapat kami bantu.

Customer Service bertugas:

- Menjawab inquiry
- Memahami kebutuhan customer
- Memberikan informasi
- Mengarahkan ke produk yang sesuai
- Membuat atau meneruskan quotation
- Melakukan follow-up
- Mencatat informasi penting ke CRM

Komunikasi penting yang berkaitan dengan transaksi harus dapat dicatat dalam CRM.

---

# 6. SALES PROCESS

## 6.1 Sales Flow

```text
Lead
↓
Contacted
↓
Needs Analysis
↓
Product / Service Selection
↓
Quotation
↓
Follow-up
↓
Negotiation
↓
Customer Approval
↓
Booking
```

Jika tidak berhasil:

```text
Lead
↓
Lost
```

Lost lead dapat memiliki alasan:

- Harga
- Customer tidak jadi perjalanan
- Memilih competitor
- Tidak tersedia
- Tidak dapat dihubungi
- Alasan lainnya

---

# 7. PACKAGE MANAGEMENT

Package Management merupakan fungsi utama Back Office.

Staff dapat membuat package lengkap dari halaman belakang.

## 7.1 Package Information

Package dapat memiliki:

- Package name
- Package code
- Category
- Destination
- Duration
- Short description
- Full description
- Highlights
- Cover image
- Gallery
- Meeting point
- Pickup point
- Include
- Exclude
- Terms & Conditions
- Notes

## 7.2 Package Components

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

# 8. PACKAGE PRICING

Package dapat memiliki:

- Selling price
- Cost
- Markup
- Discount
- Promotional price
- Commission
- Seasonal price
- Price berdasarkan jumlah pax

Aturan pricing final harus ditentukan dalam Business Rules.

---

# 9. PACKAGE AVAILABILITY

Staff dapat mengatur ketersediaan package berdasarkan tanggal atau periode.

Contoh:

```text
10 August
Available — 10 Pax

15 August
Available — 10 Pax

20 August
Full

25 August
Available — 8 Pax
```

Availability dapat dipengaruhi oleh:

- Pax
- Hotel
- Ferry
- Vehicle
- Guide
- Driver
- Activity
- Vendor
- Capacity

Sistem harus mencegah atau memperingatkan booking yang melebihi availability sesuai aturan bisnis.

---

# 10. PACKAGE PUBLICATION

Package memiliki lifecycle:

```text
Draft
↓
Review
↓
Approved
↓
Published
↓
Unpublished / Archived
```

Package yang belum disetujui tidak boleh ditampilkan sebagai produk publik.

---

# 11. ITINERARY MANAGEMENT

Package dapat memiliki itinerary lengkap.

Itinerary dapat terdiri dari:

- Day
- Time
- Activity
- Location
- Duration
- Description
- Notes
- Optional activity
- Images

Contoh:

```text
DAY 1 — ARRIVAL BATAM

08:00
Arrival Ferry

08:30
Pickup

09:30
Breakfast

11:00
City Tour

13:00
Lunch

14:00
Shopping

19:00
Dinner

21:00
Hotel
```

Itinerary dapat digunakan untuk:

- Website
- Quotation
- Customer information
- Booking confirmation
- Voucher
- Trip operation

---

# 12. SINGLE SOURCE OF PRODUCT CONTENT

Package dibuat satu kali dari Back Office.

Informasi tersebut dapat digunakan kembali untuk:

```text
Back Office
↓
Website
↓
Online Booking
↓
POS
↓
Quotation
↓
Itinerary
↓
Voucher
```

Staff tidak perlu mengetik ulang informasi yang sama.

---

# 13. CUSTOM TRIP PROCESS

Customer dapat meminta perjalanan yang tidak menggunakan package standar.

Flow:

```text
Customer Requirement
↓
Needs Analysis
↓
Custom Itinerary
↓
Select Services
↓
Vendor / Cost
↓
Selling Price
↓
Quotation
↓
Customer Approval
↓
Booking
```

Custom trip dapat menggunakan:

- Hotel
- Ferry
- Transport
- Guide
- Activity
- Meal
- Documentation
- Other services

---

# 14. QUOTATION PROCESS

Quotation dapat dibuat dari:

- CRM
- Sales
- POS
- Package
- Custom Trip
- Website inquiry

## 14.1 Quotation Content

Quotation dapat berisi:

- Quotation number
- Date
- Valid until
- Customer
- Travel date
- Pax
- Package
- Services
- Itinerary
- Price
- Discount
- Total
- Payment terms
- Terms & Conditions
- Notes

## 14.2 Automatic Quotation

Sistem harus dapat menghasilkan quotation berdasarkan data transaksi.

Staff tidak perlu membuat dokumen secara manual menggunakan Word atau Excel.

## 14.3 Quotation Output

Quotation dapat:

- Preview
- Print
- Generate PDF
- Send to customer
- Store in CRM
- Convert to booking

## 14.4 Quotation Status

```text
Draft
↓
Sent
↓
Viewed
↓
Negotiation
↓
Approved
↓
Converted to Booking
```

Alternative status:

```text
Rejected
Expired
Cancelled
```

---

# 15. POS PROCESS

POS digunakan untuk transaksi yang diproses langsung oleh staff.

Flow:

```text
Customer
↓
Search / Create Customer
↓
Select Product
↓
Select Date
↓
Select Pax
↓
Add Services
↓
Calculate Price
↓
Discount / Promotion
↓
Order
↓
Payment
↓
Booking
↓
Invoice / Receipt
```

Satu order dapat memiliki:

```text
Package
+
Hotel
+
Ferry
+
Transport
+
Activity
+
Meal
+
Documentation
+
Add-on
```

---

# 16. WEBSITE BOOKING PROCESS

Website berfungsi sebagai channel penjualan.

Customer dapat:

- Melihat package
- Membaca detail
- Melihat itinerary
- Melihat availability
- Memilih tanggal
- Memilih pax
- Memilih service
- Melakukan inquiry
- Melakukan booking
- Melakukan payment

Flow:

```text
Website
↓
Browse Package
↓
Package Detail
↓
Itinerary
↓
Check Availability
↓
Select Date
↓
Select Pax
↓
Add Services
↓
Checkout
↓
Customer Information
↓
Payment
↓
Booking
↓
Confirmation
```

---

# 17. ORDER PROCESS

Order merupakan transaksi komersial customer.

Order dapat berasal dari:

- Website
- POS
- Sales
- CRM

Order dapat berisi:

- Customer
- Product
- Service
- Quantity
- Pax
- Date
- Price
- Discount
- Total
- Payment
- Booking reference

---

# 18. BOOKING PROCESS

Booking dibuat setelah:

- Quotation disetujui
- Online booking selesai
- Sales membuat booking
- Staff membuat booking melalui POS

Flow:

```text
Quotation Approved / Online Order
↓
Create Booking
↓
Check Availability
↓
Reserve Services
↓
Payment Requirement
↓
Booking Confirmation
↓
Operational Planning
```

---

# 19. BOOKING STATUS

Status yang dapat digunakan:

```text
Draft
Pending Payment
Partially Paid
Confirmed
In Preparation
Ready
On Going
Completed
Cancelled
Refunded
```

Status final harus mengikuti Business Rules.

---

# 20. INVOICE PROCESS

Invoice dibuat berdasarkan booking dan aturan pembayaran.

Flow:

```text
Booking
↓
Invoice Generated
↓
Issued
↓
Payment
↓
Payment Recorded
↓
Balance Updated
```

Invoice dapat berisi:

- Invoice number
- Date
- Customer
- Booking
- Detail service
- Quantity
- Price
- Discount
- Total
- Paid amount
- Outstanding
- Due date
- Payment instructions
- Terms

---

# 21. INVOICE STATUS

```text
Draft
↓
Issued
↓
Partial Paid
↓
Paid
```

Alternative:

```text
Overdue
Cancelled
Refunded
```

---

# 22. PAYMENT PROCESS

Payment dapat berupa:

- DP
- Partial Payment
- Full Payment
- Final Payment
- Other payment

Flow:

```text
Invoice
↓
Customer Payment
↓
Payment Verification
↓
Payment Record
↓
Invoice Balance Updated
↓
Booking Status Updated
```

Perhitungan:

```text
Invoice Total
-
Paid Amount
=
Outstanding
```

---

# 23. RECEIPT PROCESS

Setelah payment tercatat, sistem dapat menghasilkan receipt.

Receipt harus terhubung dengan:

- Customer
- Invoice
- Booking
- Payment

Receipt dapat:

- Preview
- Print
- Generate PDF
- Send to customer
- Store in CRM

---

# 24. BOOKING DOCUMENTS

Setelah booking memenuhi syarat, sistem dapat menghasilkan:

- Booking Confirmation
- Itinerary
- Travel Voucher
- Hotel Voucher
- Manifest
- Other relevant documents

Dokumen harus menggunakan data booking yang sama.

---

# 25. VENDOR PROCESS

Booking yang confirmed menghasilkan operational requirements.

Contoh:

```text
12 Pax
↓
6 Hotel Rooms
12 Ferry Seats
1 Vehicle
1 Guide
1 Driver
```

Flow:

```text
Requirement
↓
Vendor Selection
↓
Vendor Order / Booking
↓
Vendor Confirmation
↓
Service Confirmed
```

---

# 26. VENDOR MANAGEMENT

Vendor dapat berasal dari:

- Hotel
- Ferry provider
- Transport provider
- Driver
- Guide
- Activity provider
- Restaurant
- Photographer
- Ticket provider
- Other suppliers

Vendor record dapat menyimpan:

- Vendor name
- Contact
- Service
- Price
- Cost
- Availability
- Terms
- Payment terms
- Performance
- Booking history

---

# 27. VENDOR PURCHASE PROCESS

Flow:

```text
Booking
↓
Operational Requirement
↓
Vendor Selection
↓
Vendor Order / Purchase Order
↓
Vendor Confirmation
↓
Vendor Invoice
↓
Verification
↓
Vendor Payment
```

Vendor cost harus terhubung dengan booking atau project terkait.

---

# 28. OPERATIONAL PLANNING

Operations melakukan planning berdasarkan booking.

Planning mencakup:

- Hotel
- Ferry
- Transport
- Vehicle
- Guide
- Driver
- Activity
- Meal
- Documentation

Setiap requirement memiliki status:

```text
Pending
↓
Requested
↓
Confirmed
↓
Ready
```

---

# 29. TRIP MANAGEMENT

Booking yang membutuhkan pelaksanaan perjalanan menghasilkan Trip.

Trip dapat memiliki:

- Trip ID
- Booking
- Customer
- Pax
- Date
- Departure
- Return
- Itinerary
- Manifest
- Services
- Vendor
- Employee
- Assignment

---

# 30. DEPARTURE SCHEDULE

Trip harus memiliki schedule.

Contoh:

```text
15 August 2026

Trip:
Batam Private Trip

Pax:
12

Guide:
Budi

Driver:
Andi

Vehicle:
Hiace 01
```

Schedule harus dapat dilihat melalui Planner/Calendar.

---

# 31. EMPLOYEE ASSIGNMENT

Manager atau user dengan permission dapat melakukan assignment.

Assignment dapat berupa:

- Guide
- Driver
- Photographer
- Videographer
- Operations
- Sales support
- Other employee

Flow:

```text
Trip
↓
Check Employee Availability
↓
Select Employee
↓
Check Conflict
↓
Assign
↓
Notify Employee
↓
Employee Confirmation
↓
Ready
```

Jika terjadi conflict, sistem harus memberikan warning.

---

# 32. PLANNER

Planner merupakan pusat scheduling.

Planner dapat menampilkan:

- Trip
- Departure
- Employee
- Assignment
- Task
- Project
- Deadline

View dapat berupa:

- Day
- Week
- Month
- Calendar
- Timeline
- Kanban

---

# 33. TASK MANAGEMENT

Pekerjaan dapat dibuat sebagai Task.

Task memiliki:

- Task name
- Related booking
- Related trip
- Related project
- PIC
- Department
- Priority
- Deadline
- Status
- Notes
- Attachment
- Checklist

Contoh:

```text
Task:
Confirm Hotel

PIC:
Operations

Deadline:
10 August

Related Booking:
BK-001

Status:
Pending
```

---

# 34. PROJECT MANAGEMENT

Project digunakan untuk pekerjaan travel berskala lebih besar.

Contoh:

- Corporate gathering
- Group trip
- Event
- Government travel
- Company outing
- Special project

Project dapat memiliki:

- Customer
- Budget
- Revenue
- Cost
- Vendor
- Employee
- Task
- Timeline
- Documents
- Profit

---

# 35. TRIP EXECUTION

Saat perjalanan berjalan:

```text
Trip Ready
↓
Departure
↓
Pickup
↓
Activity
↓
Hotel
↓
Tour
↓
Return
↓
Trip Completed
```

Guide atau operational staff dapat menggunakan:

- Itinerary
- Manifest
- Customer information
- Checklist
- Notes
- Operational instructions

---

# 36. TRIP COMPLETION

Setelah trip selesai:

- Trip status menjadi Completed
- Checklist diselesaikan
- Expense dicatat
- Vendor cost diperbarui
- Commission diproses
- Customer feedback dikumpulkan
- Trip report dibuat jika diperlukan
- Profit diperbarui

---

# 37. CANCELLATION PROCESS

Cancellation dapat berasal dari:

- Customer
- Vendor
- Internal
- Operational issue

Flow:

```text
Cancellation Request
↓
Check Cancellation Policy
↓
Calculate Penalty / Refund
↓
Approval
↓
Cancel Vendor Services
↓
Update Booking
↓
Process Refund
↓
Update Finance
↓
Update CRM
```

Cancellation policy akan ditentukan dalam Business Rules.

---

# 38. RESCHEDULE PROCESS

Flow:

```text
Reschedule Request
↓
Check New Availability
↓
Check Vendor Policy
↓
Calculate Additional Cost / Refund
↓
Approval
↓
Update Booking
↓
Update Vendor
↓
Update Trip
↓
Update Schedule
```

---

# 39. REFUND PROCESS

Flow:

```text
Refund Request
↓
Verification
↓
Check Policy
↓
Calculate Refund
↓
Approval
↓
Refund Payment
↓
Finance Record
↓
CRM Record
↓
Booking Updated
```

---

# 40. COMMISSION PROCESS

Commission dapat berlaku untuk:

- Sales
- Guide
- Reseller
- Agent
- Partner
- Other eligible parties

Flow:

```text
Booking
↓
Commission Rule
↓
Calculate
↓
Approval
↓
Pay
↓
Commission Record
```

Commission harus dapat dilacak ke booking asal.

---

# 41. MARKETING PROCESS

Marketing menghasilkan awareness dan lead.

Flow:

```text
Campaign
↓
Advertisement / Content
↓
Lead
↓
CRM
↓
Sales
↓
Quotation
↓
Booking
↓
Revenue
```

Marketing performance dapat diukur berdasarkan:

- Leads
- Conversion
- Booking
- Revenue
- Campaign

---

# 42. FINANCE PROCESS

Finance terhubung dengan seluruh proses.

```text
Sales
↓
Revenue
↓
Customer Payment
↓
Vendor Cost
↓
Expense
↓
Commission
↓
Profit
```

Finance dapat mencakup:

- Income
- Expense
- Accounts Receivable
- Accounts Payable
- Customer Payment
- Vendor Payment
- Refund
- Commission
- Cash
- Bank
- Cash Flow
- Profit

Accounting rules final ditentukan dalam dokumen Business Rules.

---

# 43. PROFIT PROCESS

Contoh dasar:

```text
Selling Price
-
Discount
=
Net Revenue

Net Revenue
-
Vendor Cost
-
Operational Cost
-
Commission
-
Other Cost
=
Profit
```

Rumus final mengikuti kebijakan finance perusahaan.

Profit dapat dianalisis berdasarkan:

- Booking
- Trip
- Package
- Product
- Project
- Customer
- Sales
- Period

---

# 44. DOCUMENT GENERATION

Sistem harus dapat menghasilkan dokumen berdasarkan data transaksi.

Dokumen dapat mencakup:

- Quotation
- Invoice
- Receipt
- Booking Confirmation
- Voucher
- Itinerary
- Manifest
- Purchase Order
- Vendor Order
- Trip Report

Flow:

```text
System Data
↓
Document Template
↓
Automatic Generation
↓
Preview
↓
Print / PDF
↓
Send
↓
Store in CRM / Transaction
```

---

# 45. CRM TRANSACTION HISTORY

Customer Record harus dapat menampilkan seluruh riwayat.

Contoh:

```text
CUSTOMER
│
├── Lead
├── Communication
├── Quotations
├── Orders
├── Bookings
├── Invoices
├── Payments
├── Receipts
├── Trips
└── Feedback
```

Dengan demikian staff tidak perlu mencari informasi customer dari banyak tempat.

---

# 46. OWNER & MANAGER PROCESS

Owner dan Manager membutuhkan visibility terhadap bisnis.

Dashboard dapat menampilkan:

- Sales
- Booking
- Revenue
- Payment
- Outstanding
- Expense
- Profit
- Trip
- Operational status
- Employee workload
- Product performance
- Customer growth
- Marketing performance

Dashboard detail akan ditentukan dalam PRD.

---

# 47. EMPLOYEE WORKFLOW

Setiap employee memiliki pekerjaan sesuai role.

Flow umum:

```text
Task / Assignment
↓
Employee
↓
Accept
↓
In Progress
↓
Completed
↓
Manager Review
```

Tidak semua pekerjaan memerlukan approval manager.

Aturan final ditentukan berdasarkan role dan business rules.

---

# 48. DAILY OPERATIONAL CHECK

Pada akhir atau awal hari, team dapat memeriksa:

- Booking baru
- Payment
- Outstanding
- Quotation
- Follow-up
- Trip hari ini
- Trip besok
- Departure
- Employee assignment
- Vendor confirmation
- Operational issue
- Finance transaction

---

# 49. MANAGEMENT REVIEW

## Daily

- Sales
- Booking
- Payment
- Trip hari ini
- Trip berikutnya
- Assignment
- Operational issue

## Weekly

- Sales performance
- Booking
- Revenue
- Profit
- Marketing
- Vendor
- Customer
- Employee
- Operational issue

## Monthly

- Revenue
- Cost
- Profit
- Cash flow
- Product performance
- Sales performance
- Marketing performance
- Vendor performance
- Employee performance
- Customer growth

---

# 50. EXCEPTION HANDLING

Sistem harus mendukung kondisi tidak normal.

## Hotel Full

```text
Check Availability
↓
Unavailable
↓
Notify Staff
↓
Select Alternative
↓
Update Cost / Price
↓
Customer Approval
```

## Guide Unavailable

```text
Assignment
↓
Conflict / Unavailable
↓
Warning
↓
Find Replacement
↓
Assign Replacement
↓
Notify
```

## Vendor Cancellation

```text
Vendor Cancellation
↓
Operational Alert
↓
Find Alternative Vendor
↓
Recalculate Cost
↓
Update Booking
↓
Notify Customer if Required
```

## Customer Change Request

```text
Customer Request
↓
Review Booking
↓
Check Availability
↓
Calculate Difference
↓
Approval
↓
Update Booking
↓
Update Vendor
↓
Update Invoice
```

---

# 51. APPROVAL PROCESS

Approval dapat diperlukan untuk:

- Large discount
- Refund
- Cancellation
- Special pricing
- Vendor purchase
- Expense
- Commission
- Project budget
- Financial adjustment

Approval hierarchy akan ditentukan dalam Business Rules & Roles & Permissions.

---

# 52. MASTER BUSINESS FLOW

```text
MARKETING / WEBSITE / SOCIAL MEDIA / REFERRAL
                    ↓
                   LEAD
                    ↓
                   CRM
                    ↓
             CUSTOMER INQUIRY
                    ↓
                  SALES
                    ↓
                QUOTATION
                    ↓
            CUSTOMER APPROVAL
                    ↓
                  ORDER
                    ↓
                 BOOKING
                    ↓
                 INVOICE
                    ↓
                 PAYMENT
                    ↓
          OPERATIONAL PLANNING
                    ↓
           VENDOR CONFIRMATION
                    ↓
             EMPLOYEE ASSIGNMENT
                    ↓
                   TRIP
                    ↓
             TRIP EXECUTION
                    ↓
             TRIP COMPLETION
                    ↓
             EXPENSE / COST
                    ↓
                 FINANCE
                    ↓
                  PROFIT
                    ↓
             CUSTOMER FEEDBACK
                    ↓
             REPEAT / REFERRAL
```

---

# 53. DATA TRACEABILITY

Seluruh proses harus dapat ditelusuri.

Contoh:

```text
Customer
   ↓
Lead
   ↓
Quotation
   ↓
Order
   ↓
Booking
   ↓
Invoice
   ↓
Payment
   ↓
Trip
   ↓
Vendor
   ↓
Assignment
   ↓
Expense
   ↓
Profit
```

Setiap transaksi harus memiliki hubungan yang jelas dengan transaksi atau record terkait.

---

# 54. SOP DEVELOPMENT STANDARD

SOP individual yang dibuat setelah dokumen ini harus memiliki:

**Nama Proses**

**Tujuan**

**Trigger**

**Input**

**PIC**

**Role yang Terlibat**

**Langkah Proses**

**Output**

**Status**

**Approval**

**Exception**

**Dokumen yang Dihasilkan**

**Data yang Dicatat**

**Related Module**

---

# 55. BUSINESS DECISION REQUIRED

Dokumen ini sengaja belum menetapkan beberapa aturan bisnis.

Contoh:

- Minimum DP
- Payment deadline
- Cancellation policy
- Refund policy
- Reschedule policy
- Discount authority
- Commission rules
- Tax rules
- Vendor payment terms
- Customer credit terms
- Pricing rules
- Availability rules
- Booking confirmation rules
- Approval hierarchy
- Accounting rules

Semua aturan tersebut harus ditentukan dalam:

`03_BUSINESS_RULES_AND_POLICY.md`

Jika belum diputuskan, jangan diasumsikan.

---

# 56. SYSTEM PRINCIPLE

ERP harus membuat pekerjaan lebih sederhana, bukan lebih rumit.

Tujuan utama:

```text
Input Once
↓
Use Many Times
↓
Connect Everything
↓
Track Everything Important
↓
Reduce Manual Work
↓
Improve Control
```

Contoh:

Customer dimasukkan sekali.

Data tersebut dapat digunakan untuk:

- Quotation
- Booking
- Invoice
- Receipt
- Voucher
- Trip
- CRM history
- Reporting

---

# 57. DOCUMENT STATUS

**Document:** Business Process & SOP

**File:** `02_BUSINESS_PROCESS_AND_SOP.md`

**Version:** 1.0

**Status:** Foundation Draft

**Purpose:** Menjadi dasar untuk Business Rules, PRD, Module Specification, Workflow, Data Model, dan Development.

**Important:** Dokumen teknis tidak boleh mengubah proses bisnis yang telah disetujui tanpa business decision.

---

# 58. NEXT DOCUMENT

Dokumen berikutnya:

`03_BUSINESS_RULES_AND_POLICY.md`

Dokumen tersebut akan menentukan aturan konkret seperti:

- DP
- Payment
- Cancellation
- Refund
- Reschedule
- Discount
- Commission
- Pricing
- Vendor
- Approval
- Customer credit
- Availability
- Booking rules
- Finance rules
- Operational rules