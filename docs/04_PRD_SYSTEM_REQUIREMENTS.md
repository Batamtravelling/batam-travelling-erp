# BATAM TRAVELLING ERP
# PRODUCT REQUIREMENTS DOCUMENT (PRD)

**File Name:** `04_PRD_SYSTEM_REQUIREMENTS.md`  
**Document Number:** 04  
**Version:** 1.0  
**Status:** APPROVED SYSTEM REQUIREMENTS BASELINE  
**Project:** Batam Travelling ERP  
**Last Updated:** 2026-08-08

---

# 1. PURPOSE

Dokumen ini menerjemahkan:

- Business Foundation
- Business Process & SOP
- Business Rules & Policy

menjadi kebutuhan sistem ERP Batam Travelling.

Dokumen ini menjadi dasar untuk:

- Architecture
- Database
- Backend
- Frontend
- API
- UI/UX
- Workflow
- Permission
- Reporting
- Website
- POS
- Development

---

# 2. SYSTEM VISION

Batam Travelling ERP adalah sistem terintegrasi untuk mengelola bisnis travel dari:

```text id="y5fqkk"
Marketing
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
Payment
↓
Invoice
↓
Operations
↓
Trip
↓
Completion
↓
Commission
↓
Profit
↓
Customer History
```

Sistem harus menghindari database terpisah untuk setiap fungsi.

---

# 3. CORE SYSTEM PRINCIPLE

ERP harus:

1. Modular.
2. Terintegrasi.
3. Mobile-friendly.
4. Web-based.
5. Role-based.
6. Secure.
7. Auditable.
8. Scalable.
9. Mudah digunakan staff non-teknis.
10. Tidak bergantung pada AI.
11. Tidak menggunakan hard-coded business rules jika dapat dibuat configurable.
12. Memiliki satu sumber data utama.

---

# 4. SYSTEM CHANNELS

Sistem terdiri dari beberapa interface:

## 4.1 Internal ERP

Digunakan oleh:

- Owner
- Manager
- Sales
- CS
- Operations
- Finance
- Marketing
- Guide
- Driver
- Staff

## 4.2 POS

Digunakan untuk:

- Walk-in customer
- Direct sales
- Quick booking
- Payment
- Invoice
- Receipt

## 4.3 Customer Website

Customer dapat:

- Browse package
- View itinerary
- View availability
- Request booking
- Make booking
- Upload payment proof
- View booking
- Request cancellation
- Request reschedule

## 4.4 Future Customer Portal

Dapat dikembangkan untuk:

- Booking history
- Payment
- Invoice
- Voucher
- Itinerary
- Trip information

---

# 5. SYSTEM MODULES

ERP harus memiliki modul:

```text id="5e2w9x"
01 Dashboard
02 CRM
03 Customers
04 Leads
05 Sales
06 Products
07 Packages
08 Pricing
09 Availability
10 Quotation
11 Orders
12 Booking
13 POS
14 Invoice
15 Payment
16 Refund
17 Cancellation
18 Reschedule
19 Vendor
20 Purchasing
21 Operations
22 Trip / Departure
23 Employee
24 Task
25 Planner
26 Project
27 Commission
28 Expense
29 Finance
30 Reports
31 Website Content
32 Documents
33 Notifications
34 Users
35 Roles & Permissions
36 Business Settings
37 Audit Log
```

---

# 6. DASHBOARD MODULE

Dashboard harus menyesuaikan role.

---

## 6.1 Owner Dashboard

Owner dapat melihat:

- Total Sales
- Revenue
- Profit
- Booking
- Pax
- Outstanding
- Refund
- Commission
- Expense
- Sales Performance
- Product Performance
- Package Performance
- Vendor Cost
- Upcoming Trip
- CRM Pipeline

Dashboard harus memiliki filter:

- Today
- This Week
- This Month
- This Year
- Custom Date

---

# 7. MANAGER DASHBOARD

Manager dapat melihat:

- Sales
- Booking
- Team performance
- Outstanding
- Operational
- Upcoming trip
- Task
- Approval
- Vendor
- Customer
- CRM
- Project

---

# 8. EMPLOYEE DASHBOARD

Employee dashboard menampilkan:

- My Tasks
- My Leads
- My Customers
- My Bookings
- My Assignments
- Upcoming Trips
- Follow-up
- Notifications
- Calendar

Konten dashboard mengikuti role.

---

# 9. SALES DASHBOARD

Sales dapat melihat:

- My Leads
- New Leads
- Follow-up Today
- Pending Quotation
- Negotiation
- Won
- Lost
- My Sales
- Pending Payment
- Overdue Customer
- Upcoming Booking

---

# 10. CRM MODULE

CRM menjadi pusat customer relationship.

CRM harus terhubung dengan:

- Customer
- Lead
- Sales
- Quotation
- Booking
- Payment
- Invoice
- Cancellation
- Reschedule
- Trip
- Feedback

---

# 11. CRM CUSTOMER PROFILE

Customer profile harus memiliki:

### Basic Information

- Customer ID
- Name
- Phone
- Email
- Address
- Customer Type

### Sales Information

- Lead Source
- Assigned Sales
- Total Booking
- Total Revenue
- Last Booking
- Next Follow-up

### History

- Conversation
- Follow-up
- Quotation
- Booking
- Payment
- Invoice
- Refund
- Cancellation
- Reschedule
- Trip

---

# 12. CRM FOLLOW-UP

Follow-up memiliki:

- Follow-up ID
- Customer
- PIC
- Related Lead/Booking
- Date
- Due date
- Channel
- Notes
- Result
- Next action
- Next follow-up

Status:

```text id="3f9n4c"
Pending
In Progress
Completed
Cancelled
Overdue
```

---

# 13. LEAD MANAGEMENT

Lead memiliki:

- Lead ID
- Name
- Phone
- Email
- Source
- Requirement
- Travel Date
- Pax
- Estimated Value
- PIC
- Status

Lead pipeline:

```text id="f5jvme"
New
↓
Contacted
↓
Qualified
↓
Quotation
↓
Negotiation
↓
Won / Lost
```

---

# 14. LEAD SOURCE

System harus mendukung:

- Website
- WhatsApp
- Instagram
- Facebook
- TikTok
- Google
- Advertising
- Referral
- Walk-in
- Reseller
- Existing Customer
- Corporate
- Other

---

# 15. PRODUCT MODULE

Product master memiliki:

- Product ID
- Code
- Name
- Category
- Description
- Cost
- Selling Price
- Unit
- Status
- Vendor
- Tags
- Documents

---

# 16. PACKAGE MODULE

Package memiliki:

- Package ID
- Code
- Name
- Destination
- Duration
- Description
- Image
- Included
- Excluded
- Itinerary
- Price
- Cost
- Margin
- Availability
- Payment Policy
- Cancellation Policy
- Reschedule Policy
- Status

---

# 17. PACKAGE BUILDER

Admin dapat membuat package menggunakan components:

```text id="4izjwm"
Hotel
Ferry
Transport
Guide
Driver
Activity
Meal
Ticket
Documentation
Other
```

Package builder harus dapat menghitung:

- Total Cost
- Selling Price
- Margin
- Markup

---

# 18. ITINERARY BUILDER

Package dapat memiliki itinerary per hari.

Contoh:

```text id="c7n7cu"
Day 1
Arrival
Transfer
Hotel Check-in

Day 2
City Tour
Shopping
Activity

Day 3
Free Time
Check-out
Departure
```

Itinerary dapat digunakan untuk:

- Website
- Quotation
- Booking Confirmation
- Customer document
- Internal Operation

---

# 19. PACKAGE PUBLIC CONTENT

Package harus memiliki konten yang dapat dibaca customer:

- Overview
- Highlights
- Itinerary
- Included
- Excluded
- Important Information
- Terms
- Cancellation Policy
- Reschedule Policy
- Payment Policy
- FAQ

Konten public dipisahkan dari internal notes.

---

# 20. PRICING MODULE

Pricing harus mendukung:

- Standard price
- Manual price
- Automatic price
- Custom price
- Discount
- Margin
- Markup
- Pax pricing
- Tier pricing
- Seasonal pricing
- Special pricing

---

# 21. PRICING ENGINE

Pricing engine menghitung:

```text id="k4l7w8"
Cost
+
Markup / Margin Rule
+
Additional Service
-
Discount
=
Selling Price
```

Margin harus dihitung secara real-time.

---

# 22. PRICE OVERRIDE

Price override harus menyimpan:

- Original price
- New price
- Reason
- User
- Approval
- Date

---

# 23. AVAILABILITY MODULE

Availability harus dapat mengelola:

- Hotel
- Ferry
- Vehicle
- Driver
- Guide
- Activity
- Other resources

Availability dapat berdasarkan:

- Date
- Time
- Capacity
- Resource

---

# 24. QUOTATION MODULE

Quotation dapat dibuat dari:

- Lead
- Customer
- Package
- Custom Trip

Quotation memiliki:

- Number
- Date
- Valid until
- Customer
- Items
- Quantity/Pax
- Price
- Discount
- Total
- Terms
- Notes
- Sales

---

# 25. QUOTATION ACTIONS

User dapat:

- Create
- Edit
- Preview
- Print
- Generate PDF
- Send
- Duplicate
- Approve
- Reject
- Convert to Booking

---

# 26. BOOKING MODULE

Booking dapat berasal dari:

- Website
- POS
- Quotation
- Sales
- Manual authorized entry

Booking memiliki:

- Booking ID
- Customer
- Package/Product
- Travel date
- Pax
- Price
- Payment
- Status
- Sales
- Operation
- Documents

---

# 27. BOOKING STATUS

```text id="i6k4cy"
Draft
Pending Payment
Confirmed
Ready
On Going
Completed
Cancelled
```

---

# 28. BOOKING SNAPSHOT

Saat booking dibuat, sistem harus menyimpan snapshot:

- Selling price
- Cost
- Package
- Payment policy
- Cancellation policy
- Reschedule policy
- Commission policy
- Vendor cost

Perubahan master data tidak boleh mengubah booking lama.

---

# 29. POS MODULE

POS harus mendukung:

- Customer search/create
- Product search
- Package search
- Quick booking
- Add service
- Discount
- Payment
- Invoice
- Receipt
- Print

POS menggunakan master data ERP.

---

# 30. INVOICE MODULE

Invoice dapat dibuat dari:

- Booking
- Order
- POS

Invoice memiliki:

- Invoice Number
- Customer
- Booking
- Items
- Subtotal
- Discount
- Tax jika berlaku
- Total
- Paid
- Outstanding
- Status

---

# 31. PAYMENT MODULE

Payment memiliki:

- Payment ID
- Invoice
- Booking
- Customer
- Amount
- Method
- Date
- Reference
- Proof
- Verification status

---

# 32. PAYMENT VERIFICATION

Payment status:

```text id="8n1nuw"
Pending Verification
Verified
Rejected
Cancelled
```

Customer atau Sales dapat upload proof.

Finance/authorized user melakukan verification.

---

# 33. PAYMENT REMINDER

System harus dapat membuat:

- Payment due reminder
- Overdue reminder
- CRM follow-up

Reminder dapat diarahkan kepada:

- Customer
- Sales/PIC
- Finance
- Manager

---

# 34. REFUND MODULE

Refund memiliki:

- Refund ID
- Booking
- Invoice
- Payment
- Amount
- Reason
- Method
- Status
- Approver
- Date

Status:

```text id="s3p2rs"
Requested
Pending Approval
Approved
Rejected
Processing
Completed
Cancelled
```

---

# 35. CANCELLATION MODULE

Cancellation Request memiliki:

- Request ID
- Booking
- Customer
- Reason
- Request date
- Policy
- Penalty
- Refund
- Approval
- Status

---

# 36. RESCHEDULE MODULE

Reschedule Request memiliki:

- Request ID
- Booking
- Old date
- New date
- Reason
- Availability
- Cost difference
- Penalty
- Refund
- Approval
- Status

---

# 37. VENDOR MODULE

Vendor memiliki:

- Vendor ID
- Name
- Category
- Contact
- Address
- Bank information
- Payment terms
- Status
- Documents

---

# 38. VENDOR APPROVAL

Vendor baru:

```text id="uw2l3e"
Draft
↓
Pending Approval
↓
Manager Approved
↓
Active
```

---

# 39. VENDOR PRICING

Vendor pricing mendukung:

- Date range
- Season
- Pax
- Weekend
- Weekday
- Corporate
- Special agreement
- Service
- Capacity

Harga vendor memiliki versioning.

---

# 40. VENDOR AVAILABILITY

System dapat menampilkan vendor alternatif berdasarkan:

- Availability
- Cost
- Capacity
- Service
- Location
- Status

Operations memilih vendor.

---

# 41. PURCHASING MODULE

Purchasing digunakan untuk kebutuhan vendor/service.

Dapat memiliki:

- Purchase Request
- Purchase Order
- Vendor Bill
- Vendor Payment

Workflow:

```text id="v4j7kq"
Request
↓
Approval
↓
Purchase Order
↓
Vendor
↓
Service
↓
Vendor Bill
↓
Payment
```

---

# 42. OPERATIONS MODULE

Operations mengelola:

- Confirmed booking
- Vendor
- Resource
- Trip
- Employee
- Task
- Itinerary
- Schedule
- Manifest

---

# 43. TRIP MODULE

Trip memiliki:

- Trip ID
- Booking(s)
- Departure date
- Return date
- Destination
- Package
- Customer/Pax
- Employee
- Vehicle
- Vendor
- Status
- Itinerary
- Documents

---

# 44. TRIP SCHEDULE

Operations membuat:

```text id="jj6lyr"
Draft
↓
Manager Review
↓
Approved
↓
Ready
```

---

# 45. TRIP ASSIGNMENT

Satu trip dapat memiliki beberapa assignment:

- Trip Leader
- Guide
- Driver
- Support
- Other roles

---

# 46. EMPLOYEE MODULE

Employee memiliki:

- Employee ID
- Name
- Role
- Phone
- Status
- Skills
- Availability
- Schedule

---

# 47. EMPLOYEE SCHEDULE

Calendar harus menampilkan:

- Work schedule
- Trip assignment
- Task
- Leave jika tersedia
- Conflict

---

# 48. TASK MODULE

Task memiliki:

- Task ID
- Title
- Description
- Related module
- Related record
- PIC
- Due date
- Priority
- Status

---

# 49. PLANNER MODULE

Planner menyediakan:

- Calendar
- Trip
- Employee
- Task
- Booking
- Vendor
- Schedule

Planner harus dapat digunakan untuk melihat conflict.

---

# 50. PROJECT MODULE

Project dapat digunakan untuk:

- Corporate travel
- Group trip
- Event
- Special trip
- Custom travel

Project memiliki:

- Project ID
- Customer
- Manager
- Budget
- Revenue
- Cost
- Tasks
- Vendor
- Employee
- Schedule
- Documents
- Profit

---

# 51. COMMISSION MODULE

Commission module harus dapat:

- Calculate commission
- Track earned
- Track eligible
- Track paid
- Adjust
- Reverse
- Report

Commission dapat berdasarkan:

- Revenue
- Profit
- Fixed amount

---

# 52. EXPENSE MODULE

Expense dapat dibuat untuk:

- Trip
- Project
- Operations
- Office
- Other

Expense memiliki:

- Amount
- Category
- Date
- Description
- Attachment
- Approval
- Payment

---

# 53. FINANCE MODULE

Finance minimal mendukung:

- Invoice
- Payment
- Receipt
- Refund
- Expense
- Vendor payment
- Outstanding
- Profit

Sistem dapat dikembangkan ke accounting penuh pada fase berikutnya.

---

# 54. REPORT MODULE

Report minimum:

### Sales

- Sales by employee
- Sales by package
- Sales by source
- Conversion

### Booking

- Booking by date
- Booking by package
- Pax
- Booking status

### Finance

- Revenue
- Payment
- Outstanding
- Refund
- Expense

### Vendor

- Vendor cost
- Vendor usage
- Vendor performance

### Profit

- Cost
- Revenue
- Margin
- Commission
- Profit

### CRM

- Leads
- Follow-up
- Conversion
- Customer history

---

# 55. DOCUMENT MODULE

System harus dapat menghasilkan:

- Quotation
- Invoice
- Receipt
- Booking Confirmation
- Voucher
- Itinerary
- Manifest
- Purchase Order
- Vendor Document

Format minimum:

- Printable
- PDF

---

# 56. WEBSITE CONTENT MODULE

Admin dapat mengelola:

- Package
- Destination
- Itinerary
- Hotel
- Activity
- FAQ
- Terms
- Cancellation Policy
- Payment Policy
- Contact information

Public content harus dapat dipublish/unpublish.

---

# 57. WEBSITE BOOKING

Website harus dapat:

```text id="xv1drq"
Customer
↓
Select Package
↓
Select Date
↓
Select Pax
↓
Check Availability
↓
Price Calculation
↓
Customer Information
↓
Booking Request
↓
Payment
↓
Booking Status
```

---

# 58. CUSTOMER DOCUMENT DELIVERY

Setelah booking/payment sesuai kondisi:

System dapat menghasilkan:

- Invoice
- Receipt
- Booking confirmation
- Itinerary
- Voucher

Dokumen dapat:

- Download
- Print
- Send

---

# 59. NOTIFICATION MODULE

Notification untuk:

- New Lead
- New Booking
- Payment
- Payment verification
- Payment due
- Overdue
- Approval
- Assignment
- Trip reminder
- Task
- Vendor issue

---

# 60. USER MODULE

User memiliki:

- User ID
- Name
- Email/Phone
- Username
- Password/authentication
- Role
- Status
- Employee link

---

# 61. ROLE & PERMISSION MODULE

Permission harus mendukung:

- View
- Create
- Edit
- Delete/Archive
- Approve
- Cancel
- Refund
- Export
- Print
- Manage Settings

Permission diterapkan per module/action jika memungkinkan.

---

# 62. AUDIT LOG MODULE

Audit log menyimpan:

- User
- Date/time
- Module
- Record
- Action
- Previous value
- New value
- IP/device information jika tersedia dan sesuai kebutuhan keamanan

---

# 63. BUSINESS SETTINGS

Admin/Owner dapat mengatur:

- Company information
- Currency
- Numbering
- Payment
- DP
- Margin
- Discount
- Refund
- Commission
- Tax
- Notification
- Document template

Access harus dibatasi.

---

# 64. SEARCH

System harus memiliki global search untuk menemukan:

- Customer
- Lead
- Booking
- Quotation
- Invoice
- Payment
- Vendor
- Package
- Product
- Trip
- Project

---

# 65. FILTERING

List harus mendukung:

- Search
- Filter
- Sort
- Date range
- Status
- Assigned user
- Package
- Customer
- Vendor

---

# 66. FILE & DOCUMENT ATTACHMENT

Record tertentu dapat memiliki attachment:

- Payment proof
- Customer document
- Vendor document
- Invoice
- Quotation
- Contract
- Expense proof
- Other supporting documents

File harus memiliki:

- Name
- Type
- Size
- Uploaded by
- Date
- Related record

---

# 67. DATA INTEGRITY

System harus menjaga:

- Unique IDs
- Referential integrity
- Historical snapshots
- Transaction consistency
- Permission validation
- Approval validation

---

# 68. SECURITY REQUIREMENTS

Minimum:

- Authentication
- Authorization
- Password security
- Session security
- Role-based access
- Audit log
- Secure file access
- Input validation

---

# 69. PERFORMANCE PRINCIPLE

System harus tetap usable ketika jumlah:

- Customer
- Booking
- Product
- Package
- Vendor
- Transaction
- Documents

bertambah.

Database dan architecture harus dibuat scalable.

---

# 70. RESPONSIVE DESIGN

Internal ERP dan website harus dapat digunakan pada:

- Desktop
- Laptop
- Tablet
- Mobile

Prioritas:

### Desktop

Owner, Manager, Finance, Operations.

### Mobile

Sales, Guide, Driver, Field Staff.

---

# 71. NO AI REQUIREMENT

ERP fase awal:

**Tidak menggunakan AI.**

Tidak diperlukan:

- AI chatbot
- AI recommendation
- AI forecasting
- AI automation
- AI agent

AI dapat dipertimbangkan pada fase berikutnya setelah core ERP stabil.

---

# 72. INTEGRATION PRINCIPLE

Architecture harus memungkinkan integrasi dengan:

- Website
- WhatsApp
- Payment Gateway
- Email
- Accounting
- Maps
- Other services

Namun integrasi tidak harus seluruhnya dibangun pada fase pertama.

---

# 73. API PRINCIPLE

System harus memiliki struktur API yang memungkinkan:

- Website
- POS
- Mobile interface
- External integration

menggunakan data ERP.

API harus mengikuti authorization dan permission.

---

# 74. ERROR HANDLING

System harus memberikan error yang jelas.

Contoh:

```text id="4z2dny"
Payment cannot be confirmed
because verification is pending.
```

Hindari technical error yang tidak dapat dipahami staff.

---

# 75. WORKFLOW ENGINE PRINCIPLE

Workflow harus dapat mengelola:

- Approval
- Assignment
- Status transition
- Notification
- Follow-up

Business-critical workflow tidak boleh hanya bergantung pada frontend.

Backend harus melakukan validation.

---

# 76. STATUS ENGINE

Status transition harus divalidasi.

Contoh:

```text id="czzv5f"
Quotation
Draft
↓
Sent
↓
Approved
↓
Converted
```

User tidak boleh melompati status tertentu tanpa permission.

---

# 77. MASTER DATA PRINCIPLE

Master data:

- Customer
- Product
- Package
- Vendor
- Employee
- Pricing
- Payment Policy
- Cancellation Policy
- Reschedule Policy
- Commission Policy

harus menjadi sumber data utama.

---

# 78. TRANSACTION PRINCIPLE

Transaction data:

- Lead
- Quotation
- Order
- Booking
- Invoice
- Payment
- Refund
- Cancellation
- Reschedule
- Trip
- Expense
- Commission

harus terhubung dengan master data.

---

# 79. CORE DATA RELATIONSHIP

Minimal relationship:

```text id="0k1p6a"
Customer
  ↓
Lead
  ↓
Quotation
  ↓
Booking
  ↓
Invoice
  ↓
Payment
  ↓
Trip
  ↓
Completion
  ↓
Commission
  ↓
Profit
```

Dengan relationship tambahan:

```text id="gjb9so"
Booking
 ├── Package
 ├── Customer
 ├── Vendor
 ├── Employee
 ├── Payment
 ├── Invoice
 ├── Cancellation
 ├── Reschedule
 ├── Expense
 └── Documents
```

---

# 80. DEVELOPMENT PRIORITY

ERP tidak dibangun sekaligus.

## PHASE 1 — CORE

Prioritas:

1. Authentication
2. Users
3. Roles
4. Customer
5. CRM
6. Lead
7. Product
8. Package
9. Pricing
10. Quotation
11. Booking
12. Invoice
13. Payment

---

# 81. PHASE 2 — OPERATIONS

1. Vendor
2. Availability
3. Trip
4. Employee
5. Assignment
6. Task
7. Planner
8. Itinerary
9. Voucher
10. Manifest

---

# 82. PHASE 3 — FINANCE & CONTROL

1. Refund
2. Cancellation
3. Reschedule
4. Commission
5. Expense
6. Vendor payment
7. Profit
8. Advanced reports
9. Audit
10. Approval

---

# 83. PHASE 4 — WEBSITE & POS

1. Public website integration
2. Package publishing
3. Website booking
4. Customer portal
5. POS
6. Online payment
7. Document delivery

---

# 84. PHASE 5 — ADVANCED

Possible future:

- Accounting integration
- Payment gateway
- WhatsApp integration
- Mobile app
- Advanced analytics
- Automation
- AI

AI is explicitly excluded from the initial ERP.

---

# 85. MVP DEFINITION

MVP harus sudah mampu menjalankan siklus:

```text id="lq2x3p"
Customer
↓
Lead
↓
Quotation
↓
Booking
↓
Invoice
↓
Payment
↓
Confirmed Booking
↓
Trip
↓
Completion
```

Jika siklus ini belum berjalan dengan baik, jangan menambah fitur kompleks.

---

# 86. ACCEPTANCE PRINCIPLE

Sebuah module dianggap selesai jika:

1. Function berjalan.
2. Permission berjalan.
3. Validation berjalan.
4. Data tersimpan benar.
5. Relationship berjalan.
6. Audit tercatat untuk aktivitas penting.
7. Error handling jelas.
8. Responsive.
9. Tidak merusak module lain.
10. Dapat diuji.

---

# 87. DEVELOPMENT RULE

Claude/developer harus:

1. Membaca dokumen 01–03 sebelum mengembangkan module.
2. Tidak mengubah business rule tanpa persetujuan.
3. Tidak membuat feature di luar PRD tanpa alasan.
4. Tidak menghapus data existing tanpa approval.
5. Tidak hard-code business settings jika seharusnya configurable.
6. Mengembangkan module secara bertahap.
7. Menguji setiap module sebelum melanjutkan.
8. Menjaga backward compatibility.
9. Menjaga audit trail.
10. Mendokumentasikan perubahan.

---

# 88. CHANGE REQUEST

Jika ada permintaan fitur baru:

```text id="q8c9eq"
Feature Request
↓
Business Impact
↓
PRD Impact
↓
Database Impact
↓
Permission Impact
↓
Workflow Impact
↓
Approval
↓
Development
```

---

# 89. OUT OF SCOPE — PHASE 1

Fitur berikut tidak menjadi prioritas fase awal:

- AI
- Full accounting ERP
- Advanced payroll
- Complex warehouse
- Multi-company
- Advanced AI forecasting
- Complex loyalty engine
- Marketplace
- Advanced automation

Fitur dapat ditambahkan setelah core ERP stabil.

---

# 90. FINAL SYSTEM OBJECTIVE

ERP Batam Travelling harus menjadi satu sistem terpadu yang memungkinkan perusahaan mengelola:

```text id="4ihq5d"
MARKETING
↓
CRM
↓
SALES
↓
PACKAGE
↓
QUOTATION
↓
BOOKING
↓
PAYMENT
↓
INVOICE
↓
OPERATIONS
↓
TRIP
↓
CUSTOMER EXPERIENCE
↓
COMMISSION
↓
FINANCE
↓
PROFIT
```

Semua data harus terhubung dan dapat ditelusuri.

---

# 91. NEXT DOCUMENT

Dokumen berikutnya:

`05_MODULE_SPECIFICATIONS.md`

Dokumen 05 akan membedah setiap module secara lebih teknis dan operasional:

- tujuan module,
- halaman,
- field,
- tombol,
- status,
- workflow,
- validation,
- permission,
- relationship,
- action,
- report,
- acceptance criteria.

Development harus dimulai dari module prioritas, bukan seluruh ERP sekaligus.

---

# 92. DOCUMENT STATUS

**APPROVED SYSTEM REQUIREMENTS BASELINE v1.0**

Dokumen ini menjadi baseline kebutuhan sistem.

Setiap perubahan besar harus dicatat sebagai perubahan versi.

**End of Document**