# BATAM TRAVELLING ERP
# DATABASE ARCHITECTURE AND DATA MODEL SPECIFICATION

**File Name:** `14_DATABASE_ARCHITECTURE_AND_DATA_MODEL_SPECIFICATION.md`  
**Document Number:** 14  
**Version:** 1.0  
**Status:** DATABASE BASELINE  
**Project:** Batam Travelling ERP  
**Last Updated:** 2026-08-08

---

# 1. PURPOSE

Dokumen ini mendefinisikan arsitektur database, data model, entity relationship, struktur tabel, constraints, indexing, lifecycle data, auditability, dan aturan integritas data untuk Batam Travelling ERP.

Dokumen ini menjadi source of truth untuk:

- Database architecture
- Entity design
- Table design
- Primary key
- Foreign key
- Relationships
- Status model
- Audit fields
- Soft delete
- Timestamps
- Money and currency
- File references
- CRM
- Customer
- Product
- Article/CMS
- Landing page
- Lead
- Quotation
- Booking
- Payment
- Invoice
- Follow-up
- User and role
- Audit trail
- Notification
- Integration
- Reporting

---

# 2. DATABASE PRINCIPLES

Database harus mengikuti prinsip:

```text
Integrity
Consistency
Traceability
Security
Scalability
Performance
Recoverability
Maintainability
```

Business-critical data harus memiliki source of truth yang jelas.

---

# 3. DATABASE ARCHITECTURE

Baseline:

```text
Application
     │
     ▼
API / Application Service
     │
     ▼
Database
     │
 ┌───┼───────────────┐
 ▼   ▼               ▼
CRM  Transaction     CMS
     Data
```

Supporting infrastructure:

```text
Database
 ├── Cache
 ├── Queue
 ├── Object Storage
 └── Search / Analytics (optional)
```

Cache bukan source of truth.

---

# 4. DATABASE ENGINE

Database relational menjadi primary transactional database.

Preferred:

```text
PostgreSQL
```

Provider managed PostgreSQL dapat digunakan.

Pemilihan provider tidak boleh mengubah logical data model.

---

# 5. DATABASE SEPARATION

Minimal:

```text
Development Database
Staging Database
Production Database
```

Production database tidak boleh digunakan oleh development.

---

# 6. DATABASE SCHEMA STRATEGY

Logical domain dapat dipisahkan secara modular.

Contoh:

```text
identity
crm
catalog
cms
sales
booking
billing
payment
communication
audit
system
```

Implementasi dapat menggunakan single schema dengan naming convention jika separate schema tidak diperlukan.

---

# 7. DOMAIN MODEL

Core domains:

```text
Identity
CRM
Catalog
CMS
Sales
Booking
Billing
Payment
Communication
Audit
System
```

---

# 8. CORE ENTITY MAP

High-level:

```text
User
 │
 ├── Role
 │
 └── Activity

Customer
 │
 ├── Contact
 ├── Lead
 ├── Quotation
 ├── Booking
 ├── Payment
 └── Follow Up

Product
 │
 ├── Product Category
 ├── Product Image
 └── Product Reference

Article
 │
 ├── Category
 ├── Tag
 └── Product Reference

Landing Page
 │
 └── Content Blocks

Quotation
 │
 ├── Quotation Items
 ├── Customer
 └── Booking

Booking
 │
 ├── Booking Items
 ├── Payment
 └── Invoice
```

---

# 9. IDENTIFIER STRATEGY

Setiap entity utama harus memiliki unique identifier.

Preferred:

```text
UUID / UUID-compatible identifier
```

Contoh:

```text
id
customer_id
product_id
quotation_id
booking_id
payment_id
invoice_id
```

Internal numeric sequence dapat digunakan untuk business number, tetapi bukan sebagai satu-satunya global identifier.

---

# 10. BUSINESS NUMBER

Transaction entity dapat memiliki human-readable business number.

Contoh:

```text
Customer:
CUS-000001

Lead:
LED-000001

Quotation:
QUO-2026-000001

Booking:
BKG-2026-000001

Invoice:
INV-2026-000001

Payment:
PAY-2026-000001
```

Format final dapat disesuaikan dengan business policy.

---

# 11. BUSINESS NUMBER RULE

Business number harus:

- Unique
- Stable
- Human readable
- Tidak digunakan sebagai database primary key
- Tidak berubah setelah diterbitkan

---

# 12. STANDARD AUDIT FIELDS

Entity transactional utama minimal memiliki:

```text
id
created_at
updated_at
created_by
updated_by
```

Jika menggunakan soft delete:

```text
deleted_at
deleted_by
```

---

# 13. TIMESTAMP STANDARD

Database menyimpan timestamp dalam UTC.

Recommended fields:

```text
created_at
updated_at
deleted_at
```

---

# 14. SOFT DELETE

Soft delete digunakan untuk entity yang membutuhkan historical traceability.

Contoh:

```text
Customer
Product
Article
Landing Page
User
```

Tidak semua table harus menggunakan soft delete.

Transactional records seperti payment dan invoice tidak boleh dihapus secara normal.

---

# 15. HARD DELETE

Hard delete hanya diperbolehkan jika:

- Data tidak memiliki business dependency
- Tidak diperlukan untuk audit
- Tidak melanggar retention requirement
- Tidak merusak referential integrity

---

# 16. STATUS DESIGN

Status harus explicit.

Jangan menggunakan kombinasi NULL dan implicit state sebagai status.

Contoh:

```text
status = draft
status = active
status = cancelled
```

---

# 17. STATUS HISTORY

Untuk business-critical workflow, perubahan status sebaiknya memiliki history.

Contoh:

```text
quotation_status_history
booking_status_history
payment_status_history
lead_status_history
```

---

# 18. MONEY STORAGE

Nilai uang tidak boleh disimpan sebagai floating point.

Gunakan:

```text
DECIMAL / NUMERIC
```

Contoh:

```text
subtotal
discount_amount
tax_amount
total_amount
paid_amount
balance_amount
```

---

# 19. CURRENCY

Setiap financial record harus memiliki currency atau mewarisi currency dari parent yang immutable.

Contoh:

```text
currency = IDR
```

Gunakan ISO 4217 jika memungkinkan.

---

# 20. MONEY PRECISION

Contoh:

```text
NUMERIC(18,2)
```

Precision final mengikuti kebutuhan currency dan business rules.

---

# 21. PERCENTAGE

Percentage menggunakan numeric/decimal.

Contoh:

```text
discount_percent
tax_percent
commission_percent
```

Jangan menggunakan floating point untuk financial calculation.

---

# 22. QUANTITY

Quantity dapat menggunakan:

```text
NUMERIC
```

untuk mendukung fractional quantity jika diperlukan.

---

# 23. JSON DATA

JSON/JSONB hanya digunakan untuk:

- Flexible metadata
- External provider payload
- Configurable UI content
- Non-critical extension attributes

Business-critical searchable fields harus memiliki kolom relational yang jelas.

---

# 24. PRIMARY KEY

Semua entity table harus memiliki primary key.

---

# 25. FOREIGN KEY

Relasi antar entity harus menggunakan foreign key jika applicable.

Foreign key harus menentukan behavior:

```text
RESTRICT
CASCADE
SET NULL
```

sesuai business semantics.

---

# 26. REFERENTIAL INTEGRITY

Tidak boleh ada:

```text
Quotation → Customer yang tidak ada
Booking → Customer yang tidak ada
Payment → Booking yang tidak ada
Invoice → Booking yang tidak ada
```

---

# 27. CUSTOMER MODEL

Customer merupakan master entity untuk pihak yang bertransaksi atau berpotensi bertransaksi.

---

# 28. CUSTOMER TABLE

Logical table:

```text
customers
```

Fields:

```text
id
customer_number
customer_type
name
company_name
email
phone
whatsapp
address
city
country
notes
status
created_at
updated_at
created_by
updated_by
deleted_at
deleted_by
```

---

# 29. CUSTOMER TYPE

Contoh:

```text
individual
company
organization
```

---

# 30. CUSTOMER STATUS

Contoh:

```text
active
inactive
blocked
archived
```

---

# 31. CUSTOMER CONTACT

Jika customer dapat memiliki beberapa contact person, gunakan:

```text
customer_contacts
```

Fields:

```text
id
customer_id
name
position
email
phone
whatsapp
is_primary
created_at
updated_at
```

---

# 32. CUSTOMER ADDRESS

Jika customer dapat memiliki multiple address:

```text
customer_addresses
```

Fields:

```text
id
customer_id
address_type
recipient_name
address_line
city
province
postal_code
country
is_primary
created_at
updated_at
```

---

# 33. CRM LEAD

Lead merepresentasikan opportunity/prospect sebelum atau selama proses sales.

Table:

```text
leads
```

Fields:

```text
id
lead_number
customer_id
source
title
description
status
priority
assigned_to
estimated_value
currency
expected_close_date
created_at
updated_at
closed_at
```

---

# 34. LEAD STATUS

Baseline:

```text
new
contacted
qualified
proposal
negotiation
won
lost
cancelled
```

---

# 35. LEAD SOURCE

Contoh:

```text
website
whatsapp
instagram
facebook
referral
walk_in
phone
email
other
```

---

# 36. LEAD ASSIGNMENT

Lead dapat memiliki:

```text
assigned_to
```

yang mereferensikan user/sales owner.

---

# 37. CRM ACTIVITY

Table:

```text
crm_activities
```

Digunakan untuk mencatat:

```text
Call
WhatsApp
Email
Meeting
Note
Follow-up
```

Fields:

```text
id
customer_id
lead_id
activity_type
subject
description
activity_at
created_by
created_at
```

---

# 38. CRM FOLLOW-UP

Table:

```text
crm_follow_ups
```

Fields:

```text
id
customer_id
lead_id
assigned_to
title
description
due_at
status
completed_at
completed_by
created_at
updated_at
```

---

# 39. FOLLOW-UP STATUS

```text
pending
in_progress
completed
cancelled
overdue
```

`overdue` dapat dihitung secara runtime atau disimpan sesuai implementation strategy.

---

# 40. PRODUCT DOMAIN

Product adalah item/service yang dapat ditawarkan atau dijual.

Table:

```text
products
```

---

# 41. PRODUCT TABLE

Fields:

```text
id
product_code
name
slug
short_description
description
category_id
product_type
base_price
currency
status
is_featured
seo_title
seo_description
published_at
created_at
updated_at
created_by
updated_by
deleted_at
deleted_by
```

---

# 42. PRODUCT TYPE

Contoh:

```text
tour
transport
hotel
ticket
activity
package
service
other
```

---

# 43. PRODUCT STATUS

```text
draft
active
inactive
archived
```

Untuk CMS/public publishing, status catalog dan publication state dapat dipisahkan jika diperlukan.

---

# 44. PRODUCT CATEGORY

Table:

```text
product_categories
```

Fields:

```text
id
parent_id
name
slug
description
status
sort_order
created_at
updated_at
```

---

# 45. PRODUCT IMAGE

Table:

```text
product_images
```

Fields:

```text
id
product_id
file_id
alt_text
sort_order
is_primary
created_at
```

---

# 46. FILE ASSET

Semua uploaded file sebaiknya memiliki central metadata.

Table:

```text
files
```

Fields:

```text
id
storage_provider
storage_key
original_name
mime_type
size_bytes
visibility
checksum
uploaded_by
created_at
deleted_at
```

---

# 47. FILE VISIBILITY

```text
public
private
internal
```

---

# 48. ARTICLE / CMS DOMAIN

Website harus dapat membuat:

- Article
- Blog post
- Informational content
- SEO content
- Product-related content

---

# 49. ARTICLE TABLE

Table:

```text
articles
```

Fields:

```text
id
title
slug
excerpt
content
status
author_id
featured_image_id
seo_title
seo_description
canonical_url
published_at
created_at
updated_at
created_by
updated_by
deleted_at
deleted_by
```

---

# 50. ARTICLE STATUS

```text
draft
review
scheduled
published
unpublished
archived
```

---

# 51. ARTICLE CATEGORY

Table:

```text
article_categories
```

Fields:

```text
id
parent_id
name
slug
description
status
sort_order
created_at
updated_at
```

---

# 52. ARTICLE TAG

Table:

```text
article_tags
```

Fields:

```text
id
name
slug
created_at
updated_at
```

---

# 53. ARTICLE TAG RELATION

Many-to-many:

```text
article_tag_relations
```

Fields:

```text
article_id
tag_id
```

Unique constraint:

```text
(article_id, tag_id)
```

---

# 54. ARTICLE PRODUCT REFERENCE

Website harus dapat mencantumkan product di dalam article.

Gunakan:

```text
article_products
```

Fields:

```text
id
article_id
product_id
display_type
sort_order
created_at
```

---

# 55. ARTICLE PRODUCT RULE

Satu article dapat memiliki banyak product.

Satu product dapat direferensikan oleh banyak article.

Relationship:

```text
Article N ─── N Product
```

---

# 56. ARTICLE PRODUCT DISPLAY

Contoh:

```text
inline
card
related
featured
cta
```

---

# 57. LANDING PAGE

Website harus dapat membuat landing page.

Table:

```text
landing_pages
```

Fields:

```text
id
title
slug
status
template
seo_title
seo_description
published_at
created_at
updated_at
created_by
updated_by
deleted_at
deleted_by
```

---

# 58. LANDING PAGE BLOCK

Untuk flexible page builder:

```text
landing_page_blocks
```

Fields:

```text
id
landing_page_id
block_type
content
sort_order
status
created_at
updated_at
```

`content` dapat menggunakan JSONB untuk konfigurasi block.

---

# 59. LANDING PAGE BLOCK TYPES

Contoh:

```text
hero
text
image
product_grid
product_card
article_grid
testimonial
faq
cta
contact_form
custom_html
```

---

# 60. LANDING PAGE PRODUCT REFERENCE

Landing page dapat langsung mereferensikan product.

Table:

```text
landing_page_products
```

Fields:

```text
id
landing_page_id
product_id
sort_order
display_type
created_at
```

---

# 61. SEO MODEL

SEO fields dapat tersedia pada public content:

```text
seo_title
seo_description
canonical_url
```

Slug harus unique dalam scope entity yang relevan.

---

# 62. SLUG RULE

Slug harus:

- URL-safe
- Stable setelah publication jika possible
- Unique
- Tidak menggunakan whitespace

---

# 63. SALES DOMAIN

Sales domain:

```text
Lead
Quotation
Quotation Item
Sales Activity
```

---

# 64. QUOTATION

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
title
valid_until
status
currency
subtotal
discount_amount
tax_amount
total_amount
notes
terms
created_by
approved_by
created_at
updated_at
sent_at
accepted_at
rejected_at
cancelled_at
```

---

# 65. QUOTATION STATUS

Baseline:

```text
draft
pending_approval
approved
sent
viewed
negotiation
accepted
rejected
expired
cancelled
converted
```

---

# 66. QUOTATION ITEM

Table:

```text
quotation_items
```

Fields:

```text
id
quotation_id
product_id
description
quantity
unit_price
discount_percent
discount_amount
tax_percent
tax_amount
subtotal
total_amount
sort_order
created_at
updated_at
```

---

# 67. QUOTATION SNAPSHOT PRINCIPLE

Quotation harus menyimpan snapshot informasi komersial yang diperlukan.

Jika product berubah setelah quotation dibuat, historical quotation tidak boleh berubah secara otomatis.

---

# 68. PRODUCT REFERENCE IN QUOTATION

`product_id` dapat disimpan untuk traceability.

Namun:

```text
description
unit_price
discount
tax
```

harus disimpan sebagai snapshot transaction.

---

# 69. QUOTATION TOTAL

Total tidak boleh bergantung pada frontend.

Backend harus menghitung ulang:

```text
subtotal
discount
tax
grand total
```

---

# 70. QUOTATION CONVERSION

Quotation yang accepted dapat dikonversi menjadi booking.

Relationship:

```text
Quotation
    │
    ▼
Booking
```

---

# 71. BOOKING DOMAIN

Booking merupakan transaction utama setelah customer melakukan pemesanan.

Table:

```text
bookings
```

---

# 72. BOOKING TABLE

Fields:

```text
id
booking_number
customer_id
quotation_id
status
booking_date
service_start_date
service_end_date
currency
subtotal
discount_amount
tax_amount
total_amount
paid_amount
balance_amount
notes
created_by
created_at
updated_at
cancelled_at
completed_at
```

---

# 73. BOOKING STATUS

Baseline:

```text
draft
pending_payment
partially_paid
paid
confirmed
in_progress
completed
cancelled
refunded
```

Status final harus mengikuti business policy.

---

# 74. BOOKING ITEM

Table:

```text
booking_items
```

Fields:

```text
id
booking_id
product_id
description
quantity
unit_price
discount_amount
tax_amount
subtotal
total_amount
service_date
notes
created_at
updated_at
```

---

# 75. BOOKING SNAPSHOT

Booking harus menyimpan transaction snapshot.

Perubahan product master tidak boleh mengubah historical booking secara otomatis.

---

# 76. PAYMENT DOMAIN

Payment adalah record pembayaran aktual.

Table:

```text
payments
```

---

# 77. PAYMENT TABLE

Fields:

```text
id
payment_number
booking_id
invoice_id
customer_id
payment_method
amount
currency
status
reference_number
paid_at
proof_file_id
notes
verified_by
verified_at
created_by
created_at
updated_at
```

---

# 78. PAYMENT STATUS

```text
pending
submitted
under_review
verified
rejected
cancelled
refunded
```

---

# 79. PAYMENT PROOF

Customer atau sales dapat meng-upload bukti transfer sesuai business rule.

Payment proof direferensikan:

```text
proof_file_id
```

File actual berada pada object storage.

---

# 80. PAYMENT PROOF SECURITY

Payment proof default:

```text
PRIVATE
```

Tidak boleh public.

---

# 81. PAYMENT VERIFICATION

Payment verification harus menyimpan:

```text
verified_by
verified_at
```

Jika ditolak:

```text
rejection_reason
```

dapat disimpan.

---

# 82. PAYMENT IDEMPOTENCY

Payment submission harus memiliki protection terhadap duplicate submission.

Dapat menggunakan:

```text
idempotency_key
provider_reference
reference_number
```

sesuai integration design.

---

# 83. INVOICE DOMAIN

Table:

```text
invoices
```

---

# 84. INVOICE TABLE

Fields:

```text
id
invoice_number
booking_id
customer_id
status
issue_date
due_date
currency
subtotal
discount_amount
tax_amount
total_amount
paid_amount
balance_amount
notes
created_at
updated_at
issued_at
cancelled_at
```

---

# 85. INVOICE STATUS

```text
draft
issued
partially_paid
paid
overdue
cancelled
void
```

---

# 86. INVOICE ITEM

Table:

```text
invoice_items
```

Fields:

```text
id
invoice_id
product_id
description
quantity
unit_price
discount_amount
tax_amount
subtotal
total_amount
created_at
```

---

# 87. INVOICE IMMUTABILITY

Invoice yang telah issued tidak boleh diubah sembarangan.

Correction harus melalui:

```text
Void
Credit note
Replacement invoice
Adjustment
```

sesuai business requirement.

---

# 88. PAYMENT-INVOICE RELATION

Satu invoice dapat memiliki banyak payment.

```text
Invoice 1 ─── N Payment
```

Payment harus dapat ditelusuri ke invoice.

---

# 89. BOOKING-PAYMENT RELATION

Satu booking dapat memiliki banyak payment.

```text
Booking 1 ─── N Payment
```

---

# 90. PAYMENT ALLOCATION

Jika satu payment dapat dialokasikan ke beberapa invoice, gunakan:

```text
payment_allocations
```

Fields:

```text
id
payment_id
invoice_id
allocated_amount
created_at
```

---

# 91. REFUND

Refund harus memiliki record yang dapat ditelusuri.

Dapat menggunakan:

```text
refunds
```

Fields:

```text
id
payment_id
booking_id
amount
currency
reason
status
reference_number
processed_at
created_by
created_at
```

---

# 92. REFUND STATUS

```text
requested
approved
processing
completed
rejected
cancelled
```

---

# 93. NOTIFICATION DOMAIN

Table:

```text
notifications
```

Fields:

```text
id
recipient_user_id
customer_id
channel
type
title
message
status
reference_type
reference_id
sent_at
read_at
created_at
```

---

# 94. NOTIFICATION CHANNEL

```text
in_app
email
whatsapp
sms
```

Provider implementation mengikuti API integration specification.

---

# 95. NOTIFICATION STATUS

```text
pending
queued
sent
delivered
failed
read
```

---

# 96. NOTIFICATION OUTBOX

Untuk reliability, critical outbound notification dapat menggunakan outbox pattern.

Table:

```text
outbox_events
```

Fields:

```text
id
event_type
aggregate_type
aggregate_id
payload
status
attempt_count
available_at
processed_at
created_at
```

---

# 97. EVENT STATUS

```text
pending
processing
processed
failed
```

---

# 98. USER DOMAIN

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
status
last_login_at
created_at
updated_at
```

Authentication detail mengikuti Security specification.

---

# 99. ROLE

Table:

```text
roles
```

Fields:

```text
id
name
description
created_at
updated_at
```

---

# 100. PERMISSION

Table:

```text
permissions
```

Fields:

```text
id
code
name
description
```

---

# 101. USER ROLE

Many-to-many:

```text
user_roles
```

Fields:

```text
user_id
role_id
```

---

# 102. ROLE PERMISSION

Many-to-many:

```text
role_permissions
```

Fields:

```text
role_id
permission_id
```

---

# 103. AUDIT LOG

Critical system changes harus dicatat.

Table:

```text
audit_logs
```

Fields:

```text
id
actor_user_id
action
entity_type
entity_id
old_values
new_values
ip_address
user_agent
request_id
created_at
```

---

# 104. AUDIT ACTION

Contoh:

```text
create
update
delete
approve
reject
verify
cancel
login
logout
export
download
publish
unpublish
```

---

# 105. AUDIT DATA

Audit log tidak boleh menyimpan:

```text
Password
Secret
API key
Raw authentication token
```

---

# 106. STATUS HISTORY TABLES

Business-critical status history dapat menggunakan generic table:

```text
status_histories
```

atau domain-specific tables.

Fields:

```text
id
entity_type
entity_id
from_status
to_status
reason
changed_by
changed_at
```

---

# 107. COMMENT / NOTE

Entity yang membutuhkan internal notes dapat menggunakan:

```text
entity_notes
```

Fields:

```text
id
entity_type
entity_id
content
created_by
created_at
updated_at
```

---

# 108. RELATIONSHIP PRINCIPLE

Relasi harus eksplisit.

Contoh:

```text
Customer
 ├── Lead
 ├── Quotation
 ├── Booking
 └── Payment
```

---

# 109. DELETE RELATION RULE

Contoh policy:

```text
Customer → Quotation
RESTRICT

Customer → Booking
RESTRICT

Booking → Payment
RESTRICT

Article → Article Product Reference
CASCADE

Product → Article Product Reference
RESTRICT/CASCADE based on implementation
```

Business-critical historical data tidak boleh hilang karena delete master data.

---

# 110. UNIQUE CONSTRAINT

Fields yang harus unique harus memiliki database constraint.

Contoh:

```text
customer_number
quotation_number
booking_number
invoice_number
payment_number
product_code
product.slug
article.slug
```

---

# 111. COMPOSITE UNIQUE

Contoh:

```text
(article_id, tag_id)
(landing_page_id, product_id)
(user_id, role_id)
(role_id, permission_id)
```

---

# 112. CHECK CONSTRAINT

Gunakan database check constraint untuk invariant sederhana.

Contoh:

```text
amount >= 0
quantity > 0
discount_percent >= 0
discount_percent <= 100
```

---

# 113. NULLABILITY

Field harus `NOT NULL` jika secara bisnis wajib.

Jangan menggunakan nullable field hanya karena implementation convenience.

---

# 114. DEFAULT VALUE

Default value hanya digunakan jika business semantics jelas.

Contoh:

```text
status = draft
created_at = now()
```

---

# 115. INDEXING PRINCIPLE

Index dibuat berdasarkan:

```text
Query pattern
Foreign key
Sorting
Filtering
Uniqueness
```

Jangan membuat index secara berlebihan.

---

# 116. PRIMARY INDEX

Primary key otomatis memiliki index.

---

# 117. FOREIGN KEY INDEX

Foreign key yang sering digunakan dalam query harus memiliki index.

Contoh:

```text
customer_id
booking_id
quotation_id
product_id
assigned_to
```

---

# 118. STATUS INDEX

Status dapat di-index jika sering digunakan untuk filtering.

Contoh:

```text
status
```

---

# 119. COMPOSITE INDEX

Contoh:

```text
(customer_id, created_at)
(status, created_at)
(assigned_to, status)
```

Actual index harus berdasarkan query analysis.

---

# 120. FULL TEXT SEARCH

Untuk article/product search, gunakan:

- Database full-text search
- Dedicated search engine jika scale membutuhkan

Search implementation tidak boleh mengubah source of truth.

---

# 121. PAGINATION

API query harus menggunakan pagination untuk large dataset.

Preferred:

```text
Cursor pagination
```

atau offset pagination sesuai use case.

---

# 122. SORTING

Sorting harus menggunakan indexed field jika dataset besar.

---

# 123. REPORTING

Reporting query tidak boleh mengganggu transactional workload.

Jika kebutuhan meningkat, gunakan:

```text
Read replica
Materialized view
Reporting database
Data warehouse
```

---

# 124. READ REPLICA

Read replica dapat digunakan untuk:

```text
Reporting
Analytics
Heavy read
```

Critical write transaction tetap menggunakan primary database.

---

# 125. TRANSACTION

Gunakan database transaction untuk multi-step operation yang harus atomic.

Contoh:

```text
Create booking
+
Create booking items
+
Create payment state
```

jika secara business merupakan satu atomic operation.

---

# 126. CONCURRENCY CONTROL

Critical transaction harus melindungi dari race condition.

Contoh:

```text
Payment verification
Inventory/availability
Booking confirmation
Invoice numbering
```

---

# 127. OPTIMISTIC LOCKING

Untuk data yang sering diedit oleh beberapa user, dapat menggunakan:

```text
version
updated_at
```

untuk mendeteksi concurrent modification.

---

# 128. PESSIMISTIC LOCKING

Gunakan hanya ketika benar-benar diperlukan untuk critical transaction.

---

# 129. NUMBER GENERATION

Business number generator harus concurrency-safe.

Tidak boleh bergantung pada:

```text
SELECT MAX(number) + 1
```

---

# 130. DATA CONSISTENCY

Calculated values harus dapat diverifikasi.

Contoh:

```text
Booking total
Invoice total
Paid amount
Balance
```

---

# 131. BALANCE CALCULATION

Secara konsep:

```text
balance_amount
=
total_amount
-
verified_payment_amount
-
approved_credit
+
approved_debit
```

Formula final mengikuti business rules.

---

# 132. FINANCIAL IMMUTABILITY

Historical financial transaction harus immutable setelah finalization kecuali melalui adjustment mechanism.

---

# 133. CURRENCY CONSISTENCY

Dalam satu transaction, currency harus konsisten kecuali multi-currency secara eksplisit didukung.

---

# 134. TAX MODEL

Jika tax digunakan, simpan snapshot:

```text
tax_percent
tax_amount
```

Jangan menghitung ulang historical transaction hanya berdasarkan current tax configuration.

---

# 135. DISCOUNT MODEL

Discount transaction harus menyimpan:

```text
discount_percent
discount_amount
```

jika keduanya relevan.

---

# 136. PRICE SNAPSHOT

Product master price tidak boleh mengubah:

```text
Quotation
Booking
Invoice
```

yang sudah dibuat.

---

# 137. CMS PUBLISHING

Publishing article/landing page harus memiliki:

```text
status
published_at
```

dan dapat ditambah:

```text
scheduled_at
```

jika scheduling diperlukan.

---

# 138. CONTENT VERSIONING

Untuk content critical, dapat digunakan:

```text
article_versions
landing_page_versions
```

jika kebutuhan editorial membutuhkan draft history.

---

# 139. ARTICLE REVISION

Revision menyimpan:

```text
id
article_id
version_number
title
content
seo_data
created_by
created_at
```

---

# 140. PRODUCT-CONTENT RELATION

Product dapat muncul pada:

```text
Article
Landing Page
Related Product
Recommendation
```

Relationship harus disimpan sebagai reference, bukan duplicate master data.

---

# 141. PRODUCT ARCHIVING

Product yang pernah digunakan dalam transaction tidak boleh dihapus secara destructive.

Gunakan:

```text
inactive
archived
```

---

# 142. CUSTOMER ARCHIVING

Customer dengan historical transaction tidak boleh dihapus secara destructive.

---

# 143. USER DEACTIVATION

User yang sudah pernah melakukan action historical tidak boleh dihapus secara destructive jika menyebabkan audit kehilangan actor identity.

Gunakan:

```text
status = inactive
```

---

# 144. AUDIT ACTOR

Audit harus mempertahankan reference ke user yang melakukan action jika masih tersedia.

Jika user dinonaktifkan, historical audit tetap dapat dibaca.

---

# 145. FILE REFERENCE INTEGRITY

File record harus mengetahui:

```text
storage_key
mime_type
size
visibility
```

Entity reference tidak boleh menyimpan binary file langsung di relational database kecuali ada alasan kuat.

---

# 146. FILE CLEANUP

File yang tidak lagi direferensikan dapat masuk cleanup process.

Namun cleanup tidak boleh menghapus file yang masih diperlukan untuk audit/transaction.

---

# 147. DATA RETENTION

Retention mengikuti:

```text
Business requirement
Security policy
Legal/compliance requirement
Operational requirement
```

---

# 148. DATA EXPORT

Export data harus memperhatikan:

```text
Authorization
Sensitive fields
Audit
Large dataset
Performance
```

---

# 149. DATA IMPORT

Import harus melalui validation.

Flow:

```text
Upload
 ↓
Validate
 ↓
Preview
 ↓
Confirm
 ↓
Process
 ↓
Report result
```

---

# 150. IMPORT IDEMPOTENCY

Import tidak boleh membuat duplicate record ketika file diproses ulang jika operation memang seharusnya idempotent.

---

# 151. DATABASE BACKUP

Database backup mengikuti:

`13_DEPLOYMENT_DEVOPS_INFRASTRUCTURE_SPECIFICATION.md`

Minimal:

```text
Automated backup
Retention
Encryption
Restore test
```

---

# 152. DATABASE SECURITY

Database:

- Tidak boleh public jika tidak diperlukan
- Credentials harus secure
- Least privilege
- Encryption in transit
- Encryption at rest jika tersedia

---

# 153. APPLICATION DATABASE USER

Application sebaiknya menggunakan dedicated database user dengan privilege minimum yang diperlukan.

Migration user dapat memiliki privilege berbeda dari runtime user jika infrastructure memungkinkan.

---

# 154. DATABASE ADMIN ACCESS

Administrative database access harus dibatasi dan diaudit.

---

# 155. QUERY PERFORMANCE

Critical query harus diperiksa menggunakan:

```text
EXPLAIN
EXPLAIN ANALYZE
```

jika dibutuhkan.

---

# 156. N+1 PREVENTION

Application layer harus menghindari N+1 query pada:

```text
Product list
Article list
Quotation items
Booking items
CRM list
```

---

# 157. TRANSACTION BOUNDARY

Transaction boundary harus berada pada service/use-case level, bukan tersebar tanpa kontrol di banyak layer.

---

# 158. DATA VALIDATION

Validation dilakukan pada:

```text
Frontend
API
Database
```

dengan tujuan berbeda.

Frontend:

```text
UX
```

Backend:

```text
Business validation
Security
```

Database:

```text
Data integrity
```

---

# 159. DATABASE CONSTRAINT PRINCIPLE

Jika suatu invariant dapat dijamin dengan database constraint, gunakan constraint tersebut.

Contoh:

```text
Unique business number
Non-negative amount
Valid foreign key
```

---

# 160. MASTER DATA

Master data meliputi:

```text
Customer
Product
Category
User
Role
Permission
```

---

# 161. TRANSACTION DATA

Transaction data meliputi:

```text
Lead activity
Quotation
Booking
Payment
Invoice
Refund
```

---

# 162. CONTENT DATA

Content data meliputi:

```text
Article
Category
Tag
Landing Page
Page Block
Product references
```

---

# 163. SYSTEM DATA

System data meliputi:

```text
Notifications
Outbox
Audit Logs
Configuration
Job records
```

---

# 164. ENTITY OWNERSHIP

Setiap entity harus memiliki domain owner.

Contoh:

```text
Customer → CRM
Product → Catalog
Article → CMS
Quotation → Sales
Booking → Booking
Payment → Payment
Invoice → Billing
```

---

# 165. CROSS-DOMAIN RELATION

Cross-domain reference harus dijaga minimal.

Contoh:

```text
Quotation → Customer
Booking → Customer
Booking → Product
Payment → Booking
Invoice → Booking
Article → Product
```

---

# 166. DENORMALIZATION

Denormalization hanya dilakukan jika:

- Ada performance requirement
- Query pattern jelas
- Consistency strategy tersedia

---

# 167. SNAPSHOT VS REFERENCE

Gunakan reference untuk master identity:

```text
product_id
customer_id
user_id
```

Gunakan snapshot untuk historical transaction values:

```text
product_name
description
unit_price
tax
discount
```

jika diperlukan untuk historical accuracy.

---

# 168. DATA MODEL DIAGRAM

Simplified ER model:

```text
USER
 │
 ├──── LEAD
 │       │
 │       └──── CRM_ACTIVITY
 │
 └──── QUOTATION
          │
          └──── QUOTATION_ITEM
                    │
                    ▼
                  PRODUCT

CUSTOMER
 ├──── LEAD
 ├──── QUOTATION
 ├──── BOOKING
 │       ├──── BOOKING_ITEM
 │       ├──── PAYMENT
 │       └──── INVOICE
 │               └──── INVOICE_ITEM
 │
 └──── CRM_FOLLOW_UP

PRODUCT
 ├──── PRODUCT_IMAGE
 ├──── QUOTATION_ITEM
 ├──── BOOKING_ITEM
 ├──── INVOICE_ITEM
 ├──── ARTICLE_PRODUCT
 └──── LANDING_PAGE_PRODUCT

ARTICLE
 ├──── ARTICLE_CATEGORY
 ├──── ARTICLE_TAG
 └──── ARTICLE_PRODUCT

LANDING_PAGE
 ├──── LANDING_PAGE_BLOCK
 └──── LANDING_PAGE_PRODUCT
```

---

# 169. CORE TABLE INVENTORY

Minimum core tables:

```text
users
roles
permissions
user_roles
role_permissions

customers
customer_contacts
customer_addresses
leads
crm_activities
crm_follow_ups

products
product_categories
product_images
files

articles
article_categories
article_tags
article_tag_relations
article_products

landing_pages
landing_page_blocks
landing_page_products

quotations
quotation_items

bookings
booking_items

payments
payment_allocations
refunds

invoices
invoice_items

notifications
outbox_events
audit_logs
status_histories
entity_notes
```

---

# 170. MIGRATION STRATEGY

Semua schema change harus menggunakan versioned migration.

Contoh:

```text
001_create_users
002_create_customers
003_create_products
004_create_crm
005_create_quotations
006_create_bookings
007_create_payments
008_create_invoices
009_create_cms
010_create_audit
```

Actual sequence mengikuti implementation.

---

# 171. MIGRATION RULE

Migration harus:

- Deterministic
- Repeatable pada environment baru
- Versioned
- Reviewed
- Tested

---

# 172. MIGRATION ORDER

General order:

```text
Core identity
 ↓
Master data
 ↓
CRM
 ↓
Catalog
 ↓
CMS
 ↓
Sales
 ↓
Booking
 ↓
Billing
 ↓
Payment
 ↓
Communication
 ↓
Audit / support
```

---

# 173. SEED DATA

Seed data hanya untuk:

```text
Default roles
Default permissions
System configuration
Initial categories
Development fixtures
```

Production business data tidak boleh berasal dari development seed.

---

# 174. DATABASE TESTING

Database test harus mencakup:

```text
Migration
Constraint
Foreign key
Unique constraint
Calculation
Transaction
Concurrency
Rollback/recovery
```

---

# 175. TEST DATABASE

Automated test harus menggunakan isolated database.

Test tidak boleh mengubah staging/production database.

---

# 176. DATA FIX

Production data correction harus dilakukan melalui controlled process.

Tidak boleh menjalankan arbitrary SQL tanpa:

- Reason
- Review
- Backup consideration
- Audit

---

# 177. DATA REPAIR

Data repair script harus:

- Versioned
- Idempotent jika memungkinkan
- Tested
- Logged

---

# 178. REPORTING SNAPSHOT

Jika reporting memerlukan historical consistency, gunakan snapshot atau immutable transaction data.

---

# 179. DATA QUALITY RULE

Tidak boleh ada critical record dengan:

```text
Missing customer
Missing transaction number
Negative invalid amount
Invalid status
Broken foreign key
Missing currency
```

---

# 180. DATABASE DEFINITION OF DONE

Database implementation dianggap selesai jika:

```text
[ ] Entity model approved
[ ] Tables implemented
[ ] Primary keys defined
[ ] Foreign keys defined
[ ] Unique constraints defined
[ ] Check constraints defined
[ ] Indexes defined
[ ] Audit fields implemented
[ ] Status fields implemented
[ ] Migration implemented
[ ] Seed strategy implemented
[ ] Backup configured
[ ] Restore tested
[ ] Security configured
[ ] Query performance reviewed
[ ] Transaction boundaries reviewed
[ ] Data retention defined
```

---

# 181. BUSINESS DATA INTEGRITY CHECKLIST

```text
[ ] Customer cannot disappear from historical booking
[ ] Product price changes do not alter historical quotation
[ ] Product price changes do not alter historical booking
[ ] Invoice remains historically stable
[ ] Payment verification is auditable
[ ] Payment proof remains traceable
[ ] Duplicate payment is prevented
[ ] Duplicate booking is prevented
[ ] Duplicate business number is prevented
[ ] Status transitions are traceable
[ ] User actions are auditable
[ ] CMS content can reference products
[ ] Product can be referenced by multiple articles
[ ] Landing page can reference products
```

---

# 182. CRITICAL FINANCIAL DATA RULE

Data berikut dianggap highly critical:

```text
Quotation total
Booking total
Invoice total
Payment amount
Refund amount
Paid amount
Balance amount
```

Perubahan terhadap data tersebut harus memiliki strong authorization dan auditability.

---

# 183. CRITICAL BUSINESS DATA RULE

Data berikut harus dipertahankan secara historical:

```text
Customer
Quotation
Booking
Invoice
Payment
Refund
Audit Log
```

---

# 184. DATABASE PERFORMANCE BASELINE

Performance target harus ditentukan berdasarkan workload aktual.

Namun secara prinsip:

```text
Simple lookup
→ fast indexed query

Large listing
→ pagination

Heavy reporting
→ isolated workload

File delivery
→ object storage/CDN
```

---

# 185. SCALABILITY ROADMAP

Initial:

```text
Single primary database
```

Future:

```text
Primary
 ├── Read Replica
 ├── Cache
 ├── Search
 └── Analytics
```

Scaling tidak boleh dilakukan sebelum workload membutuhkan.

---

# 186. DATABASE FAILURE HANDLING

Jika database unavailable:

```text
Application
 ↓
Fail safely
 ↓
Do not create partial financial transaction
 ↓
Alert
 ↓
Recover
 ↓
Reconcile
```

---

# 187. CACHE FAILURE HANDLING

Cache failure tidak boleh menyebabkan kehilangan transactional data.

Application harus dapat fallback ke database jika applicable.

---

# 188. QUEUE FAILURE HANDLING

Queue failure tidak boleh menyebabkan silent loss.

Critical event harus menggunakan durable mechanism.

---

# 189. DATA CONSISTENCY AFTER FAILURE

Setelah infrastructure recovery, lakukan reconciliation untuk:

```text
Bookings
Payments
Invoices
Notifications
CRM follow-ups
```

---

# 190. FINAL DATABASE PRINCIPLE

Database harus menjadi:

> Single source of truth untuk transactional business data.

Frontend, cache, search index, report, dan external integration bukan source of truth.

---

# 191. FINAL DATA MODEL PRINCIPLE

Setiap business-critical entity harus memiliki:

```text
Identity
Ownership
Lifecycle
Status
Timestamp
Auditability
Relationship
Integrity
```

---

# 192. FINAL FINANCIAL PRINCIPLE

Financial records harus:

```text
Accurate
Traceable
Immutable after finalization
Auditable
Recoverable
```

---

# 193. FINAL CMS PRINCIPLE

CMS harus mendukung:

```text
Article
Landing Page
Product Reference
SEO
Publication
Draft
Revision
```

sehingga website dapat berfungsi bukan hanya sebagai company profile, tetapi juga sebagai content-driven sales channel.

---

# 194. FINAL CRM PRINCIPLE

CRM harus menyatukan:

```text
Customer
Lead
Sales Activity
Follow-up
Quotation
Booking
```

sehingga sales dapat melihat perjalanan customer dari prospect hingga transaction.

---

# 195. FINAL TRANSACTION PRINCIPLE

Transaction flow:

```text
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
Verification
 ↓
Completion
```

Tidak semua transaction harus melewati setiap tahap, tetapi relationship harus tetap dapat ditelusuri jika tahap tersebut digunakan.

---

# 196. SOURCE OF TRUTH MATRIX

| Data | Source of Truth |
|---|---|
| User | users |
| Customer | customers |
| Lead | leads |
| Product | products |
| Article | articles |
| Landing Page | landing_pages |
| Quotation | quotations |
| Booking | bookings |
| Payment | payments |
| Invoice | invoices |
| Refund | refunds |
| File metadata | files |
| Audit | audit_logs |
| Notification | notifications |
| Async event | outbox_events |

---

# 197. DOCUMENT DEPENDENCY

Dokumen ini berhubungan langsung dengan:

```text
04_PRD_SYSTEM_REQUIREMENTS.md
10_API_AND_INTEGRATION_SPECIFICATION.md
11_SECURITY_AUTHENTICATION_AND_AUDIT_SPECIFICATION.md
12_TESTING_QUALITY_ASSURANCE_AND_ACCEPTANCE_SPECIFICATION.md
13_DEPLOYMENT_DEVOPS_INFRASTRUCTURE_SPECIFICATION.md
```

---

# 198. NEXT DOCUMENT

Dokumen berikutnya:

```text
15_OBSERVABILITY_MONITORING_AND_OPERATIONS_SPECIFICATION.md
```

Dokumen tersebut akan mendefinisikan:

- Logging
- Metrics
- Monitoring
- Alerting
- Error tracking
- Health check
- Performance monitoring
- Queue monitoring
- Database monitoring
- Integration monitoring
- Business monitoring
- Incident management
- Operational dashboard
- SLA/SLO
- Runbook
- Escalation
- Disaster monitoring
- Production operations

---

# END OF DOCUMENT