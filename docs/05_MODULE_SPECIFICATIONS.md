# BATAM TRAVELLING ERP
# MODULE SPECIFICATIONS

**File Name:** `05_MODULE_SPECIFICATIONS.md`  
**Document Number:** 05  
**Version:** 1.0  
**Status:** SYSTEM MODULE BASELINE  
**Project:** Batam Travelling ERP  
**Last Updated:** 2026-08-08

---

# 1. PURPOSE

Dokumen ini menerjemahkan `04_PRD_SYSTEM_REQUIREMENTS.md` menjadi spesifikasi masing-masing module.

Dokumen ini menjadi acuan untuk:

- UI/UX
- Database
- Backend
- Frontend
- API
- Workflow
- Permission
- Validation
- Testing

Setiap module harus dibangun berdasarkan spesifikasi ini.

---

# 2. MODULE ARCHITECTURE

ERP terdiri dari:

```text
CORE
├── Authentication
├── Users
├── Roles
├── Permissions
└── Settings

CRM
├── Customers
├── Leads
├── Follow-ups
└── Activities

SALES
├── Products
├── Packages
├── Pricing
├── Availability
├── Quotations
├── Orders
└── Bookings

FINANCE
├── Invoices
├── Payments
├── Receipts
├── Refunds
├── Expenses
└── Profit

OPERATIONS
├── Vendors
├── Purchasing
├── Trips
├── Employees
├── Assignments
├── Tasks
├── Planner
└── Itinerary

CONTROL
├── Commission
├── Approvals
├── Reports
├── Documents
├── Notifications
└── Audit Log

CHANNELS
├── Website
└── POS
```

---

# 3. COMMON MODULE STANDARD

Setiap module harus memiliki:

### List Page

- Search
- Filter
- Sort
- Pagination
- Export jika authorized
- Create button

### Detail Page

- Summary
- Related records
- Activity
- Documents
- Timeline jika relevan

### Form

- Required fields
- Validation
- Save
- Cancel
- Draft jika diperlukan

### Permission

- View
- Create
- Edit
- Approve
- Cancel
- Archive
- Export

---

# 4. COMMON STATUS PRINCIPLE

Status harus:

- jelas,
- konsisten,
- tervalidasi backend,
- tidak dapat dilompati sembarangan.

Status yang membutuhkan approval harus menggunakan approval workflow.

---

# 5. DASHBOARD MODULE

## 5.1 Purpose

Memberikan ringkasan kondisi bisnis berdasarkan role.

## 5.2 Owner Dashboard

### Widgets

- Revenue
- Sales
- Profit
- Booking
- Pax
- Outstanding
- Refund
- Commission
- Expense
- Upcoming Trips
- CRM Pipeline

### Filters

- Today
- Week
- Month
- Year
- Custom

---

## 5.3 Manager Dashboard

Widgets:

- Team Sales
- Booking
- Pending Approval
- Outstanding
- Operations
- Upcoming Trip
- Task
- Vendor
- Customer

---

## 5.4 Employee Dashboard

Widgets:

- My Tasks
- My Leads
- My Follow-ups
- My Bookings
- My Trips
- Notifications

---

# 6. CUSTOMER MODULE

## 6.1 Purpose

Menyimpan master customer.

## 6.2 Fields

```text
Customer ID
Customer Type
Full Name
Phone
Email
Address
City
Country
Notes
Lead Source
Assigned Sales
Status
Created Date
Updated Date
```

## 6.3 Customer Type

- Individual
- Family
- Group
- Corporate
- Agent
- Reseller
- Other

## 6.4 Status

- Active
- Inactive
- Blocked

## 6.5 Actions

- Create
- Edit
- View
- Archive
- Add Follow-up
- Create Quotation
- Create Booking
- View History

## 6.6 Related Records

Customer detail harus menampilkan:

- Leads
- Follow-ups
- Quotations
- Bookings
- Invoices
- Payments
- Refunds
- Trips
- Documents

---

# 7. CRM MODULE

## 7.1 Purpose

Mengelola hubungan customer dan aktivitas sales.

## 7.2 Lead Fields

```text
Lead ID
Customer
Lead Source
Requirement
Travel Date
Pax
Estimated Value
Assigned Sales
Priority
Status
Notes
Created Date
```

## 7.3 Lead Status

```text
New
Contacted
Qualified
Quotation
Negotiation
Won
Lost
```

## 7.4 Lead Actions

- Create
- Assign
- Contact
- Add Note
- Create Follow-up
- Create Quotation
- Convert
- Mark Lost

---

# 8. FOLLOW-UP MODULE

## Fields

```text
Follow-up ID
Customer
Lead
Booking
Assigned User
Due Date
Channel
Subject
Notes
Result
Next Action
Next Follow-up
Status
```

## Status

```text
Pending
In Progress
Completed
Overdue
Cancelled
```

## Automation

Jika overdue:

```text
Follow-up Overdue
↓
Notification
↓
CRM Dashboard
```

---

# 9. PRODUCT MODULE

## Fields

```text
Product ID
Code
Name
Category
Description
Unit
Cost
Selling Price
Vendor
Status
Public Description
Internal Notes
```

## Status

```text
Draft
Active
Inactive
Archived
```

## Actions

- Create
- Edit
- Duplicate
- Activate
- Deactivate
- Archive

---

# 10. PACKAGE MODULE

## Fields

```text
Package ID
Package Code
Name
Destination
Duration
Category
Description
Public Description
Internal Notes
Cost
Selling Price
Margin
Markup
Availability
Payment Policy
Cancellation Policy
Reschedule Policy
Status
```

## Actions

- Create
- Edit
- Duplicate
- Publish
- Unpublish
- Archive

---

# 11. PACKAGE BUILDER

Package Builder memungkinkan user menyusun package dari components.

## Components

```text
Hotel
Ferry
Transport
Driver
Guide
Activity
Meal
Ticket
Documentation
Other
```

Setiap component memiliki:

- Product/Vendor
- Quantity
- Unit
- Cost
- Selling Price
- Notes
- Optional/Included

System menghitung:

```text
Total Cost
Total Selling Price
Profit
Margin
Markup
```

---

# 12. ITINERARY BUILDER

## Structure

```text
Package
 ├── Day 1
 │    ├── Time
 │    ├── Activity
 │    ├── Location
 │    ├── Description
 │    └── Notes
 │
 ├── Day 2
 └── Day 3
```

## Fields

```text
Day
Time
Title
Location
Description
Duration
Included
Notes
```

Itinerary dapat dipublish ke website.

---

# 13. PRICING MODULE

## Pricing Types

```text
Standard
Manual
Automatic
Custom
Seasonal
Tier
Pax Based
Special Agreement
```

## Fields

```text
Pricing ID
Product/Package
Price Type
Cost
Selling Price
Margin
Markup
Pax From
Pax To
Start Date
End Date
Season
Priority
Status
```

---

# 14. PRICING ENGINE

Priority:

```text
Specific Rule
↓
Package Rule
↓
Product Rule
↓
Default Rule
```

Jika lebih dari satu rule cocok, gunakan priority tertinggi.

System harus menunjukkan alasan harga dipilih.

---

# 15. AVAILABILITY MODULE

## Resources

- Hotel
- Ferry
- Vehicle
- Driver
- Guide
- Activity
- Other

## Fields

```text
Resource
Date
Start Time
End Time
Capacity
Booked
Available
Status
```

## Status

- Available
- Limited
- Full
- Blocked

---

# 16. QUOTATION MODULE

## Fields

```text
Quotation Number
Customer
Sales
Quotation Date
Valid Until
Items
Pax
Subtotal
Discount
Tax
Total
Terms
Notes
Status
```

## Status

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

## Actions

- Save
- Preview
- PDF
- Print
- Send
- Duplicate
- Approve
- Reject
- Convert to Booking

---

# 17. ORDER MODULE

Order digunakan sebagai layer transaksi antara quotation dan booking jika diperlukan.

## Fields

```text
Order ID
Customer
Quotation
Items
Amount
Status
Sales
Date
```

## Status

```text
Draft
Confirmed
Cancelled
Completed
```

Order dapat dihilangkan dari UI jika tidak diperlukan pada MVP, tetapi data architecture harus tetap memungkinkan penggunaannya.

---

# 18. BOOKING MODULE

## Fields

```text
Booking ID
Customer
Quotation
Package
Travel Date
Return Date
Pax
Selling Price
Cost
Discount
Total
Paid
Outstanding
Sales
Operation PIC
Status
```

## Status

```text
Draft
Pending Payment
Confirmed
Ready
On Going
Completed
Cancelled
```

---

# 19. BOOKING DETAIL

Booking detail harus memiliki tabs:

```text
Overview
Customer
Package
Participants
Pricing
Payment
Invoice
Operations
Trip
Documents
Cancellation
Reschedule
Activity
Audit
```

---

# 20. BOOKING SNAPSHOT

Ketika booking confirmed, simpan:

- Package snapshot
- Price snapshot
- Cost snapshot
- Payment policy snapshot
- Cancellation policy snapshot
- Reschedule policy snapshot
- Commission policy snapshot
- Vendor cost snapshot

---

# 21. POS MODULE

## POS Main Screen

Harus cepat digunakan.

### Sections

```text
Customer
Products
Packages
Services
Cart
Discount
Payment
```

## Actions

- Search Customer
- New Customer
- Add Product
- Add Package
- Add Service
- Discount
- Pay
- Print Receipt
- Create Booking

---

# 22. INVOICE MODULE

## Fields

```text
Invoice Number
Customer
Booking
Invoice Date
Due Date
Items
Subtotal
Discount
Tax
Total
Paid
Outstanding
Status
```

## Status

```text
Draft
Issued
Partially Paid
Paid
Overdue
Void
Cancelled
```

---

# 23. PAYMENT MODULE

## Fields

```text
Payment ID
Invoice
Booking
Customer
Amount
Method
Reference
Payment Date
Proof
Verification Status
Verified By
Verified Date
Notes
```

## Methods

- Bank Transfer
- Cash
- QRIS

Future-ready:

- Payment Gateway
- Virtual Account
- Card

---

# 24. PAYMENT VERIFICATION

Workflow:

```text
Payment Created
↓
Pending Verification
↓
Finance Review
↓
Verified / Rejected
```

Jika Verified:

```text
Invoice Updated
Booking Updated
CRM Updated
Receipt Available
```

---

# 25. REFUND MODULE

## Fields

```text
Refund ID
Booking
Invoice
Payment
Reason
Original Amount
Eligible Amount
Refund Amount
Refund Method
Requested By
Approved By
Status
```

## Status

```text
Requested
Pending Approval
Approved
Rejected
Processing
Completed
Cancelled
```

---

# 26. CANCELLATION MODULE

## Fields

```text
Request ID
Booking
Customer
Reason
Request Date
Policy
Penalty
Refund
Requested By
Approved By
Status
```

## Workflow

```text
Request
↓
Policy Calculation
↓
Review
↓
Approval
↓
Cancel
↓
Refund
```

---

# 27. RESCHEDULE MODULE

## Fields

```text
Request ID
Booking
Old Date
New Date
Reason
Availability
Price Difference
Penalty
Refund
Requested By
Approved By
Status
```

---

# 28. VENDOR MODULE

## Fields

```text
Vendor ID
Name
Category
Contact Person
Phone
Email
Address
Bank Information
Payment Terms
Documents
Status
```

## Status

```text
Pending Approval
Active
Inactive
Blocked
```

---

# 29. VENDOR APPROVAL

Workflow:

```text
Create
↓
Pending Approval
↓
Manager Review
↓
Approved
↓
Active
```

Vendor belum active tidak dapat digunakan dalam:

- Booking operations
- Purchase Order
- Vendor payment

---

# 30. VENDOR PRICING MODULE

## Fields

```text
Vendor
Service
Price
Currency
Pax From
Pax To
Season
Start Date
End Date
Day Type
Priority
Version
Effective Date
Expiry Date
Status
Approved By
```

Harga baru:

```text
New Version
↓
Manager Approval
↓
Active
```

---

# 31. VENDOR ALTERNATIVE

Jika vendor tidak tersedia:

System menampilkan:

```text
Vendor
Availability
Cost
Capacity
Suitability
Location
```

Operations memilih vendor.

Tidak boleh otomatis memilih vendor tanpa user decision.

---

# 32. PURCHASING MODULE

## Purchase Request

Fields:

```text
PR Number
Requester
Vendor
Booking/Project
Items
Amount
Reason
Status
```

## Purchase Order

Fields:

```text
PO Number
Vendor
PR
Items
Amount
Terms
Status
```

---

# 33. OPERATIONS MODULE

Operations dashboard:

- Upcoming Trips
- Unassigned Booking
- Unassigned Employee
- Vendor Issue
- Pending Task
- Operational Checklist

---

# 34. TRIP MODULE

## Fields

```text
Trip ID
Trip Code
Booking(s)
Package
Customer/Pax
Departure Date
Return Date
Destination
Trip Leader
Guide
Driver
Vehicle
Vendor
Itinerary
Status
```

## Status

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

# 35. TRIP CREATION

Operations membuat trip.

Workflow:

```text
Create
↓
Draft
↓
Manager Review
↓
Approved
↓
Ready
```

---

# 36. TRIP ASSIGNMENT

Assignment memiliki:

```text
Trip
Employee
Role
Start
End
Task
Status
```

Role contoh:

- Trip Leader
- Guide
- Driver
- Support
- Operations

---

# 37. EMPLOYEE MODULE

## Fields

```text
Employee ID
Name
Role
Phone
Email
Skills
Status
Availability
User Account
```

---

# 38. EMPLOYEE SCHEDULE

Calendar menampilkan:

- Trip
- Task
- Assignment
- Availability
- Conflict

Jika conflict:

```text
WARNING
```

Assignment tidak dapat dilakukan secara normal jika conflict tanpa authorized override.

---

# 39. TASK MODULE

## Fields

```text
Task ID
Title
Description
Related Record
PIC
Priority
Due Date
Status
Completion Date
Notes
```

## Status

```text
To Do
In Progress
Blocked
Completed
Cancelled
```

---

# 40. PLANNER MODULE

Planner harus memiliki:

### Calendar View

- Day
- Week
- Month

### Filters

- Employee
- Trip
- Task
- Customer
- Vendor

### Functions

- Assign
- Reassign
- Move schedule
- View conflict
- Open related record

---

# 41. PROJECT MODULE

## Fields

```text
Project ID
Name
Customer
Project Manager
Start Date
End Date
Budget
Revenue
Cost
Profit
Status
```

## Status

```text
Planning
Active
On Hold
Completed
Cancelled
```

---

# 42. COMMISSION MODULE

## Fields

```text
Commission ID
Booking
Employee/Partner
Policy
Basis
Rate
Base Amount
Commission Amount
Status
```

## Status

```text
Pending
Earned
Eligible
Paid
Adjusted
Reversed
Cancelled
```

Commission earned setelah booking lunas.

---

# 43. EXPENSE MODULE

## Fields

```text
Expense ID
Date
Category
Amount
Description
Booking
Project
Employee
Payment Method
Attachment
Approval
Status
```

---

# 44. FINANCE MODULE

Finance dashboard:

- Revenue
- Paid
- Outstanding
- Refund
- Expense
- Vendor Payable
- Profit

---

# 45. REPORT MODULE

Reports harus mendukung:

- Filter
- Date range
- Export
- Print
- Detail drill-down

## Reports

### Sales

- Sales by Employee
- Sales by Package
- Sales by Source

### Booking

- Booking
- Pax
- Package
- Departure

### Finance

- Revenue
- Payment
- Outstanding
- Refund
- Expense

### Profit

- Revenue
- Cost
- Commission
- Profit
- Margin

---

# 46. DOCUMENT MODULE

Document generator harus mendukung:

```text
Quotation
Invoice
Receipt
Booking Confirmation
Voucher
Itinerary
Manifest
Purchase Order
```

Setiap document memiliki:

- Template
- Number
- Date
- Related Record
- Version
- Generated by

---

# 47. WEBSITE MODULE

Admin dapat mengatur:

- Package
- Destination
- Itinerary
- Images
- Description
- Included
- Excluded
- FAQ
- Policy
- Availability

Status:

```text
Draft
Published
Unpublished
Archived
```

---

# 48. WEBSITE BOOKING

Flow:

```text
Browse
↓
Package
↓
Date
↓
Pax
↓
Availability
↓
Price
↓
Customer Data
↓
Booking
↓
Payment
```

---

# 49. CUSTOMER WEBSITE FUNCTIONS

Customer dapat:

- Browse package
- Read itinerary
- View price
- Check date
- Request booking
- Pay
- Upload payment proof
- View booking
- View invoice
- Request cancellation
- Request reschedule

---

# 50. NOTIFICATION MODULE

Notification object:

```text
Notification ID
Recipient
Type
Title
Message
Related Record
Read Status
Created Date
```

---

# 51. USER MODULE

## User Fields

```text
User ID
Name
Email
Phone
Employee
Role
Status
Last Login
```

---

# 52. ROLE MODULE

Initial roles:

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

Role dapat memiliki multiple permissions.

---

# 53. PERMISSION MODEL

Permission format:

```text
module.action
```

Contoh:

```text
customer.view
customer.create
customer.edit

booking.view
booking.create
booking.edit
booking.cancel

payment.view
payment.create
payment.verify

refund.view
refund.create
refund.approve

vendor.create
vendor.approve
vendor.edit
```

---

# 54. APPROVAL MODULE

Approval object:

```text
Approval ID
Module
Record
Requester
Approver
Reason
Status
Date
```

Status:

```text
Pending
Approved
Rejected
Cancelled
```

---

# 55. AUDIT MODULE

Audit log:

```text
Audit ID
User
Module
Record
Action
Old Value
New Value
Date/Time
```

---

# 56. SEARCH MODULE

Global search:

```text
Customer
Lead
Quotation
Booking
Invoice
Payment
Vendor
Package
Product
Trip
Project
```

Search harus dapat membuka detail record.

---

# 57. FILE MODULE

Attachment object:

```text
File ID
File Name
File Type
Size
Uploaded By
Related Module
Related Record
Created Date
```

---

# 58. SETTINGS MODULE

Settings:

```text
Company
Currency
Numbering
Payment
Pricing
Margin
Discount
Refund
Commission
Tax
Notification
Documents
```

---

# 59. PERMISSION MATRIX

Minimum:

| Module | Owner | Manager | Sales | Finance | Operations |
|---|---|---|---|---|---|
| Customer | Full | Full | Assigned | View | View |
| CRM | Full | Full | Full | View | View |
| Quotation | Full | Full | Create/Edit | View | View |
| Booking | Full | Full | Create/Edit | View | View/Edit Operational |
| Payment | Full | View/Approve | Upload | Full | View |
| Refund | Full | Approve | Request | Process | View |
| Vendor | Full | Approve | View | View | Manage |
| Trip | Full | Approve | View | View | Manage |
| Employee | Full | Manage | View | View | Manage Assignment |
| Commission | Full | View | View Own | Process | View |
| Reports | Full | Full | Own | Finance | Operational |

Permission harus dapat diperluas tanpa mengubah code utama.

---

# 60. VALIDATION PRINCIPLE

Semua validation penting harus dilakukan di backend.

Frontend validation hanya membantu UX.

Contoh:

- Booking tidak dapat dikonfirmasi tanpa customer.
- Payment tidak dapat diverifikasi tanpa amount.
- Vendor inactive tidak dapat dipilih untuk transaksi baru.
- Refund tidak boleh melebihi eligible amount.
- Employee conflict harus dicek backend.
- Discount authority harus dicek backend.

---

# 61. DATABASE PRINCIPLE

Setiap module harus memiliki primary ID.

Gunakan:

- UUID atau equivalent unique identifier.

Human-readable number tetap dapat digunakan:

```text
CUS-00001
QT-00001
BK-00001
INV-00001
PAY-00001
REF-00001
TRIP-00001
```

Human-readable number bukan primary database ID.

---

# 62. SOFT DELETE PRINCIPLE

Master data menggunakan:

- Active
- Inactive
- Archived

Transaction menggunakan:

- Cancelled
- Void
- Reversed

Hindari hard delete terhadap transaction.

---

# 63. ERROR MESSAGE PRINCIPLE

Error harus menjelaskan:

1. Apa yang salah.
2. Mengapa.
3. Apa yang harus dilakukan.

Contoh:

```text
Booking cannot be confirmed.

Payment requirement has not been fulfilled.

Please verify the required payment first.
```

---

# 64. MOBILE UX

Mobile interface harus memprioritaskan:

- Customer lookup
- Lead
- Follow-up
- Quotation
- Booking
- Payment proof
- Task
- Trip
- Assignment
- Notification

---

# 65. DESKTOP UX

Desktop memprioritaskan:

- Dashboard
- Reporting
- Finance
- Operations Planner
- Package Builder
- Pricing
- Vendor
- User Management
- Settings

---

# 66. ACCEPTANCE CRITERIA

Setiap module dianggap selesai jika:

### Functional

- Semua fungsi utama bekerja.

### Permission

- Role restriction bekerja.

### Validation

- Invalid transaction ditolak.

### Data

- Data tersimpan benar.

### Relationship

- Related records muncul.

### Workflow

- Status transition benar.

### Audit

- Critical action tercatat.

### UX

- Mobile dan desktop usable.

### Security

- Unauthorized user tidak dapat mengakses data/action.

---

# 67. MVP MODULE ORDER

Development order:

```text
01 Authentication
02 User & Role
03 Customer
04 CRM
05 Lead
06 Product
07 Package
08 Pricing
09 Quotation
10 Booking
11 Invoice
12 Payment
13 Vendor
14 Availability
15 Trip
16 Employee
17 Assignment
18 Task
19 Planner
20 Refund
21 Cancellation
22 Reschedule
23 Commission
24 Expense
25 Reports
26 Website
27 POS
```

---

# 68. DEVELOPMENT RULE

Jangan membangun semua module sekaligus.

Untuk setiap module:

```text
Specification
↓
Database
↓
Backend
↓
API
↓
Frontend
↓
Permission
↓
Validation
↓
Testing
↓
Acceptance
↓
Next Module
```

---

# 69. NO AI

Tidak ada AI pada module baseline ini.

Jangan menambahkan:

- AI assistant
- AI chatbot
- AI recommendation
- AI prediction
- AI agent

tanpa Business Decision baru.

---

# 70. CHANGE CONTROL

Jika developer/Claude menemukan kebutuhan yang tidak terdapat di dokumen:

```text
UNKNOWN REQUIREMENT
```

Jangan langsung membuat asumsi.

Catat:

- Requirement
- Reason
- Impact
- Suggested solution
- Approval required

---

# 71. MODULE COMPLETION STANDARD

Module tidak dianggap selesai hanya karena halaman sudah terlihat.

Module harus memiliki:

```text
UI
+
Database
+
Backend
+
API
+
Validation
+
Permission
+
Workflow
+
Audit
+
Testing
```

jika komponen tersebut relevan dengan module.

---

# 72. NEXT DOCUMENT

Dokumen berikutnya:

`06_DATA_MODEL_AND_DATABASE_SCHEMA.md`

Dokumen 06 akan mendefinisikan:

- Entity
- Table
- Field
- Relationship
- Primary Key
- Foreign Key
- Index
- Status
- Snapshot
- Audit
- Attachment
- Transaction relationship

Database harus dibuat berdasarkan dokumen 06 sebelum pembangunan backend skala besar.

---

# 73. DOCUMENT STATUS

**SYSTEM MODULE BASELINE v1.0**

Dokumen ini merupakan baseline spesifikasi module ERP Batam Travelling.

Perubahan module harus mengikuti change control.

**End of Document**