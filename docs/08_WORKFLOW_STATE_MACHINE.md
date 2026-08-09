# BATAM TRAVELLING ERP
# WORKFLOW & STATE MACHINE

**File Name:** `08_WORKFLOW_STATE_MACHINE.md`  
**Document Number:** 08  
**Version:** 1.0  
**Status:** SYSTEM WORKFLOW BASELINE  
**Project:** Batam Travelling ERP  
**Last Updated:** 2026-08-08

---

# 1. PURPOSE

Dokumen ini mendefinisikan seluruh:

- Workflow
- Status
- State transition
- Trigger
- Actor
- Permission
- Approval
- Validation
- Automatic action
- Exception
- Cancellation
- Reversal
- Completion

Dokumen ini memastikan sistem tidak hanya menyimpan data, tetapi memahami:

> "Apa kondisi transaksi sekarang, apa yang boleh dilakukan berikutnya, dan siapa yang boleh melakukannya?"

---

# 2. CORE STATE MACHINE PRINCIPLE

Setiap transaksi utama memiliki:

```text
CURRENT STATE
+
ALLOWED TRANSITIONS
+
AUTHORIZED ACTOR
+
BUSINESS RULE
+
AUTOMATIC ACTION
```

Contoh:

```text
Quotation
   ↓
DRAFT
   ↓
READY
   ↓
SENT
   ↓
ACCEPTED
   ↓
CONVERTED
   ↓
BOOKING
```

User tidak boleh langsung mengubah:

```text
DRAFT → CONVERTED
```

tanpa melewati aturan yang diperlukan.

---

# 3. GLOBAL STATE RULE

Setiap state harus memiliki:

- State code
- Display name
- Description
- Allowed next states
- Allowed roles
- Required permission
- Required conditions
- Automatic actions
- Audit event

---

# 4. GLOBAL TRANSITION RULE

Setiap transition harus mengikuti:

```text
Current State
      ↓
Validate Permission
      ↓
Validate Business Rule
      ↓
Validate Required Data
      ↓
Validate Approval
      ↓
Change State
      ↓
Execute Automation
      ↓
Create Audit Log
      ↓
Notify Relevant Users
```

---

# 5. STATE TYPES

System menggunakan:

```text
DRAFT
PENDING
ACTIVE
APPROVED
REJECTED
CANCELLED
EXPIRED
COMPLETED
ARCHIVED
```

Tidak semua module menggunakan seluruh state.

---

# 6. LEAD / CRM WORKFLOW

## 6.1 Lead States

```text
NEW
↓
CONTACTED
↓
QUALIFIED
↓
PROPOSAL
↓
NEGOTIATION
↓
WON
```

Alternative:

```text
LOST
UNQUALIFIED
DORMANT
```

---

# 7. LEAD: NEW

Artinya lead baru masuk.

Source dapat berasal dari:

- Website
- WhatsApp
- Social media
- Referral
- Walk-in
- Manual entry
- Campaign
- Existing customer

System automatically records:

```text
lead_source
created_at
created_by
```

---

# 8. NEW → CONTACTED

Allowed actor:

- Sales
- Customer Service
- Sales Manager

Required:

```text
contact_attempted = true
```

Automatic:

```text
first_contact_at = now
```

CRM activity dibuat.

---

# 9. CONTACTED → QUALIFIED

Required:

- Customer identified
- Travel intent exists
- Basic requirement available

Contoh data:

```text
destination
travel_date
pax
service_interest
budget
```

Tidak semua field harus mandatory untuk semua jenis lead.

---

# 10. QUALIFIED → PROPOSAL

Trigger:

```text
Customer requirement sufficient
```

System dapat membuat:

```text
Quotation Draft
```

CRM opportunity berubah menjadi:

```text
PROPOSAL
```

---

# 11. PROPOSAL → NEGOTIATION

Trigger:

Customer memberikan feedback terhadap quotation.

Contoh:

- meminta discount,
- mengubah jumlah pax,
- mengubah itinerary,
- mengubah hotel,
- meminta tanggal lain.

---

# 12. PROPOSAL → WON

Tidak boleh hanya karena Sales mengklik "Won".

Minimal:

```text
Customer accepted offer
AND
commercial requirements satisfied
```

Jika booking belum dibuat:

```text
WON
↓
Create Booking
```

---

# 13. LEAD → LOST

Reasons harus dicatat.

Contoh:

```text
PRICE_TOO_HIGH
DATE_NOT_AVAILABLE
CUSTOMER_CANCELLED
COMPETITOR
NO_RESPONSE
NOT_QUALIFIED
OTHER
```

Jika `OTHER`, reason wajib diisi.

---

# 14. FOLLOW-UP AUTOMATION

Jika lead belum memberikan response:

```text
Lead
↓
No Response
↓
Follow-up Due
```

CRM membuat task:

```text
follow_up
due_at
assigned_to
```

---

# 15. FOLLOW-UP ESCALATION

Contoh:

```text
Follow-up #1
↓
No response
↓
Follow-up #2
↓
No response
↓
Follow-up #3
↓
Dormant / Lost
```

Jumlah follow-up ditentukan Business Policy.

---

# 16. CUSTOMER WORKFLOW

Customer memiliki lifecycle:

```text
PROSPECT
↓
CUSTOMER
↓
ACTIVE CUSTOMER
↓
INACTIVE CUSTOMER
```

Customer tidak boleh dihapus jika sudah memiliki transaction history.

---

# 17. CUSTOMER MERGE

Jika ditemukan duplicate customer:

```text
Customer A
+
Customer B
↓
Merge Request
↓
Review
↓
Merge
```

Merge harus diaudit.

---

# 18. QUOTATION WORKFLOW

Primary flow:

```text
DRAFT
↓
READY
↓
SENT
↓
VIEWED
↓
NEGOTIATION
↓
ACCEPTED
↓
CONVERTED
```

Alternative:

```text
REJECTED
EXPIRED
CANCELLED
```

---

# 19. QUOTATION — DRAFT

Quotation dapat dibuat oleh:

- Sales
- Sales Manager
- Authorized user

Quotation dapat berisi:

- Customer
- Package
- Date
- Pax
- Services
- Itinerary
- Pricing
- Discount
- Terms
- Validity
- Notes

---

# 20. QUOTATION — READY

Quotation dapat berubah menjadi READY jika:

```text
Customer exists
+
Items valid
+
Price calculated
+
Validity exists
+
Required terms complete
```

---

# 21. QUOTATION — SENT

Trigger:

```text
Send quotation
```

System:

```text
sent_at = now
sent_by = current_user
```

Delivery channel dapat:

- Email
- WhatsApp
- Customer Portal
- PDF
- Print

---

# 22. QUOTATION — VIEWED

Jika quotation dibuka melalui tracked channel:

```text
VIEWED
```

System mencatat:

```text
viewed_at
view_count
channel
```

Tracking bersifat optional.

---

# 23. QUOTATION — NEGOTIATION

Trigger:

Customer meminta perubahan.

Quotation dapat dibuat menjadi:

```text
NEGOTIATION
```

Perubahan:

- Price
- Pax
- Date
- Package
- Hotel
- Transport
- Itinerary

harus menghasilkan version history.

---

# 24. QUOTATION VERSIONING

Jangan overwrite quotation lama secara diam-diam.

Contoh:

```text
Quotation Q-0001 v1
↓
Customer Request
↓
Q-0001 v2
↓
Customer Request
↓
Q-0001 v3
```

Version terbaru menjadi active version.

---

# 25. QUOTATION — ACCEPTED

Customer menyatakan menerima quotation.

System menyimpan:

```text
accepted_at
accepted_by
acceptance_method
accepted_version
```

Acceptance method:

```text
PORTAL
MANUAL
EMAIL
WHATSAPP
OTHER
```

---

# 26. QUOTATION — CONVERTED

Quotation dapat converted menjadi booking jika:

```text
Quotation = ACCEPTED
```

dan required booking data tersedia.

System membuat:

```text
Booking
```

Reference quotation tetap tersimpan.

---

# 27. QUOTATION — EXPIRED

Quotation expired jika:

```text
today > valid_until
```

System dapat otomatis mengubah:

```text
SENT
↓
EXPIRED
```

Quotation expired tidak dapat accepted tanpa reactivation/reissue.

---

# 28. BOOKING WORKFLOW

Primary flow:

```text
DRAFT
↓
PENDING_CONFIRMATION
↓
CONFIRMED
↓
PREPARING
↓
READY
↓
IN_PROGRESS
↓
COMPLETED
```

Alternative:

```text
ON_HOLD
CANCELLED
```

---

# 29. BOOKING — DRAFT

Booking dibuat dari:

- Accepted quotation
- Manual booking
- Customer request
- Sales input

Belum menjadi commitment final.

---

# 30. BOOKING — PENDING_CONFIRMATION

Booking siap diproses tetapi belum final.

Required:

- Customer
- Date
- Pax
- Service
- Price
- Payment terms

---

# 31. BOOKING CONFIRMATION

Confirmation membutuhkan validasi:

```text
Availability
+
Price
+
Required payment condition
+
Operational feasibility
```

Jika diperlukan approval:

```text
Pending Confirmation
↓
Approval
↓
Confirmed
```

---

# 32. BOOKING — CONFIRMED

Confirmed berarti booking telah resmi diterima oleh perusahaan.

System dapat otomatis:

- Create operational tasks
- Reserve availability
- Create payment schedule
- Generate invoice
- Update CRM
- Notify customer
- Notify operations

Automation mengikuti policy.

---

# 33. BOOKING — ON HOLD

Digunakan ketika:

- Customer belum final
- Payment issue
- Supplier confirmation pending
- Operational issue
- Management review

On Hold wajib memiliki:

```text
hold_reason
hold_until
```

Jika hold melewati deadline:

```text
Review Required
```

---

# 34. BOOKING — PREPARING

Trip mulai masuk tahap preparation.

Operations dapat membuat:

- Trip plan
- Driver assignment
- Guide assignment
- Vehicle assignment
- Hotel confirmation
- Vendor confirmation
- Itinerary finalization

---

# 35. BOOKING — READY

Booking siap dijalankan.

Minimum:

```text
Operations assigned
+
Required vendors confirmed
+
Required documents ready
+
Itinerary ready
```

---

# 36. BOOKING — IN PROGRESS

Trigger:

```text
Trip start
```

System dapat automatically:

```text
trip_started_at = now
```

---

# 37. BOOKING — COMPLETED

Trip dapat completed jika:

```text
Trip finished
+
Required operational completion
```

Optional:

```text
Customer feedback
Trip report
Expense completion
Vendor settlement
```

---

# 38. BOOKING — CANCELLED

Cancellation tidak boleh langsung menghapus booking.

System menyimpan:

```text
cancelled_at
cancelled_by
cancel_reason
financial_impact
refund_amount
```

---

# 39. CANCELLATION WORKFLOW

```text
ACTIVE BOOKING
↓
Cancellation Request
↓
Review
↓
Calculate Cancellation Cost
↓
Approval
↓
CANCELLED
↓
Refund Process if applicable
```

---

# 40. RESCHEDULE WORKFLOW

```text
Booking
↓
Reschedule Request
↓
Check Availability
↓
Calculate Price Difference
↓
Customer Confirmation
↓
Approval if required
↓
New Date
```

Old date harus tetap tercatat dalam history.

---

# 41. PAYMENT WORKFLOW

Primary flow:

```text
UNPAID
↓
PROOF_UPLOADED
↓
UNDER_REVIEW
↓
VERIFIED
```

Alternative:

```text
REJECTED
REVERSED
REFUNDED
```

---

# 42. PAYMENT — UNPAID

Invoice/payment schedule exists tetapi belum ada payment yang verified.

---

# 43. PAYMENT — PROOF UPLOADED

Customer atau Sales dapat upload bukti transfer.

System:

```text
payment_status = PROOF_UPLOADED
```

Bukti harus terkait dengan:

```text
customer
booking
invoice/payment_schedule
```

---

# 44. PAYMENT — UNDER REVIEW

Finance menerima payment proof.

Finance melakukan:

- Check amount
- Check account
- Check date
- Check reference
- Check duplicate
- Check booking
- Check invoice

---

# 45. PAYMENT — VERIFIED

Jika valid:

```text
UNDER_REVIEW
↓
VERIFIED
```

System:

```text
verified_at
verified_by
```

Booking/payment balance diperbarui.

---

# 46. PAYMENT — REJECTED

Jika tidak valid:

```text
UNDER_REVIEW
↓
REJECTED
```

Reason wajib.

Contoh:

```text
INVALID_PROOF
WRONG_AMOUNT
WRONG_ACCOUNT
DUPLICATE
UNREADABLE
UNMATCHED
```

Customer/Sales dapat menerima notification.

---

# 47. PAYMENT — REVERSED

Verified payment tidak boleh diedit menjadi unpaid.

Jika terjadi koreksi:

```text
VERIFIED
↓
REVERSAL REQUEST
↓
APPROVAL
↓
REVERSED
```

Audit wajib.

---

# 48. INVOICE WORKFLOW

```text
DRAFT
↓
READY
↓
ISSUED
↓
PARTIALLY_PAID
↓
PAID
```

Alternative:

```text
VOID
OVERDUE
```

---

# 49. INVOICE — DRAFT

Invoice dapat diedit.

---

# 50. INVOICE — READY

Validation:

```text
Customer
+
Booking
+
Invoice items
+
Amount
+
Due date
```

---

# 51. INVOICE — ISSUED

Invoice resmi diterbitkan.

System:

```text
invoice_number
issued_at
issued_by
```

Invoice version harus terkunci.

---

# 52. INVOICE — PARTIALLY PAID

Jika:

```text
paid_amount < invoice_total
```

state:

```text
PARTIALLY_PAID
```

---

# 53. INVOICE — PAID

Jika:

```text
paid_amount >= invoice_total
```

dan payment verified:

```text
PAID
```

---

# 54. INVOICE — OVERDUE

Jika:

```text
due_date < today
AND
balance > 0
```

state:

```text
OVERDUE
```

System dapat membuat CRM follow-up task.

---

# 55. INVOICE — VOID

Invoice issued tidak boleh dihapus.

Jika salah:

```text
VOID
```

Reason wajib.

---

# 56. REFUND WORKFLOW

```text
REQUESTED
↓
UNDER_REVIEW
↓
APPROVED
↓
PROCESSING
↓
COMPLETED
```

Alternative:

```text
REJECTED
CANCELLED
```

---

# 57. REFUND — REQUESTED

Requester:

- Customer
- Sales
- Customer Service
- Authorized employee

Reason wajib.

---

# 58. REFUND — UNDER REVIEW

Finance memeriksa:

- Payment verified
- Cancellation policy
- Refund eligibility
- Refund amount
- Previous refund
- Outstanding balance

---

# 59. REFUND — APPROVED

Approval berdasarkan:

- Role
- Amount
- Business policy

Self-approval harus dicegah jika four-eyes policy aktif.

---

# 60. REFUND — PROCESSING

Finance melakukan transfer/refund.

System menyimpan:

```text
processed_by
processed_at
refund_reference
```

---

# 61. REFUND — COMPLETED

Refund selesai.

System:

```text
refund_status = COMPLETED
```

Customer diberi notification.

---

# 62. CRM FOLLOW-UP WORKFLOW

Setiap event penting dapat membuat follow-up.

Contoh:

```text
Quotation Sent
↓
CRM Follow-up Task
```

```text
Invoice Overdue
↓
CRM Follow-up Task
```

```text
Payment Rejected
↓
CRM Follow-up Task
```

```text
Trip Completed
↓
Feedback Task
```

---

# 63. AUTOMATIC CRM TASK

Task memiliki:

```text
task_type
related_record
assigned_to
due_at
priority
status
```

Status:

```text
OPEN
IN_PROGRESS
COMPLETED
CANCELLED
OVERDUE
```

---

# 64. ITINERARY WORKFLOW

```text
DRAFT
↓
REVIEW
↓
APPROVED
↓
PUBLISHED
↓
COMPLETED
```

---

# 65. ITINERARY DRAFT

Dapat dibuat dari package template.

Contoh:

```text
Package
↓
Day 1
Day 2
Day 3
...
```

Operations dapat melakukan customization.

---

# 66. ITINERARY REVIEW

Review memastikan:

- Date valid
- Time valid
- Location valid
- Activities available
- Transport available
- No scheduling conflict

---

# 67. ITINERARY APPROVED

Setelah approved:

```text
Approved version
```

menjadi operational baseline.

---

# 68. ITINERARY PUBLISHED

Customer dapat melihat itinerary yang sudah published.

Internal notes tetap tersembunyi.

---

# 69. ITINERARY CHANGE AFTER PUBLISHED

Jika ada perubahan:

```text
Published v1
↓
Change
↓
Draft v2
↓
Review
↓
Approval
↓
Published v2
```

Customer dapat menerima notification.

---

# 70. PACKAGE WORKFLOW

```text
DRAFT
↓
REVIEW
↓
APPROVED
↓
PUBLISHED
↓
ACTIVE
↓
INACTIVE
```

Package yang inactive tidak dapat digunakan untuk quotation baru.

Existing booking tetap mempertahankan snapshot package.

---

# 71. PACKAGE SNAPSHOT

Saat quotation/booking dibuat, system menyimpan snapshot:

```text
package_name
description
included_items
excluded_items
price
itinerary
terms
```

Tujuan:

Jika package master berubah, historical booking tidak ikut berubah.

---

# 72. AVAILABILITY WORKFLOW

Availability:

```text
AVAILABLE
↓
RESERVED
↓
CONFIRMED
↓
USED
```

Alternative:

```text
BLOCKED
RELEASED
```

---

# 73. AVAILABILITY RESERVATION

Ketika booking membutuhkan resource:

```text
Check Availability
↓
Reserve
↓
Booking Confirmation
```

Jika booking cancelled:

```text
Reserved
↓
Release
```

---

# 74. RESOURCE TYPES

Availability dapat berlaku untuk:

- Vehicle
- Driver
- Guide
- Hotel
- Activity
- Boat
- Vendor
- Room
- Equipment

---

# 75. DOUBLE BOOKING PROTECTION

System harus mencegah:

```text
Resource
+
Same Time
+
Overlapping Booking
```

kecuali resource memang mendukung multiple capacity.

---

# 76. DRIVER / GUIDE ASSIGNMENT

```text
UNASSIGNED
↓
ASSIGNED
↓
ACCEPTED
↓
IN_PROGRESS
↓
COMPLETED
```

Jika employee menolak assignment:

```text
ASSIGNED
↓
DECLINED
↓
UNASSIGNED
```

---

# 77. VENDOR WORKFLOW

```text
DRAFT
↓
UNDER_REVIEW
↓
APPROVED
↓
ACTIVE
```

Alternative:

```text
REJECTED
INACTIVE
SUSPENDED
```

---

# 78. VENDOR TRANSACTION

Vendor booking:

```text
REQUESTED
↓
CONFIRMATION_PENDING
↓
CONFIRMED
↓
COMPLETED
↓
SETTLED
```

---

# 79. EXPENSE WORKFLOW

```text
DRAFT
↓
SUBMITTED
↓
UNDER_REVIEW
↓
APPROVED
↓
PAID
```

Alternative:

```text
REJECTED
```

---

# 80. COMMISSION WORKFLOW

```text
CALCULATED
↓
REVIEW
↓
APPROVED
↓
PAYABLE
↓
PAID
```

Adjustment:

```text
ADJUSTMENT_REQUEST
↓
APPROVED
↓
RECALCULATED
```

---

# 81. WEBSITE CONTENT WORKFLOW

```text
DRAFT
↓
REVIEW
↓
APPROVED
↓
PUBLISHED
```

Alternative:

```text
REJECTED
UNPUBLISHED
ARCHIVED
```

---

# 82. DOCUMENT GENERATION WORKFLOW

Dokumen seperti:

- Quotation
- Invoice
- Receipt
- Itinerary
- Confirmation Letter

mengikuti:

```text
Data
↓
Template
↓
Generate
↓
Version
↓
Store
↓
Send / Print
```

---

# 83. AUTOMATIC DOCUMENT RULE

Dokumen yang sudah dikirim tidak boleh berubah diam-diam.

Jika data berubah:

```text
Document v1
↓
Data Change
↓
Document v2
```

---

# 84. NOTIFICATION WORKFLOW

Notification dapat dipicu oleh:

```text
State Change
Payment Event
Approval
Assignment
Deadline
Exception
```

Channel:

```text
In-App
Email
WhatsApp
SMS
```

Channel availability mengikuti integration.

---

# 85. NOTIFICATION FAILURE

Jika delivery gagal:

```text
SENT
↓
FAILED
```

System dapat:

```text
RETRY
```

tetapi transaction state tidak boleh otomatis dibatalkan hanya karena notification gagal.

---

# 86. AUTOMATION PRINCIPLE

Automation tidak boleh melewati authorization.

Contoh:

```text
Automation
↓
Create Refund
```

harus tetap mengikuti:

```text
Refund Policy
Approval
Audit
```

---

# 87. STATE TRANSITION AUDIT

Setiap perubahan state mencatat:

```text
record_id
record_type
from_state
to_state
changed_by
changed_at
reason
metadata
```

---

# 88. STATE TRANSITION HISTORY

History tidak boleh dihapus.

Contoh:

```text
Booking #B001

DRAFT
↓
PENDING_CONFIRMATION
↓
CONFIRMED
↓
PREPARING
↓
READY
↓
IN_PROGRESS
↓
COMPLETED
```

---

# 89. INVALID TRANSITION

Contoh:

```text
COMPLETED
↓
DRAFT
```

Default:

```text
DENIED
```

Jika diperlukan correction:

gunakan explicit process seperti:

```text
REOPEN REQUEST
```

bukan edit state langsung.

---

# 90. REOPEN WORKFLOW

Jika completed transaction perlu dibuka kembali:

```text
COMPLETED
↓
REOPEN REQUEST
↓
REVIEW
↓
APPROVED
↓
REOPENED
```

Reason wajib.

---

# 91. EXCEPTION WORKFLOW

Jika terjadi kondisi di luar normal:

```text
Normal Workflow
↓
Exception Detected
↓
Exception Request
↓
Manager Review
↓
Approve / Reject
↓
Continue Workflow
```

---

# 92. SYSTEM LOCKED STATES

Beberapa state harus dianggap locked.

Contoh:

```text
INVOICE = ISSUED
PAYMENT = VERIFIED
REFUND = COMPLETED
BOOKING = COMPLETED
```

Perubahan membutuhkan explicit reversal/correction workflow.

---

# 93. AUTOMATIC DEADLINES

System dapat menggunakan deadline untuk:

- Quotation validity
- Payment due date
- Follow-up
- Hold period
- Vendor confirmation
- Trip preparation

---

# 94. DEADLINE ESCALATION

Contoh:

```text
Due Soon
↓
Due
↓
Overdue
↓
Escalated
```

Notification dapat dikirim kepada:

- Assigned user
- Manager
- Finance
- Operations

tergantung transaction.

---

# 95. WORKFLOW NOTIFICATION EXAMPLES

### Quotation

```text
Quotation Sent
→ Customer Notification
```

### Payment

```text
Payment Proof Uploaded
→ Finance Notification
```

### Payment Rejected

```text
Payment Rejected
→ Customer + Sales Notification
```

### Booking Confirmed

```text
Booking Confirmed
→ Customer + Operations Notification
```

### Trip Ready

```text
Trip Ready
→ Operations + Assigned Guide/Driver
```

### Trip Completed

```text
Trip Completed
→ CRM Follow-up
```

---

# 96. CUSTOMER-FACING STATE

Internal state tidak selalu sama dengan customer-facing status.

Contoh internal:

```text
PENDING_CONFIRMATION
```

Customer dapat melihat:

```text
Awaiting Confirmation
```

Internal:

```text
PAYMENT_UNDER_REVIEW
```

Customer:

```text
Payment Being Verified
```

---

# 97. INTERNAL VS CUSTOMER STATUS

System harus memiliki:

```text
internal_status
customer_status
```

jika diperlukan.

Jangan menampilkan internal terminology kepada customer.

---

# 98. WORKFLOW PERMISSION

State transition harus terkait permission.

Contoh:

```text
quotation.send
quotation.approve
booking.confirm
payment.verify
refund.approve
invoice.issue
```

Tidak cukup hanya memiliki:

```text
quotation.edit
```

untuk melakukan semua transition.

---

# 99. STATE MACHINE AND ROLE

Contoh:

```text
Sales
DRAFT → READY
READY → SENT

Sales Manager
SENT → ACCEPTED only if authorized acceptance process

Finance
PROOF_UPLOADED → VERIFIED

Finance Manager
REFUND → APPROVED
```

---

# 100. STATE MACHINE AND BUSINESS RULE

Permission menjawab:

> "Boleh atau tidak?"

Business rule menjawab:

> "Dalam kondisi apa boleh?"

Contoh:

```text
Sales memiliki quotation.send
```

tetapi:

```text
Quotation expired
```

maka:

```text
SEND = DENIED
```

---

# 101. STATE MACHINE AND DATA VALIDATION

Sebelum transition:

```text
Validate required fields
```

Contoh:

Tidak boleh:

```text
Booking → CONFIRMED
```

jika:

```text
customer_id = null
```

---

# 102. STATE MACHINE AND PAYMENT

Booking dapat memiliki kondisi:

```text
Payment Required
Payment Pending
Payment Verified
Payment Overdue
```

Business Policy menentukan apakah booking dapat confirmed tanpa full payment.

---

# 103. STATE MACHINE AND AVAILABILITY

Booking confirmation harus mempertimbangkan availability.

Jika resource required tetapi tidak tersedia:

```text
Confirmation = BLOCKED
```

atau:

```text
ON_HOLD
```

sesuai policy.

---

# 104. STATE MACHINE AND CRM

CRM tidak berhenti ketika booking dibuat.

Flow:

```text
Lead
↓
Quotation
↓
Booking
↓
Trip
↓
Completed
↓
Post-Trip Follow-up
↓
Repeat Customer
```

---

# 105. POST-TRIP WORKFLOW

Setelah completed:

```text
Trip Completed
↓
Feedback Request
↓
Review
↓
Follow-up
↓
Customer Retention
```

CRM task dapat otomatis dibuat.

---

# 106. REPEAT CUSTOMER

Jika customer melakukan booking kembali:

```text
Existing Customer
↓
New Opportunity
```

Jangan membuat duplicate customer secara otomatis.

---

# 107. WORKFLOW DATA REQUIREMENT

Setiap workflow harus memiliki:

```text
state
state_changed_at
state_changed_by
previous_state
```

Untuk transaction penting:

```text
state_history
```

---

# 108. WORKFLOW API PRINCIPLE

Backend sebaiknya menyediakan transition endpoint/action.

Contoh:

```text
POST /quotations/{id}/send
POST /quotations/{id}/accept
POST /bookings/{id}/confirm
POST /bookings/{id}/cancel
POST /payments/{id}/verify
POST /refunds/{id}/approve
POST /invoices/{id}/issue
```

daripada membolehkan frontend melakukan:

```text
PATCH status = "CONFIRMED"
```

secara bebas.

---

# 109. WHY DIRECT STATUS EDIT IS FORBIDDEN

Karena direct edit dapat melewati:

- Permission
- Validation
- Approval
- Availability
- Payment rule
- Audit
- Notification

---

# 110. TRANSACTIONAL INTEGRITY

State change dan required database changes sebaiknya terjadi dalam satu transaction.

Contoh:

```text
Confirm Booking
+
Reserve Resource
+
Create Payment Schedule
+
Write Audit
```

Jika critical operation gagal:

```text
ROLLBACK
```

sesuai transaction design.

---

# 111. IDEMPOTENCY

Automation penting harus aman jika dipanggil dua kali.

Contoh:

```text
Generate Invoice
```

tidak boleh menghasilkan dua invoice hanya karena request dikirim ulang.

Gunakan:

```text
idempotency_key
```

jika diperlukan.

---

# 112. CONCURRENCY

Jika dua user mencoba melakukan action yang sama:

```text
User A → Confirm
User B → Confirm
```

system harus mencegah duplicate transition.

---

# 113. OPTIMISTIC / PESSIMISTIC CONTROL

Untuk transaksi sensitif, gunakan mekanisme concurrency control yang sesuai.

Contoh:

```text
Payment verification
Refund
Booking confirmation
Availability reservation
```

---

# 114. WORKFLOW ERROR HANDLING

Error harus menjelaskan:

- Action gagal
- Reason
- Apa yang harus diperbaiki

Contoh:

```text
Booking cannot be confirmed because required vehicle availability is not available.
```

---

# 115. USER-FACING ERROR

Jangan menampilkan technical stack trace.

Customer melihat:

```text
We could not complete this request.
Please contact support.
```

Internal user dapat menerima reason yang lebih detail.

---

# 116. WORKFLOW CONFIGURATION

Workflow core tidak boleh bergantung pada hard-coded UI.

State dan transition sebaiknya didefinisikan pada backend/domain layer.

---

# 117. FUTURE CONFIGURABILITY

System harus memungkinkan penambahan:

- New payment states
- New approval states
- New service states
- New workflow modules

tanpa merombak seluruh architecture.

---

# 118. MASTER WORKFLOW

Gambaran keseluruhan:

```text
LEAD
 ↓
QUALIFIED
 ↓
QUOTATION
 ↓
ACCEPTED
 ↓
BOOKING
 ↓
CONFIRMED
 ↓
PAYMENT
 ↓
PREPARING
 ↓
READY
 ↓
TRIP
 ↓
COMPLETED
 ↓
CRM FOLLOW-UP
 ↓
REPEAT CUSTOMER
```

---

# 119. FINANCIAL WORKFLOW

```text
QUOTATION
 ↓
INVOICE
 ↓
PAYMENT PROOF
 ↓
VERIFICATION
 ↓
PAID
 ↓
TRIP
 ↓
REFUND if applicable
 ↓
SETTLEMENT
```

---

# 120. OPERATIONAL WORKFLOW

```text
BOOKING CONFIRMED
 ↓
RESOURCE CHECK
 ↓
VENDOR CONFIRMATION
 ↓
DRIVER/GUIDE ASSIGNMENT
 ↓
ITINERARY FINAL
 ↓
READY
 ↓
TRIP
 ↓
COMPLETED
```

---

# 121. CRM WORKFLOW

```text
LEAD
 ↓
CONTACT
 ↓
QUALIFY
 ↓
PROPOSAL
 ↓
NEGOTIATION
 ↓
WON
 ↓
BOOKING
 ↓
POST-TRIP FOLLOW-UP
 ↓
RETENTION
```

---

# 122. MASTER STATE TRANSITION RULE

Tidak ada perubahan state tanpa:

```text
AUTHORIZED ACTION
+
VALID CURRENT STATE
+
VALID NEXT STATE
+
BUSINESS VALIDATION
+
AUDIT
```

---

# 123. ACCEPTANCE CRITERIA

Dokumen workflow dianggap terimplementasi jika:

- Semua core module memiliki state.
- Semua state memiliki allowed transition.
- Invalid transition ditolak.
- Permission diperiksa.
- Data validation diperiksa.
- Approval diperiksa.
- Audit dibuat.
- Notification berjalan sesuai trigger.
- Customer hanya melihat status customer-facing.
- Historical state tidak hilang.

---

# 124. DOCUMENT DEPENDENCIES

Dokumen ini menggunakan:

```text
00_PROJECT_INSTRUCTIONS.md
01_BUSINESS_FOUNDATION.md
02_BUSINESS_PROCESS_AND_SOP.md
03_BUSINESS_RULES_AND_POLICY.md
04_PRD_SYSTEM_REQUIREMENTS.md
05_MODULE_SPECIFICATIONS.md
06_DATA_MODEL_AND_DATABASE_SCHEMA.md
07_USER_ROLES_PERMISSIONS_MATRIX.md
```

Dokumen berikutnya:

```text
09_UI_UX_AND_FRONTEND_SPECIFICATION.md
```

---

# 125. FINAL PRINCIPLE

ERP harus diperlakukan sebagai:

```text
DATA
+
ROLE
+
PERMISSION
+
STATE
+
BUSINESS RULE
+
APPROVAL
+
AUTOMATION
+
AUDIT
```

Bukan sekadar:

```text
CRUD DATABASE
```

State machine adalah penghubung utama antara:

```text
Business Process
        ↓
SOP
        ↓
Business Rules
        ↓
Roles & Permissions
        ↓
System Workflow
        ↓
Automation
        ↓
Audit
```

**End of Document**