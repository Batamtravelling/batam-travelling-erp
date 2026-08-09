# BATAM TRAVELLING ERP
# DATA MODEL & DATABASE SCHEMA

**File Name:** `06_DATA_MODEL_AND_DATABASE_SCHEMA.md`  
**Document Number:** 06  
**Version:** 1.0  
**Status:** DATABASE BASELINE  
**Project:** Batam Travelling ERP  
**Last Updated:** 2026-08-08

---

# 1. PURPOSE

Dokumen ini mendefinisikan struktur data utama untuk Batam Travelling ERP.

Dokumen menjadi dasar untuk:

- Database design
- Backend development
- API
- ORM/model
- Data validation
- Reporting
- Audit
- Integration

Database harus mengikuti Business Rules dan Module Specifications.

---

# 2. DATABASE PRINCIPLE

Database harus:

1. Terstruktur.
2. Konsisten.
3. Relasional.
4. Scalable.
5. Auditable.
6. Aman.
7. Menghindari duplikasi data.
8. Memisahkan master data dan transaction data.
9. Menyimpan historical snapshot untuk transaksi penting.
10. Tidak menghapus transaction secara permanen.

---

# 3. DATABASE LAYER

Struktur data dibagi menjadi:

```text
MASTER DATA
├── Customer
├── Product
├── Package
├── Vendor
├── Employee
├── User
├── Role
└── Settings

CRM DATA
├── Lead
├── Follow-up
├── Activity
└── Customer History

SALES DATA
├── Pricing
├── Availability
├── Quotation
├── Order
└── Booking

FINANCE DATA
├── Invoice
├── Payment
├── Refund
├── Expense
└── Commission

OPERATIONS DATA
├── Trip
├── Assignment
├── Task
├── Project
├── Purchase Request
└── Purchase Order

DOCUMENT DATA
├── Attachment
├── Document
└── Document Version

SYSTEM DATA
├── Notification
├── Approval
├── Audit Log
└── Settings
```

---

# 4. ID PRINCIPLE

Semua entity menggunakan unique internal ID.

Disarankan:

```text
UUID
```

Human-readable number digunakan untuk operasional.

Contoh:

```text
CUS-000001
LEAD-000001
QT-000001
ORD-000001
BK-000001
INV-000001
PAY-000001
REF-000001
TRIP-000001
VEN-000001
EMP-000001
```

Human-readable number bukan primary key.

---

# 5. COMMON TABLE FIELDS

Entity yang relevan menggunakan:

```text
id
created_at
updated_at
created_by
updated_by
status
```

Jika menggunakan archive/soft delete:

```text
archived_at
archived_by
```

Tidak semua table wajib memiliki seluruh field jika tidak relevan.

---

# 6. CUSTOMER TABLE

Table:

```text
customers
```

Fields:

```text
id
customer_code
customer_type
full_name
phone
email
address
city
country
notes
lead_source
assigned_user_id
status
created_at
updated_at
created_by
updated_by
```

Relationship:

```text
Customer
├── Leads
├── FollowUps
├── Quotations
├── Orders
├── Bookings
├── Invoices
├── Payments
├── Refunds
├── Trips
└── Documents
```

---

# 7. CUSTOMER TYPE

Allowed values:

```text
individual
family
group
corporate
agent
reseller
other
```

Status:

```text
active
inactive
blocked
archived
```

---

# 8. LEAD TABLE

Table:

```text
leads
```

Fields:

```text
id
lead_code
customer_id
source
requirement
travel_date
return_date
pax
estimated_value
assigned_user_id
priority
status
notes
created_at
updated_at
created_by
updated_by
```

Relationship:

```text
Customer 1 ─── N Leads
User 1 ─── N Leads
```

---

# 9. LEAD ACTIVITY TABLE

Table:

```text
crm_activities
```

Fields:

```text
id
customer_id
lead_id
booking_id
user_id
activity_type
subject
description
activity_date
created_at
```

Activity type:

```text
call
whatsapp
email
meeting
note
follow_up
other
```

---

# 10. FOLLOW-UP TABLE

Table:

```text
follow_ups
```

Fields:

```text
id
customer_id
lead_id
booking_id
assigned_user_id
due_date
channel
subject
notes
result
next_action
next_follow_up_date
status
created_at
updated_at
```

Relationship:

```text
Customer 1 ─── N FollowUps
Lead 1 ─── N FollowUps
Booking 1 ─── N FollowUps
User 1 ─── N FollowUps
```

---

# 11. PRODUCT TABLE

Table:

```text
products
```

Fields:

```text
id
product_code
name
category
description
public_description
internal_notes
unit
default_cost
default_selling_price
vendor_id
status
created_at
updated_at
```

---

# 12. PRODUCT CATEGORY

Examples:

```text
hotel
ferry
transport
driver
guide
activity
meal
ticket
documentation
other
```

Category should be configurable where practical.

---

# 13. PACKAGE TABLE

Table:

```text
packages
```

Fields:

```text
id
package_code
name
destination
category
duration
description
public_description
internal_notes
default_cost
default_selling_price
payment_policy_id
cancellation_policy_id
reschedule_policy_id
status
published_at
created_at
updated_at
```

---

# 14. PACKAGE COMPONENT TABLE

Table:

```text
package_components
```

Fields:

```text
id
package_id
product_id
vendor_id
component_type
quantity
unit
cost
selling_price
is_included
is_optional
notes
sort_order
created_at
updated_at
```

Relationship:

```text
Package 1 ─── N PackageComponents
Product 1 ─── N PackageComponents
Vendor 1 ─── N PackageComponents
```

---

# 15. ITINERARY TABLE

Table:

```text
itineraries
```

Fields:

```text
id
package_id
title
description
status
created_at
updated_at
```

---

# 16. ITINERARY DAY TABLE

Table:

```text
itinerary_days
```

Fields:

```text
id
itinerary_id
day_number
title
description
sort_order
```

---

# 17. ITINERARY ITEM TABLE

Table:

```text
itinerary_items
```

Fields:

```text
id
itinerary_day_id
time
title
location
description
duration
included
notes
sort_order
```

Relationship:

```text
Package
↓
Itinerary
↓
ItineraryDay
↓
ItineraryItem
```

---

# 18. PRICING TABLE

Table:

```text
pricing_rules
```

Fields:

```text
id
product_id
package_id
price_type
cost
selling_price
margin
markup
pax_from
pax_to
start_date
end_date
season
priority
status
effective_date
expiry_date
created_at
updated_at
```

At least one of:

```text
product_id
package_id
```

must be present.

---

# 19. AVAILABILITY RESOURCE TABLE

Table:

```text
availability_resources
```

Fields:

```text
id
resource_type
resource_id
name
capacity
status
created_at
updated_at
```

Resource type:

```text
hotel
ferry
vehicle
driver
guide
activity
other
```

---

# 20. AVAILABILITY SLOT TABLE

Table:

```text
availability_slots
```

Fields:

```text
id
resource_id
date
start_time
end_time
capacity
booked
available
status
```

Relationship:

```text
Resource 1 ─── N AvailabilitySlots
```

---

# 21. QUOTATION TABLE

Table:

```text
quotations
```

Fields:

```text
id
quotation_number
customer_id
lead_id
sales_user_id
quotation_date
valid_until
subtotal
discount
tax
total
terms
notes
status
created_at
updated_at
```

---

# 22. QUOTATION ITEM TABLE

Table:

```text
quotation_items
```

Fields:

```text
id
quotation_id
product_id
package_id
description
quantity
unit_price
discount
subtotal
cost_snapshot
selling_price_snapshot
sort_order
```

A quotation item may reference:

```text
Product
OR
Package
```

---

# 23. QUOTATION SNAPSHOT

Quotation must preserve commercial information at the time quotation is issued.

Snapshot may include:

```text
package_name
package_description
pricing
terms
policy
cost
selling_price
```

Do not depend exclusively on current master data.

---

# 24. ORDER TABLE

Table:

```text
orders
```

Fields:

```text
id
order_number
customer_id
quotation_id
sales_user_id
subtotal
discount
tax
total
status
created_at
updated_at
```

Order is optional in MVP but database structure should support it.

---

# 25. ORDER ITEM TABLE

Table:

```text
order_items
```

Fields:

```text
id
order_id
product_id
package_id
description
quantity
unit_price
discount
subtotal
```

---

# 26. BOOKING TABLE

Table:

```text
bookings
```

Fields:

```text
id
booking_number
customer_id
quotation_id
order_id
package_id
sales_user_id
operations_user_id
travel_date
return_date
pax
subtotal
discount
tax
total
cost
paid_amount
outstanding_amount
status
created_at
updated_at
```

---

# 27. BOOKING PARTICIPANT TABLE

Table:

```text
booking_participants
```

Fields:

```text
id
booking_id
full_name
phone
email
identity_type
identity_number
date_of_birth
special_requirements
notes
```

Sensitive identity information must be handled according to security requirements.

---

# 28. BOOKING SNAPSHOT TABLE

Table:

```text
booking_snapshots
```

Fields:

```text
id
booking_id
package_snapshot
pricing_snapshot
cost_snapshot
payment_policy_snapshot
cancellation_policy_snapshot
reschedule_policy_snapshot
commission_policy_snapshot
vendor_cost_snapshot
created_at
```

Snapshot can use structured JSON where appropriate.

Historical booking data must remain stable even if master data changes.

---

# 29. BOOKING STATUS HISTORY

Table:

```text
booking_status_history
```

Fields:

```text
id
booking_id
from_status
to_status
changed_by
reason
created_at
```

This supports auditability.

---

# 30. INVOICE TABLE

Table:

```text
invoices
```

Fields:

```text
id
invoice_number
customer_id
booking_id
invoice_date
due_date
subtotal
discount
tax
total
paid_amount
outstanding_amount
status
created_at
updated_at
```

---

# 31. INVOICE ITEM TABLE

Table:

```text
invoice_items
```

Fields:

```text
id
invoice_id
product_id
package_id
description
quantity
unit_price
discount
subtotal
```

---

# 32. PAYMENT TABLE

Table:

```text
payments
```

Fields:

```text
id
payment_number
invoice_id
booking_id
customer_id
amount
payment_method
payment_date
reference
proof_file_id
verification_status
verified_by
verified_at
notes
created_at
updated_at
```

---

# 33. PAYMENT STATUS

Verification:

```text
pending
verified
rejected
cancelled
```

Payment record tidak boleh dihapus secara hard delete.

Jika terjadi koreksi, gunakan reversal/adjustment mechanism.

---

# 34. REFUND TABLE

Table:

```text
refunds
```

Fields:

```text
id
refund_number
booking_id
invoice_id
payment_id
requested_amount
eligible_amount
refund_amount
reason
refund_method
requested_by
approved_by
status
processed_at
created_at
updated_at
```

---

# 35. CANCELLATION TABLE

Table:

```text
cancellation_requests
```

Fields:

```text
id
request_number
booking_id
customer_id
reason
request_date
policy_snapshot
penalty_amount
refund_amount
requested_by
approved_by
status
created_at
updated_at
```

---

# 36. RESCHEDULE TABLE

Table:

```text
reschedule_requests
```

Fields:

```text
id
request_number
booking_id
old_travel_date
new_travel_date
reason
availability_status
price_difference
penalty_amount
refund_amount
requested_by
approved_by
status
created_at
updated_at
```

---

# 37. VENDOR TABLE

Table:

```text
vendors
```

Fields:

```text
id
vendor_code
name
category
contact_person
phone
email
address
bank_information
payment_terms
status
created_at
updated_at
```

Bank information harus diproteksi.

---

# 38. VENDOR PRICING TABLE

Table:

```text
vendor_pricing
```

Fields:

```text
id
vendor_id
product_id
service_name
price
currency
pax_from
pax_to
season
start_date
end_date
day_type
priority
version
effective_date
expiry_date
status
approved_by
created_at
updated_at
```

---

# 39. VENDOR PRICING HISTORY

Jangan overwrite historical pricing.

Setiap perubahan besar harus menghasilkan version baru.

```text
Version 1
↓
Version 2
↓
Version 3
```

Historical transaction tetap menggunakan harga yang digunakan saat transaksi.

---

# 40. PURCHASE REQUEST TABLE

Table:

```text
purchase_requests
```

Fields:

```text
id
pr_number
requester_id
vendor_id
booking_id
project_id
reason
total_amount
status
created_at
updated_at
```

---

# 41. PURCHASE REQUEST ITEM

Table:

```text
purchase_request_items
```

Fields:

```text
id
purchase_request_id
product_id
description
quantity
unit_price
subtotal
```

---

# 42. PURCHASE ORDER TABLE

Table:

```text
purchase_orders
```

Fields:

```text
id
po_number
purchase_request_id
vendor_id
booking_id
project_id
order_date
total_amount
terms
status
created_at
updated_at
```

---

# 43. PURCHASE ORDER ITEM

Table:

```text
purchase_order_items
```

Fields:

```text
id
purchase_order_id
product_id
description
quantity
unit_price
subtotal
```

---

# 44. TRIP TABLE

Table:

```text
trips
```

Fields:

```text
id
trip_number
package_id
departure_date
return_date
destination
trip_leader_id
vendor_id
vehicle_id
itinerary_id
status
created_at
updated_at
```

---

# 45. TRIP BOOKING TABLE

Karena satu trip dapat berisi beberapa booking:

Table:

```text
trip_bookings
```

Fields:

```text
id
trip_id
booking_id
pax
notes
```

Relationship:

```text
Trip N ─── N Booking
```

---

# 46. EMPLOYEE TABLE

Table:

```text
employees
```

Fields:

```text
id
employee_code
name
phone
email
role
skills
status
user_id
created_at
updated_at
```

---

# 47. EMPLOYEE ASSIGNMENT TABLE

Table:

```text
employee_assignments
```

Fields:

```text
id
employee_id
trip_id
project_id
task_id
assignment_role
start_datetime
end_datetime
status
created_at
updated_at
```

---

# 48. EMPLOYEE AVAILABILITY

Table:

```text
employee_availability
```

Fields:

```text
id
employee_id
date
start_time
end_time
status
notes
```

---

# 49. TASK TABLE

Table:

```text
tasks
```

Fields:

```text
id
task_number
title
description
related_module
related_record_id
assigned_user_id
priority
due_date
status
completed_at
created_at
updated_at
```

---

# 50. PROJECT TABLE

Table:

```text
projects
```

Fields:

```text
id
project_code
name
customer_id
project_manager_id
start_date
end_date
budget
revenue
cost
profit
status
created_at
updated_at
```

---

# 51. COMMISSION TABLE

Table:

```text
commissions
```

Fields:

```text
id
commission_number
booking_id
employee_id
partner_id
policy_snapshot
basis
rate
base_amount
commission_amount
status
earned_at
paid_at
created_at
updated_at
```

---

# 52. EXPENSE TABLE

Table:

```text
expenses
```

Fields:

```text
id
expense_number
expense_date
category
amount
description
booking_id
project_id
employee_id
payment_method
attachment_file_id
status
approved_by
created_at
updated_at
```

---

# 53. USER TABLE

Table:

```text
users
```

Fields:

```text
id
name
email
phone
password_hash
employee_id
status
last_login_at
created_at
updated_at
```

Authentication implementation must never store plaintext passwords.

---

# 54. ROLE TABLE

Table:

```text
roles
```

Fields:

```text
id
name
description
status
created_at
updated_at
```

---

# 55. PERMISSION TABLE

Table:

```text
permissions
```

Fields:

```text
id
permission_key
description
module
action
```

Example:

```text
customer.view
customer.create
customer.edit
booking.view
booking.create
payment.verify
refund.approve
vendor.approve
```

---

# 56. USER ROLE TABLE

Table:

```text
user_roles
```

Fields:

```text
id
user_id
role_id
```

---

# 57. ROLE PERMISSION TABLE

Table:

```text
role_permissions
```

Fields:

```text
id
role_id
permission_id
```

Relationship:

```text
User
↓
UserRole
↓
Role
↓
RolePermission
↓
Permission
```

---

# 58. APPROVAL TABLE

Table:

```text
approvals
```

Fields:

```text
id
module
record_id
requested_by
approver_id
reason
status
approved_at
rejected_at
created_at
updated_at
```

Approval must reference the business record.

---

# 59. ATTACHMENT TABLE

Table:

```text
attachments
```

Fields:

```text
id
file_name
file_type
file_size
storage_path
uploaded_by
related_module
related_record_id
created_at
```

File storage should be separated from database binary storage where practical.

---

# 60. DOCUMENT TABLE

Table:

```text
documents
```

Fields:

```text
id
document_number
document_type
related_module
related_record_id
template_id
version
file_id
generated_by
generated_at
status
```

Document type:

```text
quotation
invoice
receipt
booking_confirmation
voucher
itinerary
manifest
purchase_order
```

---

# 61. DOCUMENT TEMPLATE TABLE

Table:

```text
document_templates
```

Fields:

```text
id
name
document_type
template_content
version
status
created_by
created_at
updated_at
```

---

# 62. NOTIFICATION TABLE

Table:

```text
notifications
```

Fields:

```text
id
user_id
notification_type
title
message
related_module
related_record_id
is_read
read_at
created_at
```

---

# 63. AUDIT LOG TABLE

Table:

```text
audit_logs
```

Fields:

```text
id
user_id
module
record_id
action
old_value
new_value
ip_address
user_agent
created_at
```

Audit log harus append-only.

---

# 64. SETTINGS TABLE

Table:

```text
settings
```

Fields:

```text
id
setting_key
setting_value
setting_type
scope
updated_by
updated_at
```

Contoh:

```text
company_name
company_phone
currency
default_payment_method
invoice_prefix
quotation_prefix
booking_prefix
```

Sensitive settings harus memiliki access restriction.

---

# 65. POLICY TABLE

Table:

```text
policies
```

Fields:

```text
id
policy_type
name
description
rules
status
effective_date
expiry_date
version
created_at
updated_at
```

Policy type:

```text
payment
cancellation
reschedule
commission
refund
```

---

# 66. POLICY SNAPSHOT

Transaction yang terpengaruh policy harus menyimpan snapshot.

Contoh:

```text
Booking
↓
Cancellation Policy Snapshot
↓
Cancellation Request
```

Perubahan policy baru tidak boleh mengubah transaksi lama.

---

# 67. CORE RELATIONSHIP MAP

Hubungan utama:

```text
Customer
   │
   ├── Lead
   │     │
   │     └── Quotation
   │
   ├── Quotation
   │     │
   │     └── Booking
   │
   └── Booking
         │
         ├── Invoice
         │     └── Payment
         │
         ├── Trip
         │
         ├── Cancellation
         │
         ├── Reschedule
         │
         ├── Expense
         │
         └── Commission
```

---

# 68. PACKAGE RELATIONSHIP MAP

```text
Package
 ├── Package Components
 │     ├── Product
 │     └── Vendor
 │
 ├── Pricing Rules
 │
 └── Itinerary
       └── Itinerary Days
             └── Itinerary Items
```

---

# 69. OPERATIONS RELATIONSHIP MAP

```text
Booking
   ↓
Trip
   ├── Employee Assignment
   ├── Vendor
   ├── Vehicle
   ├── Itinerary
   └── Tasks
```

---

# 70. FINANCIAL RELATIONSHIP MAP

```text
Booking
 ↓
Invoice
 ↓
Payment

Booking
 ↓
Expense

Booking
 ↓
Commission

Booking
 ↓
Refund
```

---

# 71. CRM RELATIONSHIP MAP

```text
Customer
 ↓
Lead
 ↓
Activity
 ↓
Follow-up
 ↓
Quotation
 ↓
Booking
```

---

# 72. DATA OWNERSHIP

Master data owner:

```text
Customer → CRM/Authorized
Product → Admin/Manager
Package → Product/Manager
Vendor → Operations/Manager
Employee → Admin/Manager
Pricing → Authorized User
Policy → Owner/Manager
```

Transaction ownership mengikuti role dan workflow.

---

# 73. HISTORICAL DATA PRINCIPLE

Jangan menggunakan master data saat ini untuk menghitung ulang transaksi lama jika transaksi membutuhkan historical accuracy.

Gunakan:

- Snapshot
- Version
- History table

Contoh:

```text
Package Price Today ≠ Booking Price Yesterday
```

---

# 74. TRANSACTION IMMUTABILITY

Transaction yang sudah finalized tidak boleh diedit sembarangan.

Contoh:

- Paid Invoice
- Verified Payment
- Completed Booking
- Completed Trip
- Completed Refund

Jika perlu koreksi:

```text
Adjustment
Reversal
Correction
```

harus dibuat melalui workflow yang sesuai.

---

# 75. MONEY DATA

Semua nilai uang harus menggunakan tipe numeric/decimal yang sesuai.

Jangan menggunakan floating point untuk financial calculation.

Contoh konsep:

```text
DECIMAL(18,2)
```

Currency harus configurable.

---

# 76. DATE & TIME

System harus menyimpan waktu secara konsisten.

Recommended:

```text
UTC in database
Timezone at presentation/business layer
```

Business timezone dapat diatur melalui system settings.

---

# 77. INDEX PRINCIPLE

Index harus dibuat untuk field yang sering digunakan untuk:

- Search
- Filter
- Join
- Sorting

Minimal candidate:

```text
customer_code
phone
email
booking_number
quotation_number
invoice_number
payment_number
trip_number
vendor_code
employee_code
status
created_at
travel_date
```

Jangan membuat index berlebihan tanpa alasan.

---

# 78. UNIQUE CONSTRAINT

Nomor berikut harus unique:

```text
customer_code
lead_code
product_code
package_code
quotation_number
order_number
booking_number
invoice_number
payment_number
refund_number
trip_number
vendor_code
employee_code
```

Jika numbering multi-company/multi-branch ditambahkan di masa depan, uniqueness rule dapat diperluas.

---

# 79. FOREIGN KEY PRINCIPLE

Foreign key digunakan untuk relationship yang wajib dijaga.

Contoh:

```text
booking.customer_id → customers.id
booking.package_id → packages.id
invoice.booking_id → bookings.id
payment.invoice_id → invoices.id
trip.booking_id → bookings.id
```

Jika relationship bersifat optional, foreign key boleh nullable.

---

# 80. SOFT DELETE

Master data:

```text
Active
Inactive
Archived
```

Transaction:

```text
Cancelled
Void
Reversed
```

Hard delete hanya diperbolehkan untuk data yang memang aman dihapus dan tidak memiliki historical/business dependency.

---

# 81. AUDIT REQUIREMENT

Audit minimal wajib untuk:

- Price change
- Discount
- Booking status
- Payment verification
- Refund
- Cancellation
- Reschedule
- Vendor approval
- Commission adjustment
- Permission change
- Important settings

---

# 82. DATA SECURITY

Data yang perlu diperhatikan:

- Password
- Bank information
- Identity information
- Customer documents
- Payment proof

harus memiliki access restriction.

Jangan menampilkan data sensitif kepada role yang tidak memiliki permission.

---

# 83. FILE STORAGE

Database menyimpan metadata file.

File actual disimpan pada storage.

Concept:

```text
Database
   ↓
Attachment Metadata
   ↓
Storage
```

Storage dapat berupa:

- Local storage untuk development
- Object storage untuk production

---

# 84. REPORTING PRINCIPLE

Report harus menggunakan transaction data yang sudah finalized/validated.

Jangan menghitung revenue berdasarkan data draft.

Contoh:

```text
Draft quotation
≠ Revenue

Confirmed booking
+ Verified payment
= Financial transaction
```

Definisi report harus mengikuti Business Rules.

---

# 85. DATA MIGRATION

Jika data lama diimport:

```text
Source Data
↓
Mapping
↓
Validation
↓
Preview
↓
Import
↓
Verification
```

Jangan langsung import ke production tanpa validation.

---

# 86. BACKUP

Production database harus memiliki:

- Regular backup
- Backup retention
- Recovery procedure
- Restore test

Backup bukan pengganti audit.

---

# 87. DATABASE ENVIRONMENT

Minimal:

```text
Development
↓
Staging
↓
Production
```

Database production tidak digunakan untuk eksperimen development.

---

# 88. MIGRATION PRINCIPLE

Database changes harus menggunakan migration system.

Jangan mengubah production schema secara manual tanpa migration record.

Setiap migration harus:

- versioned
- reversible jika memungkinkan
- documented
- tested

---

# 89. MVP DATABASE PRIORITY

Database phase 1:

```text
users
roles
permissions
user_roles
role_permissions

customers
leads
crm_activities
follow_ups

products
packages
package_components
itineraries
itinerary_days
itinerary_items
pricing_rules

quotations
quotation_items

bookings
booking_participants
booking_snapshots

invoices
invoice_items
payments
```

---

# 90. PHASE 2 DATABASE

```text
vendors
vendor_pricing
availability_resources
availability_slots

trips
trip_bookings
employees
employee_assignments
employee_availability
tasks
projects
```

---

# 91. PHASE 3 DATABASE

```text
refunds
cancellation_requests
reschedule_requests
commissions
expenses
purchase_requests
purchase_request_items
purchase_orders
purchase_order_items
approvals
```

---

# 92. SYSTEM DATABASE

Seluruh fase membutuhkan:

```text
attachments
documents
document_templates
notifications
audit_logs
settings
policies
```

---

# 93. DATABASE DEVELOPMENT RULE

Claude/developer harus:

1. Membaca dokumen 00–05.
2. Tidak membuat table tanpa kebutuhan yang jelas.
3. Tidak menggabungkan entity berbeda hanya demi mengurangi jumlah table.
4. Tidak membuat duplicate master data.
5. Menjaga foreign key.
6. Menjaga historical snapshot.
7. Menggunakan migration.
8. Membuat index berdasarkan kebutuhan nyata.
9. Menghindari hard delete transaction.
10. Mendokumentasikan perubahan schema.

---

# 94. UNKNOWN DATA REQUIREMENT

Jika ditemukan kebutuhan data baru:

```text
UNKNOWN DATA REQUIREMENT
```

Jangan langsung mengubah schema production.

Evaluasi:

```text
Business Rule
↓
Module Requirement
↓
Entity
↓
Relationship
↓
Migration Impact
↓
Approval
```

---

# 95. ACCEPTANCE CRITERIA

Database dianggap siap untuk module jika:

- Entity tersedia.
- Relationship benar.
- Foreign key benar.
- Unique constraint benar.
- Status tersedia.
- Validation tersedia.
- Historical data dapat dipertahankan.
- Audit dapat dilakukan.
- Migration dapat dijalankan.
- Test data dapat dibuat.
- Tidak terdapat circular dependency yang tidak diperlukan.

---

# 96. IMPORTANT ARCHITECTURAL RULE

Database harus menjadi **single source of truth** untuk ERP.

Website, POS, mobile interface, dan future integrations tidak boleh memiliki business database yang terpisah.

Semua transaksi utama harus kembali ke ERP core.

---

# 97. FINAL DATA FLOW

```text
CUSTOMER
   ↓
CRM
   ↓
LEAD
   ↓
QUOTATION
   ↓
BOOKING
   ↓
INVOICE
   ↓
PAYMENT
   ↓
TRIP
   ↓
EXPENSE
   ↓
COMMISSION
   ↓
PROFIT
```

Dengan supporting master data:

```text
PRODUCT
PACKAGE
PRICING
VENDOR
EMPLOYEE
POLICY
```

Dan supporting control:

```text
USER
ROLE
PERMISSION
APPROVAL
AUDIT
DOCUMENT
NOTIFICATION
```

---

# 98. NEXT DOCUMENT

Dokumen berikutnya:

`07_USER_ROLES_PERMISSIONS_MATRIX.md`

Dokumen 07 akan menentukan secara rinci:

- siapa boleh melihat,
- siapa boleh membuat,
- siapa boleh mengubah,
- siapa boleh menyetujui,
- siapa boleh membatalkan,
- siapa boleh memverifikasi pembayaran,
- siapa boleh memproses refund,
- siapa boleh melihat data finance,
- siapa boleh mengubah pricing,
- siapa boleh mengakses customer data.

Dokumen tersebut menjadi dasar authorization system.

---

# 99. DOCUMENT STATUS

**DATABASE BASELINE v1.0**

Dokumen ini merupakan baseline struktur database Batam Travelling ERP.

Perubahan database harus mengikuti:

```text
Requirement
↓
Impact Analysis
↓
Migration
↓
Testing
↓
Approval
↓
Deployment
```

**End of Document**