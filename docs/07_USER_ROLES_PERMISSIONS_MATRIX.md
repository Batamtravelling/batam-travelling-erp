# BATAM TRAVELLING ERP
# USER ROLES & PERMISSIONS MATRIX

**File Name:** `07_USER_ROLES_PERMISSIONS_MATRIX.md`  
**Document Number:** 07  
**Version:** 1.1
**Status:** AUTHORIZATION BASELINE  
**Project:** Batam Travelling ERP  
**Last Updated:** 2026-08-13

---

# 1. PURPOSE

Dokumen ini mendefinisikan:

- User
- Role
- Permission
- Data Scope
- Approval Authority
- Sensitive Data Access
- Transaction Authority
- Separation of Duties
- Exception Handling

Dokumen ini menjadi acuan untuk:

- Authentication
- Authorization
- RBAC
- API authorization
- UI visibility
- Backend access control
- Approval workflow
- Audit

---

# 2. CORE SECURITY PRINCIPLE

User login tidak menentukan hak akses secara langsung.

Struktur:

```text
USER
 ↓
ROLE
 ↓
PERMISSION
 ↓
DATA SCOPE
 ↓
ACTION
```

Contoh:

```text
User: Budi
Role: Sales

Sales
 ↓
booking.view
booking.create
booking.edit
 ↓
Own / Assigned Customers
 ↓
Create Booking
```

---

# 3. RBAC MODEL

Sistem menggunakan:

**Role-Based Access Control**

Tetapi RBAC harus dikombinasikan dengan:

**Record-Level Access**

dan:

**Approval-Based Access**

Contoh:

Sales dapat membuat quotation.

Tetapi Sales tidak otomatis boleh:

- mengubah master pricing,
- memberikan discount tanpa batas,
- memverifikasi payment,
- menyetujui refund,
- mengubah commission.

---

# 4. ACCESS LEVEL

Setiap permission memiliki access level:

```text
NONE
VIEW
CREATE
EDIT
APPROVE
EXECUTE
CANCEL
DELETE
EXPORT
ADMIN
```

Tidak semua module membutuhkan seluruh level.

---

# 5. DATA SCOPE

Permission harus dapat dibatasi berdasarkan scope.

## 5.1 Own

User hanya dapat melihat data miliknya.

```text
sales_user_id = current_user
```

---

## 5.2 Assigned

User dapat melihat data yang ditugaskan kepadanya.

```text
assigned_user_id = current_user
```

---

## 5.3 Team

User dapat melihat data team-nya.

Contoh:

```text
Sales Manager
↓
All Sales under Manager
```

---

## 5.4 Department

User dapat melihat data departemennya.

Contoh:

```text
Finance
↓
Finance Transactions
```

---

## 5.5 Branch

Jika sistem nantinya mendukung branch:

```text
branch_id = current_user.branch_id
```

---

## 5.6 All

User dapat melihat seluruh data yang diizinkan oleh role.

---

# 6. INITIAL ROLE LIST

Role baseline:

```text
1. Owner
2. General Manager
3. Sales Manager
4. Sales
5. Customer Service
6. Operations Manager
7. Operations Staff
8. Finance Manager
9. Finance Staff
10. Marketing
11. Guide
12. Driver
13. Admin
14. Auditor
15. Customer
```

Role dapat ditambah tanpa mengubah architecture permission.

---

# 7. OWNER

## 7.1 Purpose

Owner memiliki business-level authority tertinggi.

## 7.2 Scope

```text
ALL
```

## 7.3 Main Access

Owner dapat:

- View all modules
- Manage users
- Manage roles
- Manage permissions
- View all reports
- Approve sensitive transactions
- View financial data
- Change business settings
- Change policies
- Review audit logs

## 7.4 Owner Should Not

Meskipun memiliki access penuh, Owner tetap mengikuti audit trail.

System harus tetap mencatat:

- siapa,
- kapan,
- apa yang diubah,
- nilai sebelum,
- nilai sesudah.

---

# 8. GENERAL MANAGER

## Purpose

Mengelola operasional dan business execution.

## Scope

```text
ALL BUSINESS DATA
```

## Access

- Customer: View/Edit
- CRM: Full operational
- Product: View/Edit
- Package: View/Edit
- Pricing: View/Approve
- Quotation: View/Approve
- Booking: View/Edit/Approve
- Payment: View
- Refund: Approve
- Vendor: Approve
- Operations: Full
- Reports: Full
- Commission: View/Approve
- Expense: Approve
- User: View
- Role: Limited

---

# 9. SALES MANAGER

## Scope

```text
TEAM
```

## Customer

```text
VIEW
CREATE
EDIT
```

Scope:

```text
Own + Sales Team
```

## CRM

```text
VIEW
CREATE
EDIT
ASSIGN
EXPORT
```

## Quotation

```text
VIEW
CREATE
EDIT
SEND
APPROVE
```

Discount authority mengikuti policy.

## Booking

```text
VIEW
CREATE
EDIT
CONFIRM REQUEST
```

Tidak boleh mengubah verified payment.

## Pricing

```text
VIEW
```

Pricing master change memerlukan Manager/Owner authority.

## Reports

```text
Sales Reports
Team Reports
Booking Reports
```

Tidak otomatis memiliki akses penuh Finance.

---

# 10. SALES

## Scope

```text
OWN / ASSIGNED
```

## Customer

```text
VIEW
CREATE
EDIT
```

## CRM

```text
VIEW
CREATE
EDIT
FOLLOW-UP
```

## Quotation

```text
VIEW
CREATE
EDIT
SEND
```

## Booking

```text
VIEW
CREATE
EDIT
```

Tidak boleh approve sensitive transaction jika bukan authorized approver.

## Payment

Sales boleh:

```text
VIEW BASIC STATUS
UPLOAD PAYMENT PROOF
```

Sales tidak boleh:

```text
VERIFY PAYMENT
EDIT VERIFIED PAYMENT
```

## Refund

Sales dapat:

```text
REQUEST
VIEW
```

Tidak dapat:

```text
APPROVE
PROCESS
```

## Commission

Sales dapat melihat:

```text
OWN COMMISSION
```

Tidak dapat mengubah commission.

---

# 11. CUSTOMER SERVICE

## Scope

```text
Assigned / Customer Service Queue
```

Customer Service dapat:

- View Customer
- Create Customer
- Edit Customer
- View Booking
- View Quotation
- Add Follow-up
- Manage customer communication
- Request cancellation
- Request reschedule

Tidak dapat:

- Change pricing master
- Verify payment
- Approve refund
- Change financial records

---

# 12. OPERATIONS MANAGER

## Scope

```text
OPERATIONS DEPARTMENT
```

Access:

- View Booking
- View Customer
- View Package
- View Itinerary
- Manage Trip
- Manage Vendor
- Assign Employee
- Manage Planner
- Manage Task
- Manage Availability
- Approve operational changes
- View operational reports

Operations Manager dapat mengubah operational assignment tetapi tidak boleh mengubah verified financial transactions.

---

# 13. OPERATIONS STAFF

## Scope

```text
ASSIGNED / OPERATIONS
```

Can:

- View assigned booking
- View itinerary
- Create trip draft
- Manage tasks
- Assign within authority
- Update operational status
- Upload operational documents
- Report vendor issues
- Report trip issues

Cannot:

- Approve vendor master
- Change master pricing
- Verify payment
- Approve refund
- Change financial totals

---

# 14. FINANCE MANAGER

## Scope

```text
FINANCE
```

Access:

### Invoice

```text
VIEW
CREATE
EDIT BEFORE ISSUE
ISSUE
VOID
```

### Payment

```text
VIEW
CREATE
VERIFY
REJECT
REVERSE
```

### Refund

```text
VIEW
REVIEW
APPROVE
PROCESS
```

### Expense

```text
VIEW
CREATE
EDIT
APPROVE
```

### Commission

```text
VIEW
CALCULATE
APPROVE
ADJUST
```

### Reports

```text
FULL FINANCE
PROFIT
REVENUE
OUTSTANDING
PAYABLE
REFUND
EXPENSE
```

---

# 15. FINANCE STAFF

## Scope

```text
FINANCE DEPARTMENT
```

Can:

- Create invoice
- Issue invoice if authorized
- Record payment
- Verify payment according to assigned authority
- Create expense
- Prepare refund
- View finance reports

Cannot approve their own sensitive transactions.

---

# 16. MARKETING

## Scope

```text
MARKETING DATA
PUBLIC CONTENT
```

Can:

- View packages
- Edit public package descriptions
- Manage website content
- Manage images
- Manage destination content
- Manage promotions if authorized
- View campaign source
- View lead source

Cannot:

- View sensitive financial information
- Verify payment
- Approve refund
- Change booking financial data

---

# 17. GUIDE

## Scope

```text
ASSIGNED TRIPS
```

Can:

- View assigned trip
- View itinerary
- View assigned customer/pax information necessary for operation
- Update task
- Upload trip documentation
- Report operational issue

Cannot:

- View full financial data
- View customer payment details
- Change pricing
- Change booking total
- Approve refund

---

# 18. DRIVER

## Scope

```text
ASSIGNED TRIPS
```

Can:

- View assigned trip
- View pickup information
- View required customer contact information
- Update task status
- Upload operational proof

Cannot:

- View financial data
- View payment proof
- Change booking
- Change customer master data except permitted operational fields

---

# 19. ADMIN

## Purpose

Technical/system administration.

Can:

- Manage users
- Manage roles
- Manage permissions
- Manage settings
- Manage numbering
- Manage system configuration
- View system logs

Admin should NOT automatically have business authority.

Important:

```text
ADMIN ≠ OWNER
```

Technical administrator does not automatically have permission to approve:

- Refund
- Payment
- Discount
- Commission
- Financial adjustment

unless explicitly assigned.

---

# 20. AUDITOR

## Scope

```text
READ ONLY
```

Can:

- View audit logs
- View transaction history
- View reports
- View booking
- View invoice
- View payment
- View refund
- View approval history

Cannot:

- Create
- Edit
- Approve
- Delete
- Verify

---

# 21. CUSTOMER

Customer portal role.

Can only access records belonging to itself.

```text
scope = own_customer_id
```

Can:

- View profile
- View quotation
- View booking
- View invoice
- View payment status
- Upload payment proof
- View itinerary
- Request cancellation
- Request reschedule
- View documents
- Receive notifications

Cannot:

- Edit system pricing
- View internal notes
- View vendor cost
- View employee information
- View internal commission
- View other customers

---

# 22. CUSTOMER PAYMENT PROOF

Customer dapat:

```text
Booking
↓
Payment
↓
Upload Proof
↓
Pending Verification
```

Customer hanya dapat melihat status:

```text
Pending
Verified
Rejected
```

Customer tidak dapat mengubah payment setelah submitted.

---

# 23. SALES PAYMENT PROOF

Sales dapat:

```text
Customer
↓
Booking
↓
Upload Payment Proof
↓
Finance Verification
```

Sales tidak dapat melakukan:

```text
Verify
Approve
Mark Paid
```

---

# 24. PAYMENT SEGREGATION

Minimum separation:

```text
Payment Creator
≠
Payment Verifier
```

User yang membuat payment record tidak boleh memverifikasi payment yang sama jika policy mengharuskan separation.

---

# 25. REFUND SEGREGATION

Minimum:

```text
Refund Requester
≠
Refund Approver
```

Jika memungkinkan:

```text
Requester
↓
Approver
↓
Finance Processor
```

---

# 26. DISCOUNT AUTHORITY

Discount harus mengikuti policy.

Contoh baseline:

```text
Sales
≤ approved sales discount limit

Sales Manager
≤ manager discount limit

General Manager
≤ GM limit

Owner
= exceptional authority
```

Angka limit tidak ditentukan di dokumen ini.

Limit disimpan pada:

```text
03_BUSINESS_RULES_AND_POLICY.md
```

dan system settings/policy.

---

# 27. PRICING AUTHORITY

## Sales

```text
VIEW
```

## Sales Manager

```text
VIEW
```

## Operations Manager

```text
VIEW
```

## General Manager

```text
VIEW
APPROVE
```

## Owner

```text
FULL
```

Perubahan pricing harus memiliki audit log.

---

# 28. VENDOR AUTHORITY

### Operations Staff

```text
CREATE REQUEST
VIEW
```

### Operations Manager

```text
REVIEW
EDIT
APPROVE
```

### General Manager

```text
APPROVE
```

### Owner

```text
FULL
```

Vendor inactive tidak dapat digunakan untuk transaksi baru.

---

# 29. PACKAGE AUTHORITY

### Sales

```text
VIEW
```

### Marketing

```text
EDIT PUBLIC CONTENT
```

### Product/Operations Manager

```text
CREATE
EDIT
```

### General Manager

```text
APPROVE/PUBLISH
```

### Owner

```text
FULL
```

---

# 30. QUOTATION AUTHORITY

Sales:

```text
CREATE
EDIT
SEND
```

Sales Manager:

```text
APPROVE
```

General Manager:

```text
APPROVE
```

Owner:

```text
FULL
```

Quotation yang sudah converted menjadi booking tidak boleh diedit bebas.

---

# 31. BOOKING AUTHORITY

Sales:

```text
CREATE
EDIT
REQUEST CONFIRMATION
```

Operations:

```text
VIEW
OPERATIONAL UPDATE
```

Finance:

```text
VIEW FINANCIAL
```

Manager:

```text
CONFIRM / APPROVE
```

Owner:

```text
FULL
```

---

# 32. INVOICE AUTHORITY

Finance:

```text
CREATE
EDIT DRAFT
ISSUE
```

Sales:

```text
VIEW
```

Customer:

```text
VIEW OWN
```

Invoice issued tidak boleh diedit langsung.

Correction harus menggunakan:

```text
Credit
Void
Adjustment
Replacement Invoice
```

sesuai policy.

---

# 33. PAYMENT AUTHORITY

### Customer

```text
UPLOAD PROOF
VIEW OWN
```

### Sales

```text
UPLOAD PROOF
VIEW STATUS
```

### Finance Staff

```text
RECORD
VERIFY if authorized
```

### Finance Manager

```text
VERIFY
REJECT
REVERSE
```

### Owner

```text
FULL
```

---

# 34. REFUND AUTHORITY

Customer:

```text
REQUEST
```

Sales:

```text
REQUEST
```

Customer Service:

```text
REQUEST
```

Finance Staff:

```text
PREPARE
```

Finance Manager:

```text
APPROVE
PROCESS
```

General Manager:

```text
APPROVE EXCEPTION
```

Owner:

```text
FULL
```

---

# 35. CANCELLATION AUTHORITY

Customer:

```text
REQUEST
```

Sales:

```text
REQUEST
```

Customer Service:

```text
REQUEST
```

Operations:

```text
REVIEW OPERATIONAL IMPACT
```

Finance:

```text
CALCULATE FINANCIAL IMPACT
```

Manager:

```text
APPROVE
```

Owner:

```text
FULL
```

---

# 36. RESCHEDULE AUTHORITY

Customer:

```text
REQUEST
```

Sales/Customer Service:

```text
REQUEST
```

Operations:

```text
CHECK AVAILABILITY
```

Finance:

```text
CALCULATE PRICE DIFFERENCE
```

Manager:

```text
APPROVE
```

---

# 37. COMMISSION AUTHORITY

Sales:

```text
VIEW OWN
```

Sales Manager:

```text
VIEW TEAM
```

Finance:

```text
CALCULATE
VERIFY
PROCESS
```

Manager:

```text
APPROVE EXCEPTION
```

Owner:

```text
FULL
```

Sales tidak boleh mengubah commission rate.

---

# 38. EXPENSE AUTHORITY

Employee:

```text
CREATE
SUBMIT
```

Department Manager:

```text
REVIEW
APPROVE within limit
```

Finance:

```text
VERIFY
PROCESS
```

Owner:

```text
EXCEPTION / FULL
```

Employee tidak boleh approve expense sendiri.

---

# 39. REPORT ACCESS

## Sales

- Own Sales
- Own Leads
- Own Booking
- Own Commission

## Sales Manager

- Team Sales
- Team Leads
- Team Booking
- Team Performance

## Operations

- Trip
- Assignment
- Task
- Vendor
- Operational KPI

## Finance

- Revenue
- Payment
- Outstanding
- Expense
- Refund
- Profit

## General Manager

- Business-wide reports

## Owner

- All reports

## Auditor

- Read-only reports

---

# 40. SENSITIVE DATA CLASSIFICATION

## Level 1 — Public

Contoh:

- Package name
- Public description
- Itinerary public
- Public price

---

## Level 2 — Internal

Contoh:

- Customer phone
- Internal notes
- Operational information

---

## Level 3 — Restricted

Contoh:

- Cost price
- Vendor price
- Commission
- Internal margin
- Financial reports

---

## Level 4 — Highly Restricted

Contoh:

- Bank information
- Identity documents
- Payment proof
- Security credentials
- Sensitive financial adjustments

---

# 41. CUSTOMER DATA VISIBILITY

Sales dapat melihat customer yang:

```text
Own
Assigned
Team
```

Manager dapat melihat:

```text
Team
Department
```

Owner/authorized management:

```text
All
```

Customer:

```text
Own only
```

---

# 42. COST DATA VISIBILITY

Cost data tidak boleh ditampilkan kepada:

- Customer
- Guide
- Driver
- Sales biasa
- Marketing

kecuali permission khusus diberikan.

---

# 43. MARGIN VISIBILITY

Margin dapat dilihat oleh:

- Owner
- General Manager
- Finance Manager
- Authorized Manager

Sales hanya dapat melihat margin jika business policy mengizinkan.

---

# 44. VENDOR COST VISIBILITY

Vendor cost:

```text
Operations Manager
Finance Manager
General Manager
Owner
```

Default:

```text
Sales = No
Customer = No
Guide = No
Driver = No
```

---

# 45. PAYMENT PROOF VISIBILITY

Payment proof dapat dilihat oleh:

- Customer untuk own payment
- Sales untuk assigned customer jika diperlukan
- Finance
- Authorized Manager
- Owner

Tidak ditampilkan ke:

- Guide
- Driver
- Marketing
- Customer lain

---

# 46. INTERNAL NOTES

Internal notes tidak boleh muncul di customer portal.

Contoh:

```text
Customer note
≠
Internal operational note
```

Data harus dipisahkan secara logical.

---

# 47. WEBSITE CONTENT PERMISSION

Marketing:

```text
CREATE
EDIT DRAFT
```

Manager:

```text
REVIEW
APPROVE
```

Authorized user:

```text
PUBLISH
UNPUBLISH
```

Customer hanya:

```text
VIEW PUBLISHED
```

---

# 48. API AUTHORIZATION

Permission tidak boleh hanya diterapkan di frontend.

Contoh:

Frontend:

```text
Hide Refund Approve Button
```

bukan security.

Backend harus tetap memeriksa:

```text
refund.approve
```

setiap request.

---

# 49. BACKEND AUTHORIZATION

Setiap protected endpoint harus melakukan:

```text
Authenticate
↓
Identify User
↓
Identify Role
↓
Check Permission
↓
Check Data Scope
↓
Check Business Rule
↓
Execute
↓
Audit
```

---

# 50. RECORD LEVEL AUTHORIZATION

Contoh Sales membuka booking:

System harus mengecek:

```text
Can sales.view booking?
AND
Is booking assigned to user/team?
AND
Is record active?
```

Jika gagal:

```text
403 Forbidden
```

atau response aman yang sesuai.

---

# 51. APPROVAL AUTHORIZATION

Approval harus memeriksa:

```text
Can user approve this module?
AND
Does user have authority level?
AND
Is user allowed to approve this record?
AND
Is user different from requester where required?
```

---

# 52. SELF-APPROVAL RULE

Default:

```text
Requester ≠ Approver
```

Untuk:

- Refund
- Expense
- Vendor approval
- Pricing approval
- Commission adjustment
- Sensitive financial adjustment

Exception hanya jika policy secara eksplisit mengizinkan.

---

# 53. FOUR-EYES PRINCIPLE

Untuk transaksi tertentu:

```text
Maker
+
Checker
```

Minimal dua user terlibat.

Prioritas:

- Payment verification
- Refund
- Financial adjustment
- Commission adjustment
- Sensitive master data

---

# 54. EMERGENCY OVERRIDE

Owner/authorized management dapat memiliki override.

Tetapi override wajib:

```text
Reason
+
User
+
Timestamp
+
Original Value
+
New Value
```

Audit tidak boleh di-bypass.

---

# 55. TEMPORARY ACCESS

System dapat mendukung temporary permission.

Fields:

```text id="4xujcx"
user
permission
start_at
end_at
reason
approved_by
```

Setelah expiry:

```text
Permission automatically inactive
```

---

# 56. USER DEACTIVATION

Jika employee keluar:

```text
User
↓
Inactive
```

Jangan hapus user karena historical records harus tetap menunjukkan siapa yang melakukan transaksi.

---

# 57. ROLE CHANGE

Jika user berpindah role:

```text
Old Role
↓
New Role
```

System harus mencatat:

- old role
- new role
- changed by
- date
- reason

---

# 58. PASSWORD / AUTHENTICATION

System harus:

- Hash password.
- Tidak menyimpan plaintext password.
- Mendukung password reset.
- Mendukung session expiration.
- Mendukung logout.
- Membatasi login jika diperlukan.

Future-ready:

- 2FA
- Passkey
- SSO

---

# 59. SESSION SECURITY

Session harus memiliki:

- expiration
- secure token
- revocation
- logout
- device/session tracking jika diperlukan

---

# 60. PERMISSION NAMING STANDARD

Format:

```text
module.action
```

Contoh:

```text
customer.view
customer.create
customer.edit
customer.archive

crm.view
crm.create
crm.edit

quotation.view
quotation.create
quotation.edit
quotation.send
quotation.approve
quotation.cancel

booking.view
booking.create
booking.edit
booking.confirm
booking.cancel

invoice.view
invoice.create
invoice.issue
invoice.void

payment.view
payment.create
payment.verify
payment.reject
payment.reverse

refund.view
refund.request
refund.approve
refund.process

vendor.view
vendor.create
vendor.edit
vendor.approve

trip.view
trip.create
trip.edit
trip.assign
trip.complete

report.view
report.export

user.view
user.create
user.edit
user.deactivate

role.view
role.create
role.edit

audit.view
```

---

# 61. PERMISSION GROUPS

Permission dapat dikelompokkan:

```text
CRM
SALES
FINANCE
OPERATIONS
HR
REPORTING
SYSTEM
SECURITY
```

---

# 62. ROLE MATRIX — CORE

| Module | Owner | GM | Sales Mgr | Sales | CS | Ops Mgr | Ops Staff | Finance Mgr | Finance Staff | Marketing | Guide | Driver | Admin | Auditor |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Customer | Full | Full | Team | Own | Assigned | View | Assigned | View | View | Limited | Assigned | Assigned | Admin | View |
| CRM | Full | Full | Team | Own | Assigned | View | View | View | View | Limited | No | No | Admin | View |
| Product | Full | Approve | View | View | View | Edit | View | View | View | View | No | No | Admin | View |
| Package | Full | Approve | View | View | View | Edit | View | View | View | Edit Public | View | View | Admin | View |
| Pricing | Full | Approve | View | View | View | View | View | View | View | No | No | No | Admin* | View |
| Quotation | Full | Approve | Approve | Create/Edit | Create/Edit | View | View | View | View | View | No | No | Admin* | View |
| Booking | Full | Approve | Team | Own | Assigned | Operational | Assigned | Financial View | Financial View | View | Assigned | Assigned | Admin* | View |
| Invoice | Full | Full | View | View | View | View | View | Full | Full | No | No | No | Admin* | View |
| Payment | Full | View | View | Upload | Upload | View | No | Full | Verify | No | No | No | Admin* | View |
| Refund | Full | Approve | Request | Request | Request | View | No | Full | Prepare | No | No | No | Admin* | View |
| Vendor | Full | Approve | View | View | View | Full | Request | View | View | No | No | No | Admin* | View |
| Trip | Full | Approve | View | View | View | Full | Manage | View | View | View | Assigned | Assigned | Admin* | View |
| Reports | Full | Full | Team | Own | Assigned | Ops | Ops | Finance | Finance | Marketing | Own | Own | System | Read |
| Audit | Full | Full | Limited | Own | Limited | Limited | Limited | Finance | Finance | No | No | No | System | Full |

`Admin*` = technical/system administration only; business authority is not implied.

---

# 63. ROLE MATRIX — FINANCE

| Action | Finance Staff | Finance Manager | GM | Owner |
|---|---:|---:|---:|---:|
| Create Invoice | Yes | Yes | Yes | Yes |
| Issue Invoice | Authorized | Yes | Yes | Yes |
| Record Payment | Yes | Yes | View | Yes |
| Verify Payment | According to authority | Yes | Exception | Yes |
| Reject Payment | Yes | Yes | Exception | Yes |
| Refund Request | Yes | Yes | Yes | Yes |
| Refund Approve | No | Yes | Yes | Yes |
| Refund Process | Authorized | Yes | Exception | Yes |
| Expense Create | Yes | Yes | Yes | Yes |
| Expense Approve | Limited | Yes | Yes | Yes |
| Commission Calculate | Yes | Yes | Review | Yes |
| Commission Adjust | No | Yes | Yes | Yes |
| Financial Adjustment | No | Controlled | Yes | Yes |

---

# 64. ROLE MATRIX — SALES

| Action | Sales | Sales Manager | GM | Owner |
|---|---:|---:|---:|---:|
| Create Customer | Yes | Yes | Yes | Yes |
| Edit Customer | Own | Team | Yes | Yes |
| Create Lead | Yes | Yes | Yes | Yes |
| Follow-up | Yes | Yes | Yes | Yes |
| Create Quotation | Yes | Yes | Yes | Yes |
| Send Quotation | Yes | Yes | Yes | Yes |
| Approve Quotation | Policy | Yes | Yes | Yes |
| Apply Discount | Policy | Manager Limit | GM Limit | Full |
| Create Booking | Yes | Yes | Yes | Yes |
| Confirm Booking | Request | Yes | Yes | Yes |
| Upload Payment Proof | Yes | Yes | Yes | Yes |
| Verify Payment | No | No | Exception | Yes |
| Request Refund | Yes | Yes | Yes | Yes |
| Approve Refund | No | No | Yes | Yes |
| View Commission | Own | Team | All | All |

---

# 65. ROLE MATRIX — OPERATIONS

| Action | Ops Staff | Ops Manager | GM | Owner |
|---|---:|---:|---:|---:|
| View Booking | Assigned | Department | All | All |
| Create Trip | Yes | Yes | Yes | Yes |
| Edit Trip | Assigned | Yes | Yes | Yes |
| Assign Employee | Limited | Yes | Yes | Yes |
| Manage Planner | Yes | Yes | Yes | Yes |
| Manage Vendor | Request | Yes | Approve | Full |
| View Vendor Cost | Limited | Yes | Yes | Yes |
| Update Operational Status | Yes | Yes | Yes | Yes |
| Complete Trip | Request | Yes | Yes | Yes |
| Change Price | No | No | Approval | Full |
| Verify Payment | No | No | Exception | Yes |

---

# 66. CUSTOMER PORTAL MATRIX

| Function | Customer |
|---|---:|
| View Profile | Own |
| Edit Profile | Own |
| View Quotation | Own |
| View Booking | Own |
| View Invoice | Own |
| View Payment Status | Own |
| Upload Payment Proof | Own |
| View Itinerary | Own |
| Request Cancellation | Own |
| Request Reschedule | Own |
| View Documents | Own |
| View Vendor Cost | No |
| View Internal Notes | No |
| View Commission | No |
| View Other Customer | No |

---

# 67. UI VISIBILITY

UI dapat menyembunyikan action berdasarkan permission.

Contoh:

```text
if user has payment.verify
    show Verify button
else
    hide Verify button
```

Tetapi UI visibility bukan security.

Backend tetap wajib melakukan authorization.

---

# 68. API PERMISSION CHECK

Contoh konsep:

```text
POST /payments/{id}/verify
```

Backend:

```text
authenticate()
authorize("payment.verify")
authorize_record_scope(payment)
validate_business_rules()
verify_payment()
create_audit_log()
```

---

# 69. BULK ACTION PERMISSION

Bulk action harus memiliki permission sendiri atau mewarisi permission yang jelas.

Contoh:

```text
booking.bulk_update
payment.bulk_export
customer.bulk_archive
```

Bulk action tidak boleh menjadi cara untuk melewati authorization individual.

---

# 70. EXPORT PERMISSION

Export dapat mengandung data sensitif.

Permission:

```text
customer.export
finance.export
payment.export
commission.export
```

tidak otomatis diberikan hanya karena user memiliki:

```text
customer.view
```

---

# 71. PRINT PERMISSION

Print document harus mengikuti permission record.

Contoh:

User dapat view invoice:

```text
invoice.view
```

maka dapat print invoice jika policy menganggap print sebagai bagian dari view.

Untuk dokumen sensitif, dapat dibuat:

```text
invoice.print
```

---

# 72. DOCUMENT DOWNLOAD

Download attachment harus dicek:

```text
User permission
+
Record access
+
Document permission
```

---

# 73. AUDIT EVENTS

System wajib mencatat minimal:

```text
LOGIN
LOGOUT
CREATE
UPDATE
DELETE/ARCHIVE
APPROVE
REJECT
VERIFY
REVERSE
CANCEL
EXPORT
DOWNLOAD
PUBLISH
UNPUBLISH
ROLE_CHANGE
PERMISSION_CHANGE
```

---

# 74. FAILED AUTHORIZATION

Jika user tidak memiliki permission:

```text
403 Forbidden
```

Tidak boleh memberikan data sensitif untuk membantu user menebak record.

---

# 75. SECURITY BY DEFAULT

Default:

```text
No Permission
```

Jika permission belum diberikan:

```text
DENY
```

Jangan:

```text
ALLOW
```

---

# 76. NEW ROLE RULE

Role baru harus dibuat melalui:

```text
Role
↓
Permission Selection
↓
Data Scope
↓
Approval
↓
Activation
```

Tidak boleh hard-code role baru di banyak tempat.

---

# 77. NEW PERMISSION RULE

Permission baru harus memiliki:

- Name
- Module
- Action
- Description
- Risk Level
- Default Role Assignment

---

# 78. HIGH-RISK PERMISSIONS

High-risk permissions:

```text
payment.verify
payment.reverse
refund.approve
refund.process
invoice.void
commission.adjust
pricing.edit
pricing.approve
vendor.approve
role.edit
permission.edit
user.deactivate
financial_adjustment.approve
```

Permission tersebut tidak boleh diberikan secara default.

---

# 79. APPROVAL LIMITS

Approval dapat dibatasi berdasarkan:

```text
Amount
Department
Transaction Type
Branch
Role
```

Contoh:

```text
Refund ≤ Rp5.000.000
→ Finance Manager

Refund > Rp5.000.000
→ Finance Manager, kemudian Owner
```

Nilai default limit ditetapkan Rp5.000.000 dan disimpan sebagai tenant Business Setting yang dapat diubah Owner. Perubahan limit tidak berlaku surut terhadap refund request yang telah dibuat.

---

# 80. CONFLICT DETECTION

System harus mendeteksi konflik:

```text
Requester = Approver
```

Jika prohibited:

```text
Approval blocked
```

System menampilkan alasan.

---

# 81. DATA SCOPE ESCALATION

User tidak boleh mengubah scope dirinya sendiri.

Contoh:

Sales tidak dapat mengubah:

```text
Own
→
All
```

Admin juga tidak otomatis boleh mengubah business scope tanpa authorization.

---

# 82. OWNER PROTECTION

Owner role tidak boleh dapat dihapus oleh user biasa.

Minimum:

```text
Only Owner / authorized system administrator
```

dapat mengubah critical Owner access.

---

# 83. LAST ADMIN PROTECTION

System tidak boleh menonaktifkan semua administrator.

Jika hanya satu active admin:

```text
Block deactivation
```

sampai administrator pengganti tersedia.

---

# 84. LAST OWNER PROTECTION

System tidak boleh menghapus/deactivate seluruh Owner authority.

Minimal harus selalu terdapat authorized owner-level account sesuai business policy.

---

# 85. DEPARTMENT ISOLATION

Department tidak otomatis dapat melihat seluruh data perusahaan.

Contoh:

```text
Marketing
≠
Finance Full Access
```

Data scope harus eksplisit.

---

# 86. CUSTOMER ISOLATION

Customer A tidak boleh mengakses:

```text
Customer B
```

bahkan jika mengetahui:

```text
booking_id
invoice_id
document_id
```

Authorization harus berdasarkan ownership.

---

# 87. IDOR PROTECTION

Jangan hanya mengandalkan ID.

Contoh tidak aman:

```text
GET /invoice/123
```

Backend harus memastikan:

```text
invoice.customer_id == authenticated_customer.id
```

untuk customer portal.

---

# 88. INTERNAL API SECURITY

Internal API juga harus melewati authorization.

Tidak boleh menganggap:

```text
internal = trusted
```

---

# 89. SERVICE ACCOUNT

Future integrations dapat menggunakan service account.

Service account harus memiliki:

- specific permissions
- limited scope
- token
- expiration
- audit

Jangan menggunakan Owner account untuk integration.

---

# 90. INTEGRATION PERMISSION

Contoh:

```text
website.booking.create
website.package.view
payment_gateway.payment.create
notification.send
```

Integration tidak boleh memiliki full ERP access.

---

# 91. CUSTOMER UPLOAD SECURITY

Customer upload:

- File type validation
- Size validation
- Malware/security scanning jika tersedia
- Storage isolation
- Access control

Payment proof harus terkait dengan customer/booking/payment yang benar.

---

# 92. FILE ACCESS RULE

File tidak boleh dapat diakses hanya karena URL diketahui.

File access harus:

```text
Authenticate
↓
Authorize
↓
Generate/validate secure access
↓
Serve file
```

---

# 93. LOGGING SECURITY

Audit log tidak boleh dapat diedit oleh normal user.

Recommended:

```text
Append Only
```

---

# 94. AUDITOR LIMITATION

Auditor dapat membaca audit log tetapi tidak boleh:

- edit,
- delete,
- suppress,
- modify.

---

# 95. ROLE REVIEW

Role permission harus direview secara berkala.

Review minimal:

```text
Users
Roles
Permissions
Inactive Accounts
Temporary Access
High Risk Permissions
```

---

# 96. EMPLOYEE EXIT PROCESS

Ketika employee keluar:

```text
Employee Status
↓
Inactive
↓
User Account Disabled
↓
Sessions Revoked
↓
Assignments Reassigned
↓
Pending Tasks Reassigned
↓
Audit Preserved
```

---

# 97. EMPLOYEE TRANSFER PROCESS

Jika employee pindah department:

```text
Old Role
↓
Remove old permissions
↓
Assign new role
↓
Update data scope
↓
Reassign open records
↓
Audit
```

---

# 98. CUSTOMER ACCESS REVOCATION

Jika customer account dinonaktifkan:

```text
Customer Login
↓
Disabled
```

Historical booking/invoice/payment tetap tersimpan.

---

# 99. PERMISSION CHANGE AUDIT

Setiap perubahan permission harus menyimpan:

```text
Changed By
Target User/Role
Old Permission
New Permission
Reason
Date
Time
```

---

# 100. DEFAULT DENY MATRIX

Jika module/action tidak tercantum dalam role:

```text
DENY
```

Ini adalah aturan keamanan utama.

---

# 101. ACCEPTANCE CRITERIA

Authorization system dianggap selesai jika:

### Authentication

- User dapat login.
- User dapat logout.
- Session aman.
- Inactive user tidak dapat login.

### Authorization

- Permission diperiksa backend.
- Data scope diperiksa.
- Customer isolation bekerja.
- Role restriction bekerja.

### Approval

- Unauthorized approval ditolak.
- Self-approval dapat dicegah.
- Approval history tercatat.

### Finance

- Payment verification terbatas.
- Refund approval terbatas.
- Financial adjustment terbatas.

### Security

- Sensitive data protected.
- File protected.
- Audit append-only.
- Export protected.

---

# 102. TEST SCENARIOS

Minimal test:

### Test 1

Sales membuka customer milik sendiri.

```text
ALLOW
```

### Test 2

Sales membuka customer yang tidak assigned.

```text
DENY
```

### Test 3

Customer membuka invoice customer lain.

```text
DENY
```

### Test 4

Sales mencoba verify payment.

```text
DENY
```

### Test 5

Finance verify payment.

```text
ALLOW
```

### Test 6

Finance Staff mencoba approve refund miliknya sendiri.

```text
DENY
```

jika four-eyes policy aktif.

### Test 7

Owner approve refund.

```text
ALLOW
```

### Test 8

Guide membuka vendor cost.

```text
DENY
```

### Test 9

Marketing membuka full financial report.

```text
DENY
```

### Test 10

Admin mencoba approve refund tanpa permission business.

```text
DENY
```

### Test 11

Customer upload payment proof untuk booking sendiri.

```text
ALLOW
```

### Test 12

Customer mencoba upload proof ke booking orang lain.

```text
DENY
```

---

# 103. IMPLEMENTATION PRIORITY

Phase 1:

```text
Authentication
User
Role
Permission
Data Scope
```

Phase 2:

```text
Approval
Audit
Sensitive Data
File Access
```

Phase 3:

```text
Temporary Permission
Advanced Approval Limit
Service Accounts
SSO/2FA
```

---

# 104. IMPORTANT ARCHITECTURAL RULE

Jangan membuat permission seperti:

```text
is_admin = true
```

sebagai satu-satunya authorization mechanism.

Gunakan:

```text
Role
+
Permission
+
Scope
+
Business Rule
```

---

# 105. FINAL AUTHORIZATION FLOW

```text
REQUEST
   ↓
AUTHENTICATE USER
   ↓
CHECK ACTIVE ACCOUNT
   ↓
IDENTIFY ROLE
   ↓
CHECK PERMISSION
   ↓
CHECK DATA SCOPE
   ↓
CHECK APPROVAL AUTHORITY
   ↓
CHECK BUSINESS RULE
   ↓
EXECUTE ACTION
   ↓
WRITE AUDIT LOG
```

---

# 106. DOCUMENT DEPENDENCIES

Dokumen ini bergantung pada:

```text
00_PROJECT_INSTRUCTIONS.md
01_BUSINESS_FOUNDATION.md
02_BUSINESS_PROCESS_AND_SOP.md
03_BUSINESS_RULES_AND_POLICY.md
04_PRD_SYSTEM_REQUIREMENTS.md
05_MODULE_SPECIFICATIONS.md
06_DATA_MODEL_AND_DATABASE_SCHEMA.md
```

Dokumen berikutnya:

```text
08_WORKFLOW_STATE_MACHINE.md
```

akan mendefinisikan state dan transition secara formal.

---

# 107. DOCUMENT STATUS

**AUTHORIZATION BASELINE v1.0**

Dokumen ini adalah baseline authorization architecture untuk Batam Travelling ERP.

Semua perubahan terhadap role, permission, data scope, atau approval authority harus mengikuti change control.

**End of Document**
