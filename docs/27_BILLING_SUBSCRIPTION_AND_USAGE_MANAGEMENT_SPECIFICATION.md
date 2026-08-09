# 27_BILLING_SUBSCRIPTION_AND_USAGE_MANAGEMENT_SPECIFICATION.md

**Project:** Batam Travelling ERP  
**Document:** 27 — Billing, Subscription and Usage Management Specification  
**Version:** 1.0  
**Status:** FINAL / PRODUCTION BASELINE  
**Date:** 2026-08-09

---

## 1. PURPOSE

Dokumen ini mendefinisikan spesifikasi final untuk subsystem billing, subscription, usage metering, quota, invoice, payment, refund, credit, discount, reconciliation, dan entitlement.

Billing harus tenant-aware, auditable, idempotent, secure, dan dapat direkonsiliasi dengan payment provider.

---

## 2. SCOPE

Cakupan:

- Plan dan pricing
- Subscription lifecycle
- Trial
- Billing cycle
- Upgrade/downgrade
- Proration
- Invoice
- Payment
- Payment method
- Payment webhook
- Refund
- Credit dan adjustment
- Coupon/discount
- Usage metering
- Quota
- Entitlement
- Dunning dan grace period
- Billing notification
- Reconciliation
- Billing reporting
- Audit
- Tenant isolation
- Recovery dan operational controls

---

## 3. DESIGN PRINCIPLES

1. Tenant isolation wajib ditegakkan server-side.
2. Financial records yang telah finalized tidak boleh diubah secara silent.
3. Historical invoice menggunakan snapshot harga, plan, tax, discount, dan billing period.
4. Payment dan webhook harus idempotent.
5. Internal billing state adalah source of truth operasional dan harus dapat direkonsiliasi dengan provider.
6. Frontend tidak boleh menjadi authority untuk entitlement atau quota.
7. Semua financial mutation harus dapat diaudit.
8. Monetary value harus memiliki currency.
9. Concurrent requests tidak boleh menyebabkan double charge atau quota bypass.
10. Billing failure harus memiliki failure policy yang eksplisit.

---

# 4. BILLING DOMAIN MODEL

Domain minimum:

```text
Tenant
Plan
PlanVersion
Price
Subscription
SubscriptionChange
UsageMeter
UsageRecord
Quota
Entitlement
Invoice
InvoiceLine
Payment
PaymentAttempt
Refund
Credit
Adjustment
Coupon
Discount
BillingEvent
BillingNotification
ReconciliationRecord
```

---

# 5. TENANT OWNERSHIP

Semua billing record tenant-scoped wajib memiliki:

```text
tenant_id
```

Platform catalog seperti Plan dan Price dapat bersifat global, tetapi setiap subscription, invoice, payment, usage, credit, refund, dan adjustment harus memiliki tenant ownership yang jelas.

---

# 6. TENANT ISOLATION

Tenant A tidak boleh:

- membaca invoice Tenant B;
- membaca payment Tenant B;
- menggunakan subscription Tenant B;
- menggunakan quota Tenant B;
- mengubah payment method Tenant B;
- mengakses billing export Tenant B;
- melihat usage Tenant B.

Isolation wajib dites melalui automated cross-tenant authorization tests.

---

# 7. MONEY REPRESENTATION

Monetary amount tidak boleh menggunakan floating point.

Recommended:

```text
amount_minor: integer
currency: ISO currency code
```

Contoh:

```json
{
  "amount_minor": 15000000,
  "currency": "IDR"
}
```

---

# 8. ROUNDING

Rounding policy harus konsisten untuk:

- price;
- tax;
- discount;
- proration;
- invoice line;
- refund;
- credit.

Policy harus terdokumentasi dan diuji.

---

# 9. PLAN

Plan mendefinisikan paket layanan.

Contoh:

```text
FREE
STARTER
PRO
BUSINESS
ENTERPRISE
```

Plan dapat menentukan:

```text
Features
User limit
Branch limit
Booking limit
Storage limit
API limit
Automation limit
Reporting capability
Support level
```

---

# 10. PLAN VERSIONING

Plan yang sudah digunakan oleh tenant tidak boleh berubah secara retroaktif.

Perubahan material menghasilkan:

```text
PlanVersion
```

PlanVersion historis harus immutable.

---

# 11. PRICE VERSIONING

Price harus versioned.

Minimum:

```text
price_id
plan_version_id
amount_minor
currency
interval
interval_count
effective_from
effective_to
status
```

Historical invoice harus menyimpan price snapshot.

---

# 12. SUBSCRIPTION

Subscription merepresentasikan entitlement tenant terhadap sebuah plan.

Minimum:

```text
subscription_id
tenant_id
plan_id
plan_version_id
status
start_at
current_period_start
current_period_end
cancel_at
canceled_at
trial_start
trial_end
```

---

# 13. SUBSCRIPTION STATUS

Minimum:

```text
TRIALING
ACTIVE
PAST_DUE
PAUSED
CANCELED
EXPIRED
```

---

# 14. STATUS TRANSITION

Transition harus deterministic.

Contoh:

```text
TRIALING -> ACTIVE
TRIALING -> CANCELED
TRIALING -> EXPIRED

ACTIVE -> PAST_DUE
ACTIVE -> PAUSED
ACTIVE -> CANCELED

PAST_DUE -> ACTIVE
PAST_DUE -> CANCELED
PAST_DUE -> PAUSED

PAUSED -> ACTIVE
PAUSED -> CANCELED
```

Invalid transition harus ditolak.

---

# 15. SINGLE ACTIVE SUBSCRIPTION

Default tenant memiliki satu primary active subscription.

Multi-subscription hanya boleh jika business model secara eksplisit mendukungnya.

---

# 16. TRIAL

Trial dapat memiliki:

```text
trial_start
trial_end
trial_plan
trial_usage_limit
conversion_policy
```

Trial expiration harus deterministic.

---

# 17. TRIAL CONVERSION

Saat trial berakhir, system dapat:

```text
Convert to paid
Expire
Restrict
Suspend
```

sesuai konfigurasi.

---

# 18. BILLING CYCLE

Supported:

```text
Monthly
Quarterly
Yearly
Custom interval
```

Setiap subscription memiliki:

```text
period_start
period_end
```

---

# 19. TIMEZONE

Timestamp disimpan dalam UTC.

Billing boundary dapat menggunakan configured tenant billing timezone jika diperlukan.

---

# 20. UPGRADE

Upgrade dapat:

- berlaku segera;
- meningkatkan entitlement segera;
- menghasilkan prorated charge atau credit;
- membuat invoice adjustment bila diperlukan.

---

# 21. DOWNGRADE

Downgrade default disarankan berlaku pada akhir billing period.

Jika berlaku segera, system harus memiliki explicit proration policy.

Downgrade tidak boleh menghapus data bisnis hanya karena quota plan lebih kecil.

---

# 22. PRORATION

Proration policy harus eksplisit:

```text
Immediate charge
Immediate credit
Credit + charge
Next-cycle change
No proration
```

Calculation harus deterministic dan covered by tests.

---

# 23. CANCELLATION

Cancellation wajib mencatat:

```text
requested_at
effective_at
reason
actor
```

Default dapat menggunakan:

```text
cancel_at_period_end = true
```

Immediate cancellation mengikuti refund/credit policy.

---

# 24. GRACE PERIOD

Past-due subscription dapat memiliki grace period:

```text
grace_start
grace_end
```

Service restriction setelah grace period harus configurable.

---

# 25. DUNNING

Dunning menangani failed payment.

Contoh:

```text
Payment failure
    ↓
Retry 1
    ↓
Reminder
    ↓
Retry 2
    ↓
Final warning
    ↓
Restriction
    ↓
Suspension
```

Jumlah retry dan interval harus configurable.

---

# 26. ENTITLEMENT

Entitlement menentukan feature/resource yang boleh digunakan tenant.

Resolver mempertimbangkan:

```text
Subscription
Plan
PlanVersion
Tenant override
Feature configuration
Subscription status
Quota
```

Backend adalah authoritative source.

---

# 27. ENTITLEMENT CACHE

Jika menggunakan cache:

- harus tenant-scoped;
- memiliki TTL;
- memiliki invalidation;
- tidak boleh stale tanpa batas.

---

# 28. QUOTA

Quota adalah batas penggunaan.

Contoh:

```text
100 users
10 branches
10,000 bookings/month
100 GB storage
100,000 API requests/month
```

Jenis:

```text
Hard limit
Soft limit
Unlimited
Plan-defined
Tenant override
```

---

# 29. QUOTA ENFORCEMENT

Quota harus diverifikasi server-side sebelum operation yang meningkatkan usage.

Concurrent requests tidak boleh melewati quota melalui race condition.

Gunakan transaction, atomic counter, reservation, locking, atau mekanisme concurrency-safe lain sesuai kebutuhan.

---

# 30. QUOTA WARNING

Threshold dapat berupa:

```text
70%
80%
90%
100%
```

Warning menghasilkan billing/operational notification sesuai policy.

---

# 31. USAGE METERING

Usage meter mencatat resource yang:

- dibatasi;
- ditampilkan;
- atau ditagihkan.

Contoh:

```text
ACTIVE_USERS
BRANCH_COUNT
BOOKING_COUNT
STORAGE_BYTES
API_REQUESTS
ARTICLE_COUNT
LANDING_PAGE_COUNT
AUTOMATION_RUNS
MESSAGE_COUNT
```

---

# 32. USAGE RECORD

Minimum:

```text
usage_record_id
tenant_id
meter_code
quantity
occurred_at
source_type
source_id
idempotency_key
```

---

# 33. USAGE IDEMPOTENCY

Usage event harus idempotent.

Retry event yang sama tidak boleh menggandakan usage.

---

# 34. USAGE TYPES

Meter dapat berupa:

```text
Counter
Gauge
Unique count
Peak value
Accumulated quantity
```

---

# 35. USAGE SOURCE

Usage sebaiknya berasal dari authoritative business event.

Contoh:

```text
booking.confirmed
file.stored
api.request.accepted
user.activated
article.published
landing_page.published
```

---

# 36. USAGE SNAPSHOT

Saat invoice dibuat, billable usage harus disnapshot agar invoice historis dapat direkonstruksi.

Late usage mengikuti policy:

```text
Next invoice
Adjustment
Rebill
Ignore
```

---

# 37. USAGE RECONCILIATION

System harus dapat membandingkan usage aggregation dengan source-of-truth business data.

Mismatch menghasilkan operational alert.

---

# 38. INVOICE

Invoice merepresentasikan billing obligation.

Minimum:

```text
invoice_id
tenant_id
invoice_number
status
currency
subtotal
discount_total
tax_total
total
issued_at
due_at
paid_at
```

---

# 39. INVOICE NUMBER

Invoice number harus unique sesuai scope business/legal.

---

# 40. INVOICE STATUS

Minimum:

```text
DRAFT
OPEN
PARTIALLY_PAID
PAID
PAST_DUE
VOID
UNCOLLECTIBLE
```

---

# 41. INVOICE IMMUTABILITY

Invoice yang sudah finalized tidak boleh diedit secara silent.

Correction menggunakan:

```text
Credit note
Adjustment
Replacement invoice
```

sesuai accounting policy.

---

# 42. INVOICE LINE

Minimum:

```text
invoice_line_id
invoice_id
description
quantity
unit_price
discount
tax
line_total
source_type
source_id
```

---

# 43. INVOICE SNAPSHOT

Invoice menyimpan snapshot:

```text
Plan name
Plan version
Price
Currency
Billing period
Tax
Discount
Usage
```

---

# 44. INVOICE GENERATION

Invoice generation harus idempotent.

Business uniqueness dapat menggunakan:

```text
tenant_id
subscription_id
billing_period
```

sesuai model.

Concurrent invoice generation harus dilindungi.

---

# 45. PAYMENT

Payment merepresentasikan pembayaran terhadap billing obligation.

Minimum:

```text
payment_id
tenant_id
invoice_id
provider
provider_reference
amount_minor
currency
status
created_at
completed_at
```

---

# 46. PAYMENT STATUS

Minimum:

```text
PENDING
PROCESSING
SUCCEEDED
FAILED
CANCELED
REFUNDED
PARTIALLY_REFUNDED
```

---

# 47. PAYMENT ATTEMPT

Satu invoice dapat memiliki banyak payment attempts.

Jangan mengasumsikan:

```text
one invoice = one payment
```

---

# 48. PAYMENT IDEMPOTENCY

Payment mutation wajib menggunakan idempotency key.

Double-click, timeout retry, network retry, dan duplicate request tidak boleh menghasilkan double charge.

---

# 49. PAYMENT METHOD

Payment method menyimpan provider reference, bukan raw sensitive credential.

Contoh:

```text
provider
provider_customer_id
provider_payment_method_id
display_brand
display_last4
```

jika aman dan diperlukan.

---

# 50. PAYMENT PROVIDER

Provider diperlakukan sebagai external dependency.

Provider dapat berupa:

```text
Payment Gateway
Bank Transfer
Virtual Account
E-Wallet
Card Processor
```

Actual provider mengikuti deployment/business decision.

---

# 51. WEBHOOK

Payment webhook flow:

```text
Receive
↓
Verify signature
↓
Validate payload
↓
Check event idempotency
↓
Resolve payment/invoice
↓
Update internal state
↓
Record event
↓
Emit internal event
```

---

# 52. WEBHOOK SECURITY

Wajib:

- signature verification;
- replay protection jika provider mendukung;
- payload validation;
- event idempotency;
- audit logging.

Invalid webhook harus ditolak.

---

# 53. WEBHOOK STORAGE

Simpan provider event identifier untuk mencegah duplicate processing.

---

# 54. OUT-OF-ORDER EVENTS

System harus aman terhadap event yang datang tidak berurutan.

State transition harus memvalidasi current state sebelum update.

---

# 55. REFUND

Refund mengembalikan dana dari payment.

Minimum:

```text
refund_id
payment_id
tenant_id
amount_minor
currency
status
reason
provider_reference
```

---

# 56. REFUND LIMIT

Total successful refund tidak boleh melebihi refundable amount.

Partial refund harus didukung bila provider mendukungnya.

---

# 57. CREDIT

Credit adalah nilai yang dapat mengurangi future billing obligation.

Credit harus memiliki immutable ledger.

---

# 58. ADJUSTMENT

Manual adjustment wajib memiliki:

```text
amount
currency
reason
actor
reference
created_at
```

High-value adjustment dapat memerlukan approval.

---

# 59. COUPON / DISCOUNT

Discount dapat berupa:

```text
Percentage
Fixed amount
Coupon
Promotion
Contract discount
```

Coupon memiliki:

```text
code
discount_type
value
valid_from
valid_until
max_redemptions
tenant_limit
status
```

---

# 60. TAX

Tax dapat diterapkan pada:

```text
Subscription
Usage
One-time charge
Invoice line
```

Tax snapshot harus disimpan pada invoice.

---

# 61. BILLING NOTIFICATION

Notification minimum:

```text
Trial ending
Invoice issued
Payment successful
Payment failed
Invoice due
Invoice overdue
Quota warning
Subscription changed
Subscription canceled
Refund completed
```

---

# 62. BILLING JOBS

Scheduled jobs minimal:

```text
Trial expiration
Subscription transition
Invoice generation
Invoice due processing
Usage aggregation
Quota evaluation
Dunning retry
Reminder dispatch
Payment reconciliation
```

Semua job harus retry-safe.

---

# 63. PAYMENT RECONCILIATION

Reconciliation membandingkan internal payment dengan provider settlement.

Minimum:

```text
provider_reference
invoice_id
payment_id
amount
currency
provider_status
internal_status
settlement_date
```

---

# 64. RECONCILIATION STATUS

```text
MATCHED
MISSING_INTERNAL
MISSING_PROVIDER
AMOUNT_MISMATCH
STATUS_MISMATCH
DUPLICATE
```

Mismatch harus menghasilkan alert.

---

# 65. LEDGER

Jika financial ledger digunakan, gunakan append-only entries.

Minimum:

```text
entry_id
tenant_id
account
direction
amount_minor
currency
reference_type
reference_id
created_at
```

Balance harus dapat direkonsiliasi dari ledger.

---

# 66. AUDIT

Audit wajib untuk:

```text
Plan change
Price change
Subscription change
Invoice void
Payment
Refund
Credit
Adjustment
Coupon redemption
Quota override
Entitlement override
Manual state correction
Webhook replay
```

Audit minimal:

```text
event_id
tenant_id
actor_id
actor_type
action
resource_type
resource_id
before
after
reason
created_at
```

Sensitive values harus direduksi.

---

# 67. BILLING ADMIN

Tenant billing admin dapat:

- melihat plan;
- melihat subscription;
- melihat usage;
- melihat quota;
- melihat invoice;
- melihat payment;
- mengelola payment method;
- meminta cancellation;
- mengunduh billing documents.

Semua melalui permission model.

---

# 68. PLATFORM BILLING ADMIN

Platform billing admin dapat melakukan controlled operations:

- assign plan;
- correct subscription;
- issue credit;
- issue refund;
- create adjustment;
- void invoice;
- override quota;
- reconcile payment;
- replay webhook.

High-risk operation wajib audited.

---

# 69. SEGREGATION OF DUTIES

Untuk financial action tertentu:

```text
Create adjustment
Approve adjustment
```

dapat dipisahkan ke dua actor.

Threshold ditentukan business policy.

---

# 70. API

Minimum API surface:

```text
GET  /billing/plans
GET  /billing/subscription
POST /billing/subscription/change
POST /billing/subscription/cancel
GET  /billing/usage
GET  /billing/invoices
GET  /billing/invoices/{id}
GET  /billing/payments
POST /billing/payment
GET  /billing/payment-methods
POST /billing/payment-methods
POST /billing/webhooks/{provider}
```

Endpoint final mengikuti API versioning standard pada Document 10.

---

# 71. API AUTHORIZATION

Billing endpoint wajib memiliki dedicated permissions.

Contoh:

```text
billing.view
billing.manage_subscription
billing.manage_payment_method
billing.view_invoice
billing.view_payment
billing.manage_adjustment
billing.refund
billing.admin
```

---

# 72. API ERROR MODEL

Error minimum:

```text
INVALID_REQUEST
UNAUTHORIZED
FORBIDDEN
NOT_ENTITLED
QUOTA_EXCEEDED
PAYMENT_FAILED
PROVIDER_UNAVAILABLE
CONFLICT
ALREADY_PROCESSED
INVALID_STATE
```

---

# 73. API PAGINATION

Invoice, payment, usage, dan billing event list wajib mendukung pagination.

---

# 74. API MONEY RESPONSE

API monetary response harus selalu membawa currency.

Recommended object:

```json
{
  "amount_minor": 1000000,
  "currency": "IDR"
}
```

---

# 75. SECURITY

Billing wajib menerapkan:

```text
Authentication
Authorization
Tenant isolation
Idempotency
Rate limiting
Audit
Secret management
Webhook verification
PII protection
Log redaction
```

---

# 76. RATE LIMITING

Financial mutation endpoint memiliki stricter rate limit dibanding read-only endpoint.

---

# 77. LOG REDACTION

Jangan log:

```text
Full card number
CVV
Payment secret
Provider secret
Authentication secret
Raw payment credentials
```

---

# 78. DATA RETENTION

Retention policy harus ditentukan untuk:

```text
Invoice
Payment
Refund
Usage
Audit
Webhook event
Reconciliation
```

Legal/accounting retention dapat mengalahkan application deletion.

---

# 79. TENANT DELETION

Tenant deletion tidak boleh menghapus financial records yang wajib dipertahankan karena accounting/legal requirement.

---

# 80. BACKUP

Billing database wajib masuk backup policy.

Backup harus mempertahankan:

```text
Invoice identity
Payment reference
Subscription history
Usage history
Audit history
Reconciliation data
```

---

# 81. DISASTER RECOVERY

Billing restore harus diuji berkala.

RPO/RTO mengikuti Document 16 dan criticality tier billing.

---

# 82. FAILURE POLICY

Setiap dependency harus memiliki behavior:

```text
Payment provider unavailable
Billing database unavailable
Usage service unavailable
Entitlement service unavailable
Notification service unavailable
```

Tidak boleh ada ambiguous behavior.

---

# 83. ENTITLEMENT FAILURE

Setiap feature harus menentukan:

```text
Fail closed
Fail open temporarily
Use cached decision
```

Cached decision memiliki maximum stale window.

---

# 84. PROVIDER OUTAGE

Jika payment provider unavailable:

- jangan langsung menandai payment failed;
- preserve pending state jika appropriate;
- retry;
- reconcile setelah provider pulih.

---

# 85. BILLING OUTAGE

Core transactional data tidak boleh corrupt akibat billing subsystem failure.

---

# 86. REPORTING

Tenant dashboard minimum:

```text
Current plan
Subscription status
Current period
Next billing date
Current usage
Quota
Invoices
Payment status
```

Platform reporting dapat mencakup:

```text
MRR
ARR
Active subscriptions
Trials
Churn
Past due
Payment success rate
Refunds
Revenue by plan
Usage
```

Semua KPI harus memiliki documented formula.

---

# 87. BILLING EXPORT

Supported export dapat berupa:

```text
CSV
XLSX
PDF
JSON
```

Export wajib:

- tenant-scoped;
- permission-controlled;
- audited;
- protected dari enumeration;
- memiliki expiration bila menggunakan temporary download URL.

---

# 88. OBSERVABILITY

Metrics minimum:

```text
billing_invoice_generation_total
billing_payment_attempt_total
billing_payment_success_total
billing_payment_failure_total
billing_webhook_total
billing_webhook_failure_total
billing_refund_total
billing_reconciliation_mismatch_total
billing_usage_events_total
billing_quota_exceeded_total
billing_job_failure_total
```

---

# 89. ALERTS

Alert minimum:

```text
Payment failure spike
Provider outage
Webhook failure spike
Duplicate payment
Invoice generation failure
Reconciliation mismatch
Billing job failure
Quota service failure
Subscription state inconsistency
Cross-tenant access attempt
```

---

# 90. TESTING

Test coverage wajib mencakup:

```text
Plan
Pricing
Subscription lifecycle
Trial
Upgrade
Downgrade
Proration
Cancellation
Invoice
Payment
Webhook
Refund
Credit
Adjustment
Coupon
Usage
Quota
Dunning
Reconciliation
Authorization
Tenant isolation
Concurrency
Failure recovery
```

---

# 91. CONCURRENCY TEST

Wajib menguji:

```text
Concurrent payment
Concurrent invoice generation
Concurrent quota consumption
Concurrent subscription changes
Duplicate webhook processing
```

---

# 92. CROSS-TENANT TEST

Automated test wajib membuktikan:

```text
Tenant A cannot read Tenant B invoice.
Tenant A cannot read Tenant B payment.
Tenant A cannot modify Tenant B subscription.
Tenant A cannot consume Tenant B quota.
Tenant A cannot download Tenant B billing export.
```

---

# 93. CRITICAL INVARIANTS

System wajib menjaga:

```text
1. Every financial record has one tenant owner.
2. Finalized invoice cannot be silently mutated.
3. Historical invoice uses historical price snapshot.
4. Payment is idempotent.
5. Webhook processing is idempotent.
6. Refund cannot exceed refundable payment.
7. Quota cannot be bypassed through concurrency.
8. Subscription transitions are valid.
9. Tenant cannot access another tenant's billing data.
10. Manual financial changes are audited.
11. Amount and currency are always paired.
12. Reconciliation can detect financial mismatch.
```

---

# 94. DEFINITION OF DONE

Billing feature dianggap selesai jika:

```text
[ ] Business rules defined
[ ] Database model defined
[ ] API defined
[ ] Authorization defined
[ ] Tenant isolation implemented
[ ] Idempotency implemented
[ ] Audit implemented
[ ] Notification behavior defined
[ ] Error handling implemented
[ ] Unit tests passed
[ ] Integration tests passed
[ ] Security tests passed
[ ] Concurrency tests passed
[ ] Monitoring implemented
[ ] Alert implemented
[ ] Rollback strategy defined
[ ] Documentation updated
```

---

# 95. REFERENCE ARCHITECTURE

```text
                    ┌─────────────────────┐
                    │      Frontend       │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │     Billing API     │
                    └──────────┬──────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
 ┌────────▼────────┐  ┌────────▼────────┐  ┌────────▼────────┐
 │ Subscription    │  │ Entitlement     │  │ Usage / Quota   │
 │ Service         │  │ Service         │  │ Service         │
 └────────┬────────┘  └────────┬────────┘  └────────┬────────┘
          │                    │                    │
          └────────────────────┼────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   Billing Domain    │
                    │ Invoice / Payment   │
                    │ Credit / Refund     │
                    └──────────┬──────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
 ┌────────▼────────┐  ┌────────▼────────┐  ┌────────▼────────┐
 │ Payment Gateway │  │ Notification    │  │ Reporting       │
 └─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

# 96. SOURCE OF TRUTH

| Domain | Source of Truth |
|---|---|
| Plan catalog | Billing database |
| Subscription | Billing database |
| Invoice | Billing database |
| Internal payment state | Billing database |
| Provider transaction | Payment provider + internal reference |
| Usage | Usage subsystem + authoritative business events |
| Entitlement | Entitlement service |
| Notification delivery | Notification subsystem |
| Audit | Audit subsystem |
| Settlement | Provider reconciliation records |

---

# 97. IMPLEMENTATION PRIORITY

### P0 — Financial Core

```text
Plan
Subscription
Invoice
Payment
Webhook
Idempotency
Tenant isolation
Audit
```

### P1 — Revenue Operations

```text
Usage
Quota
Proration
Refund
Credit
Dunning
Reconciliation
```

### P2 — Commercial Optimization

```text
Coupon
Promotion
Advanced pricing
Advanced analytics
Advanced billing exports
```

---

# 98. FINAL STATUS

**Status:** FINAL  
**Priority:** HIGH / FINANCIAL-CRITICAL  
**Dependencies:** Documents 03, 04, 10, 11, 13, 14, 15, 16, 17, 19, 20, 21, 26  
**Next logical document:** `28_ADMIN_BACKOFFICE_AND_PLATFORM_OPERATIONS_SPECIFICATION.md`

