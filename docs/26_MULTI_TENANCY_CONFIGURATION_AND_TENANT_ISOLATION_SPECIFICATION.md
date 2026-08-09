# BATAM TRAVELLING ERP
# MULTI-TENANCY CONFIGURATION AND TENANT ISOLATION SPECIFICATION

**File Name:** `26_MULTI_TENANCY_CONFIGURATION_AND_TENANT_ISOLATION_SPECIFICATION.md`  
**Document Number:** 26  
**Version:** 1.0  
**Status:** PRODUCTION BASELINE  
**Project:** Batam Travelling ERP  
**Last Updated:** 2026-08-08

---

# 1. PURPOSE

Dokumen ini mendefinisikan arsitektur multi-tenancy, isolasi data, konfigurasi tenant, serta mekanisme keamanan dan skalabilitas antar tenant dalam sistem Batam Travelling ERP.

Tujuan utama:

```text
Isolation
Security
Scalability
Configurability
Performance fairness
Operational control
Tenant independence
```

---

# 2. MULTI-TENANCY MODEL

Sistem menggunakan model:

```text
Logical Multi-Tenancy
Shared Infrastructure
Isolated Data
```

Artinya:

```text
Satu aplikasi
Satu cluster
Satu database (logical separation)
Multi tenant via tenant_id isolation
```

---

# 3. TENANT DEFINITION

Tenant adalah entitas bisnis independen seperti:

```text
Travel agency
Branch operator
Corporate client
Reseller partner
Franchise unit
```

---

# 4. TENANT ISOLATION PRINCIPLE

Semua data harus terisolasi berdasarkan:

```text
tenant_id
```

`tenant_id` mandatory untuk tenant-owned data.

Tidak boleh ada query tanpa tenant scope kecuali explicit privileged cross-tenant context.

---

# 5. ISOLATION LEVELS

## 5.1 Data Isolation

Row-level isolation via `tenant_id`.

## 5.2 Query Isolation

Semua tenant query wajib memiliki tenant scope.

## 5.3 Service Isolation

Service layer wajib enforce tenant context.

## 5.4 Cache Isolation

Cache key wajib mengandung tenant scope.

## 5.5 File Isolation

Storage namespace wajib dipisahkan per tenant.

---

# 6. TENANT CONTEXT

Setiap authenticated request wajib memiliki context:

```text
tenant_id
user_id
role
permissions
```

---

# 7. TENANT RESOLUTION

Tenant dapat ditentukan melalui:

```text
Subdomain
JWT claim
API key mapping
Trusted internal header
```

Resolution tidak boleh mempercayai arbitrary client-supplied tenant identifier tanpa authorization validation.

---

# 8. TENANT SCHEMA RULE

Semua tabel tenant-owned business data wajib memiliki:

```text
tenant_id UUID NOT NULL
```

Index minimum:

```text
INDEX (tenant_id)
```

Composite index digunakan sesuai query pattern:

```text
(tenant_id, created_at)
(tenant_id, status)
```

---

# 9. GLOBAL VS TENANT DATA

Global data dapat mencakup:

```text
System config
Master currency
Global role templates
Platform settings
```

Tenant data mencakup:

```text
Users
Bookings
Orders
Payments
Articles
Products
Reports
```

---

# 10. SUPER ADMIN MODEL

Super-admin dapat memiliki controlled cross-tenant access untuk:

```text
Tenant management
Platform operations
Cross-tenant analytics
System configuration
Support/recovery
```

Semua sensitive cross-tenant mutation wajib diaudit.

---

# 11. TENANT CREATION

Tenant onboarding harus mencakup:

```text
Create tenant record
Initialize default roles
Initialize default settings
Provision storage namespace
Initialize cache namespace
Initialize billing profile
```

Provisioning harus idempotent/recoverable.

---

# 12. TENANT LIFECYCLE

```text
TRIAL
ACTIVE
SUSPENDED
EXPIRED
DELETED
```

State transition harus mengikuti business rules dan audit requirements.

---

# 13. TENANT SUSPENSION

Suspension dapat:

```text
Block login
Block tenant API mutation
Block new transactions
Preserve data
Allow restricted read-only access if policy permits
```

---

# 14. TENANT DELETION

Default:

```text
Soft delete
```

Hard deletion hanya melalui controlled workflow dengan retention/legal validation.

Financial/audit records yang wajib dipertahankan tidak boleh dihapus hanya karena tenant deletion.

---

# 15. TENANT CONFIGURATION

Tenant dapat memiliki konfigurasi:

```text
Business rules
Pricing rules
Feature flags
UI branding
Notification settings
Integration settings
Locale/timezone
Operational settings
```

---

# 16. FEATURE FLAGS PER TENANT

Feature dapat diaktifkan per tenant, misalnya:

```text
booking_module = true
payment_gateway = false
analytics = true
```

Feature flag bukan authorization mechanism.

---

# 17. TENANT BRANDING

Support dapat mencakup:

```text
Logo
Primary color
Secondary color
Email branding
Invoice branding
Public-site branding
```

Branding tetap harus mengikuti accessibility/security constraints.

---

# 18. TENANT PRICING MODEL

Tenant dapat memiliki:

```text
Commission rate
Markup rules
Discount rules
Service fee
Subscription plan
```

Pricing configuration harus versioned/audited bila memengaruhi financial calculation.

---

# 19. TENANT LIMITS

Contoh:

```text
Max users
Max bookings/day
Max API calls
Max storage
Max reports
Max integrations
```

---

# 20. TENANT QUOTAS

Quota dapat menggunakan:

```text
Soft limit
Hard limit
```

Soft limit menghasilkan warning; hard limit dapat memblokir operation sesuai policy.

---

# 21. TENANT RATE LIMIT

Rate limit dapat ditetapkan berdasarkan tenant:

```text
requests/minute
requests/hour
requests/day
```

Critical transaction dapat memiliki policy berbeda.

---

# 22. TENANT DATA SCOPE ENFORCEMENT

Enforcement harus terjadi pada multiple layers:

```text
Authentication/context
Authorization
Service layer
Repository/query layer
Database safeguards where supported
```

Defense-in-depth preferred.

---

# 23. QUERY GUARD

Tenant-owned query tanpa valid tenant context harus fail closed.

---

# 24. ORM ENFORCEMENT

ORM/query abstraction sebaiknya menyediakan tenant-aware query helpers/global scopes jika aman.

Raw query tetap wajib melalui explicit tenant validation.

---

# 25. RAW QUERY RULE

Raw SQL terhadap tenant-owned table wajib menyertakan tenant scope atau explicit privileged cross-tenant execution context.

---

# 26. CACHE TENANT ISOLATION

Recommended cache key:

```text
tenant:{tenant_id}:{resource}:{id}
```

Tidak boleh menggunakan key yang memungkinkan collision antar tenant.

---

# 27. FILE STORAGE ISOLATION

Logical path:

```text
/tenant/{tenant_id}/files/...
```

Actual storage implementation mengikuti Document 21.

---

# 28. CDN ISOLATION

Private tenant assets tidak boleh menjadi publicly cacheable tanpa explicit publication rule.

Signed/private URLs harus tenant-authorized.

---

# 29. SEARCH ISOLATION

Search index wajib menyimpan tenant scope untuk tenant-owned records.

Search query harus menerapkan tenant visibility filter sebelum result ditampilkan.

---

# 30. ANALYTICS ISOLATION

Tenant analytics default:

```text
Tenant-scoped
```

Cross-tenant analytics hanya untuk privileged platform context.

---

# 31. REPORTING ISOLATION

Report/export default tenant-scoped dan permission-controlled.

---

# 32. CROSS-TENANT ACCESS RULE

Cross-tenant access hanya diperbolehkan untuk:

```text
Authorized platform administration
Approved support/recovery
System maintenance jobs
Cross-tenant platform analytics
```

dengan least privilege.

---

# 33. AUDIT REQUIREMENT

Sensitive cross-tenant access harus mencatat:

```text
actor
reason
timestamp
source tenant/context
affected tenant
action
result
```

---

# 34. TENANT-AWARE AUDIT LOG

Audit log wajib menyimpan tenant context jika applicable:

```text
tenant_id
user_id
action
resource
timestamp
source
```

---

# 35. TENANT-AWARE NOTIFICATION

Notification recipient/query harus tenant-scoped.

Tenant A tidak boleh menerima data/event tenant B.

---

# 36. TENANT-AWARE INTEGRATION

External integration dapat memiliki:

```text
tenant-specific credentials
tenant-specific provider
tenant-specific endpoints
tenant-specific webhook configuration
```

Secrets harus mengikuti Document 11/24.

---

# 37. TENANT DATABASE STRATEGY

Baseline:

```text
Single database
Shared schema
Tenant isolation via tenant_id
```

Architecture harus memungkinkan evolusi jika scale/contract membutuhkan stronger physical isolation.

---

# 38. OPTIONAL SCALING MODEL

Future options dapat mencakup:

```text
Tenant-group sharding
Dedicated database for enterprise tenant
Regional data placement
Read replicas
```

Tidak menjadi requirement awal kecuali business scale membutuhkannya.

---

# 39. TENANT PERFORMANCE ISOLATION

Satu tenant tidak boleh secara tidak terkendali menghabiskan shared resources dan merusak latency tenant lain.

---

# 40. NOISY NEIGHBOR PROTECTION

Mitigasi:

```text
Rate limiting per tenant
Queue fairness
Worker concurrency limits
Query throttling
Quota
Resource monitoring
```

---

# 41. TENANT QUEUE ISOLATION

Queue dapat menggunakan tenant-aware routing/fair scheduling.

Critical workload tidak boleh starvation akibat bulk workload tenant lain.

---

# 42. TENANT WORKER ISOLATION

Shared worker pool adalah default.

Dedicated worker pool dapat digunakan untuk enterprise/high-isolation workloads jika justified.

---

# 43. TENANT CONFIG CACHE

Tenant configuration dapat di-cache untuk low-latency access.

---

# 44. TENANT CONFIG INVALIDATION

Config mutation harus melakukan cache invalidation/version update sehingga stale policy tidak bertahan tanpa batas.

---

# 45. TENANT MIGRATION

Schema/data migration harus:

```text
Tenant-safe
Backward compatible where possible
Observable
Resumable for large backfills
Low-downtime
```

---

# 46. TENANT BACKUP

Backup strategy harus mempertahankan tenant data boundaries dan mendukung logical tenant recovery sejauh feasible.

---

# 47. TENANT RESTORE

Restore dapat membutuhkan:

```text
Full tenant restore
Selective data recovery
Point-in-time recovery
```

Restore tidak boleh overwrite tenant lain.

---

# 48. TENANT OBSERVABILITY

Metrics dapat ditag berdasarkan tenant jika cardinality/cost aman:

```text
request rate
error rate
latency
quota usage
resource usage
```

High-cardinality telemetry harus dikontrol.

---

# 49. TENANT HEALTH

Platform dapat menghitung tenant operational health untuk support/operations tanpa menjadikannya security decision.

---

# 50. TENANT BILLING INTEGRATION

Billing dapat berbasis:

```text
Subscription
Usage
Hybrid
```

Detail mengikuti Document 27.

---

# 51. USAGE TRACKING

Usage dapat meliputi:

```text
API calls
Storage usage
Transactions
Jobs
Users
Feature consumption
```

Usage records untuk billing harus auditable.

---

# 52. TENANT LIMIT ENFORCEMENT FLOW

```text
Request
↓
Resolve authenticated tenant
↓
Authorize
↓
Check quota/limit
↓
Allow / Reject / Throttle
↓
Audit/metric where required
```

---

# 53. TENANT SECURITY MODEL

Tenant boundary adalah security boundary.

Cross-tenant data exposure adalah security incident.

---

# 54. TENANT DATA LEAK PREVENTION

Wajib:

```text
Strict tenant filtering
Authorization
Automated isolation tests
Secure cache keys
Tenant-aware search
Tenant-aware storage
Audit
```

---

# 55. TENANT TESTING REQUIREMENT

Test minimum:

```text
Tenant isolation
Cross-tenant authorization
Cache isolation
Search isolation
File isolation
Reporting isolation
API isolation
Queue behavior
Quota behavior
Concurrency
```

---

# 56. TENANT DEBUGGING

Debug/support tooling harus restricted, time-bounded where appropriate, dan audited.

Debug output tidak boleh membocorkan tenant lain.

---

# 57. TENANT FEATURE ROLLOUT

Feature rollout dapat:

```text
Per tenant
Tenant cohort
Plan/tier
Percentage rollout
Global
```

---

# 58. TENANT EXPERIMENTATION

Experiment/A-B testing dapat tenant-aware tetapi tidak boleh melanggar authorization, privacy, atau contractual isolation.

---

# 59. TENANT DATA MIGRATION STRATEGY

Large migration dapat menggunakan:

```text
Expand schema
Deploy compatible code
Backfill
Validate
Switch reads/writes
Cleanup
```

Dual-write hanya digunakan bila benar-benar dibutuhkan dan harus idempotent/observable.

---

# 60. TENANT IDENTIFIER

Internal tenant ID harus immutable.

Slug/domain dapat berubah tanpa mengganti canonical tenant identity.

---

# 61. TENANT DOMAIN

Custom/subdomain mapping harus unique dan verified sebelum activation.

---

# 62. TENANT TIMEZONE

Tenant memiliki default timezone untuk business display/scheduling.

Database timestamps tetap mengikuti canonical time strategy dari database specification.

---

# 63. TENANT LOCALE

Tenant dapat memiliki default locale tetapi user dapat memiliki locale preference sendiri jika product mendukung.

---

# 64. TENANT CURRENCY

Tenant dapat memiliki operating/default currency.

Financial transaction tetap harus menyimpan explicit currency per amount.

---

# 65. TENANT STATUS ENFORCEMENT

Tenant status harus diperiksa pada authentication/request boundary.

Suspended/expired tenant tidak boleh memperoleh full active privileges melalui stale token.

---

# 66. TOKEN TENANT CLAIM

JWT/session tenant claim harus divalidasi terhadap current user membership dan tenant status.

Claim tidak boleh menjadi satu-satunya source of authorization.

---

# 67. USER MULTI-TENANT MEMBERSHIP

Jika user dapat menjadi anggota beberapa tenant, membership harus explicit.

Example:

```text
user_id
tenant_id
role_id
status
```

---

# 68. TENANT SWITCHING

Tenant switching harus:

```text
Verify membership
Issue/update tenant context
Refresh permissions
Invalidate unsafe cached state
Audit if required
```

---

# 69. CROSS-TENANT UI SAFETY

UI harus menampilkan active tenant context secara jelas pada workflows yang berisiko.

---

# 70. SUPER-ADMIN IMPERSONATION

Jika support impersonation tersedia:

```text
Explicit activation
Visible banner
Reason required
Time limit
Audit
Easy exit
```

Sensitive actions dapat membutuhkan re-auth/approval.

---

# 71. TENANT ADMIN

Tenant admin hanya dapat mengelola resource tenant sendiri.

Tenant admin bukan platform super-admin.

---

# 72. ROLE/PERMISSION SCOPE

Role dapat:

```text
Platform scoped
Tenant scoped
```

Tenant role tidak boleh memberikan platform-level permission.

---

# 73. TENANT API KEY

API key tenant harus bound ke:

```text
tenant_id
permissions/scopes
status
expiry if applicable
```

---

# 74. TENANT WEBHOOK

Outbound webhook harus mengambil events hanya dari owning tenant.

Webhook payload tidak boleh berisi cross-tenant data.

---

# 75. TENANT SECRET ISOLATION

Secrets harus namespaced/scoped per tenant dan tidak boleh dapat dibaca tenant lain.

---

# 76. TENANT EXPORT

Export harus:

```text
Tenant-scoped
Permission-controlled
Audited
Expiring if temporary
Protected from enumeration
```

---

# 77. TENANT IMPORT

Import harus memaksa destination tenant dari authenticated context, bukan mempercayai tenant_id dari uploaded file.

---

# 78. TENANT BACKGROUND JOB

Job payload harus membawa immutable tenant context/reference yang diverifikasi ketika diproses.

---

# 79. SCHEDULED JOB

Tenant-scheduled jobs harus diproses menggunakan tenant timezone/configuration yang applicable.

---

# 80. TENANT EVENT

Internal tenant-owned event harus membawa:

```text
tenant_id
event_id
event_type
entity reference
timestamp
```

---

# 81. TENANT OUTBOX

Jika transactional outbox digunakan, tenant context wajib disimpan pada outbox event.

---

# 82. TENANT IDEMPOTENCY

Idempotency key harus tenant-scoped.

Tenant A dan Tenant B dapat menggunakan same client idempotency string tanpa collision.

---

# 83. TENANT UNIQUE CONSTRAINT

Business uniqueness sering harus tenant-scoped.

Contoh:

```text
UNIQUE (tenant_id, booking_number)
UNIQUE (tenant_id, slug)
```

Global uniqueness hanya jika business requirement memang global.

---

# 84. TENANT FOREIGN KEY

Tenant-owned relationship harus mencegah accidental cross-tenant references.

Jika database memungkinkan, gunakan composite/validation safeguards.

---

# 85. DATABASE ROW-LEVEL SECURITY

Database RLS dapat digunakan sebagai defense-in-depth jika sesuai platform.

RLS tidak menggantikan application authorization.

---

# 86. CROSS-TENANT JOIN

Cross-tenant join dilarang pada normal tenant request.

Platform analytics/support operation harus menggunakan explicit privileged path.

---

# 87. DATA WAREHOUSE

Jika data dikirim ke warehouse, tenant_id harus dipertahankan untuk governance, filtering, lineage, dan deletion/retention workflows.

---

# 88. TENANT SEARCH INDEX

Indexed document minimum:

```text
tenant_id
entity_id
entity_type
visibility
searchable fields
```

---

# 89. TENANT CACHE INVALIDATION

Invalidation event harus membawa tenant scope untuk mencegah invalidation collision.

---

# 90. TENANT OBJECT STORAGE

Object metadata/path harus dapat menentukan owning tenant.

Bucket-per-tenant tidak wajib untuk baseline shared architecture.

---

# 91. SIGNED URL

Signed file URL harus short-lived dan hanya diterbitkan setelah tenant authorization.

---

# 92. PUBLIC CONTENT

Tenant-owned content dapat menjadi public jika explicitly published.

Public status tidak menghilangkan ownership `tenant_id`.

---

# 93. PUBLIC ROUTING

Public tenant content dapat diroute melalui:

```text
Subdomain
Custom domain
Tenant slug/path
```

Canonical URL policy harus jelas.

---

# 94. TENANT CUSTOM DOMAIN

Custom domain onboarding harus mencakup ownership verification dan TLS provisioning.

---

# 95. TENANT EMAIL SENDER

Tenant-specific sender/domain harus diverifikasi sesuai provider requirements.

---

# 96. TENANT PAYMENT PROVIDER

Tenant dapat menggunakan shared platform payment account atau dedicated provider credentials sesuai commercial architecture.

Ownership/reconciliation rules harus explicit.

---

# 97. FINANCIAL ISOLATION

Payment, invoice, refund, ledger/reconciliation records wajib tenant-scoped dan tidak boleh bercampur antar tenant.

---

# 98. TENANT NUMBER SEQUENCES

Invoice/booking numbering dapat tenant-scoped.

Sequence strategy harus concurrency-safe.

---

# 99. TENANT REPORT AGGREGATION

Tenant report tidak boleh menggunakan global aggregate yang belum difilter dengan aman.

---

# 100. PLATFORM ANALYTICS

Platform operator dapat memiliki cross-tenant aggregate views dengan permission terpisah.

---

# 101. PII ISOLATION

Tenant isolation tidak menggantikan PII controls.

PII tetap mengikuti classification, encryption, masking, retention, dan access policy.

---

# 102. AUDIT IMMUTABILITY

Tenant tidak boleh dapat mengubah audit history untuk menghilangkan evidence.

---

# 103. TENANT AUDIT VIEW

Tenant admin dapat melihat tenant audit events sesuai permission tanpa melihat platform-internal sensitive events atau tenant lain.

---

# 104. SUPPORT ACCESS

Support access harus least privilege.

Sensitive tenant access dapat membutuhkan explicit reason/ticket reference.

---

# 105. BREAK-GLASS

Emergency cross-tenant access jika digunakan harus:

```text
Restricted
Time-limited
Strongly authenticated
Audited
Alerted
Reviewed
```

---

# 106. TENANT QUOTA COUNTERS

Quota counters harus atomic/consistent sesuai business impact.

Approximate counters hanya digunakan untuk non-financial soft limits.

---

# 107. STORAGE QUOTA

Storage quota harus menghitung tenant-owned persistent objects sesuai documented formula.

---

# 108. API QUOTA

API quota harus membedakan legitimate retries/internal calls jika diperlukan.

---

# 109. USER QUOTA

User seat limit harus memperjelas apakah menghitung:

```text
Active users
Invited users
Suspended users
Service accounts
```

sesuai billing policy.

---

# 110. TENANT BILLING STATE

Billing/subscription state dapat memengaruhi entitlement tetapi tidak boleh menghapus tenant data secara otomatis.

---

# 111. ENTITLEMENT

Feature access harus berasal dari normalized entitlement decision:

```text
Tenant
+ Plan
+ Feature flag
+ Permission
+ Business status
→ Access decision
```

---

# 112. FEATURE FLAG VS ENTITLEMENT

Feature flag = rollout/configuration.

Entitlement = commercial access.

Permission = user authorization.

Ketiganya tidak boleh disamakan.

---

# 113. TENANT CONFIG PRECEDENCE

Recommended:

```text
Platform safe default
↓
Plan/tenant configuration
↓
Allowed tenant override
↓
Allowed user preference
```

Security policy tidak boleh dioverride tenant.

---

# 114. CONFIG SCHEMA

Tenant config harus typed/schema-validated.

Arbitrary unvalidated JSON tidak boleh menjadi default configuration architecture.

---

# 115. CONFIG VERSIONING

Material config changes harus memiliki version/revision.

---

# 116. CONFIG AUDIT

Perubahan sensitive config wajib mencatat actor, before/after, timestamp, dan reason bila diperlukan.

---

# 117. CONFIG SECRET

Secret tidak boleh disimpan di general tenant configuration payload.

Gunakan secret management.

---

# 118. CONFIG FALLBACK

Invalid tenant config harus fail ke safe platform default atau block unsafe operation.

---

# 119. TENANT ONBOARDING STATUS

Provisioning dapat menggunakan:

```text
PENDING
PROVISIONING
ACTIVE
FAILED
```

Failure harus resumable.

---

# 120. ONBOARDING CHECKLIST

```text
[ ] Tenant identity created
[ ] Owner/admin membership created
[ ] Default roles initialized
[ ] Default configuration initialized
[ ] Storage namespace provisioned
[ ] Billing/subscription initialized
[ ] Domain configured if applicable
[ ] Integration defaults configured
[ ] Audit event created
[ ] Health validation passed
```

---

# 121. TENANT OFFBOARDING

Offboarding harus mempertimbangkan:

```text
Access disable
Subscription termination
Data export
Retention
Financial records
Integration revocation
Domain removal
Secret revocation
Deletion/anonymization
```

---

# 122. TENANT MERGE

Tenant merge tidak menjadi normal operation.

Jika dibutuhkan, harus menggunakan controlled migration project karena identity, finance, audit, files, search, dan integrations dapat terdampak.

---

# 123. TENANT SPLIT

Tenant split juga merupakan controlled data migration, bukan simple configuration operation.

---

# 124. DATA RESIDENCY

Jika future contract/regulation membutuhkan data residency, architecture harus dapat berevolusi ke region/database placement per tenant group.

---

# 125. ENTERPRISE ISOLATION

Enterprise tenant dapat memperoleh stronger isolation:

```text
Dedicated database
Dedicated worker pool
Dedicated integration credentials
Dedicated storage
Dedicated infrastructure
```

jika commercial/technical requirement membutuhkannya.

---

# 126. TENANT SLO

Platform dapat menyediakan SLO tier berdasarkan plan tetapi minimum platform reliability/security tetap berlaku untuk semua tenant.

---

# 127. TENANT METRIC CARDINALITY

Jangan menambahkan tenant_id ke setiap metric secara otomatis jika menghasilkan unbounded cardinality.

Gunakan logs/traces/analytics store untuk detailed per-tenant diagnostics jika lebih tepat.

---

# 128. TENANT COST ATTRIBUTION

Platform dapat mengatribusikan:

```text
Compute
Storage
API usage
Provider usage
Queue jobs
Bandwidth
```

ke tenant untuk FinOps/billing.

---

# 129. TENANT CAPACITY

Capacity planning harus mempertimbangkan:

```text
Number of tenants
Tenant size distribution
Peak tenant
Aggregate peak
Growth
Noisy neighbor
```

---

# 130. TENANT LOAD TEST

Load testing harus mencakup:

```text
Many small tenants
One large tenant
Mixed tenant sizes
Concurrent tenant workloads
Noisy tenant
Cross-tenant isolation under load
```

---

# 131. SECURITY TEST

Wajib mencoba:

```text
Change tenant ID
Reuse object ID from another tenant
Modify JWT/header
Cache collision
Search leakage
File URL enumeration
Export leakage
Webhook misrouting
Background-job context manipulation
```

Expected result:

```text
DENY / NOT FOUND
```

tanpa data leakage.

---

# 132. AUTHORIZATION TEST

Setiap tenant-owned API harus memiliki negative cross-tenant tests.

---

# 133. DATABASE TEST

Repository integration test harus memastikan tenant filter tidak hilang pada:

```text
Read
Update
Delete
Aggregate
Join
Bulk operation
```

---

# 134. SEARCH TEST

Index/search test harus memastikan result tenant lain tidak muncul walaupun keyword sama.

---

# 135. CACHE TEST

Cache tests harus menggunakan identical resource IDs pada tenant berbeda untuk membuktikan isolation.

---

# 136. FILE TEST

Tenant A tidak boleh membuka signed/private file Tenant B.

---

# 137. EXPORT TEST

Generated export Tenant A tidak boleh dapat diakses Tenant B.

---

# 138. QUEUE TEST

Job Tenant A tidak boleh diproses dengan context Tenant B.

---

# 139. BACKUP/RESTORE TEST

Tenant restore test harus membuktikan tenant lain tidak berubah.

---

# 140. INCIDENT RESPONSE

Cross-tenant exposure dikategorikan sebagai security incident dan mengikuti Document 11/15.

---

# 141. TENANT ISOLATION ALERT

Alert dapat dibuat untuk:

```text
Cross-tenant access attempt
Tenant context missing
Suspicious super-admin access
Quota abuse
Repeated authorization failures
```

---

# 142. DATA LEAK RESPONSE

Jika suspected cross-tenant leak:

```text
Contain
Preserve evidence
Identify affected tenants/data
Revoke unsafe access
Fix
Validate
Follow incident/privacy process
```

---

# 143. ADMIN UI

Platform admin harus dapat melihat:

```text
Tenant identity
Status
Plan
Usage
Health
Domains
Integrations
Created date
Last activity
```

Sensitive data tetap permission-controlled.

---

# 144. TENANT ADMIN UI

Tenant admin dapat mengelola:

```text
Users
Roles within allowed scope
Branding
Allowed configuration
Integrations
Usage
Billing
Domains
```

sesuai permissions/plan.

---

# 145. TENANT SWITCHER

User dengan multiple memberships dapat menggunakan tenant switcher.

Active tenant harus jelas.

---

# 146. DESTRUCTIVE ACTION UX

Cross-tenant/platform destructive action harus menampilkan target tenant secara explicit dan dapat meminta confirmation/re-auth sesuai risk.

---

# 147. API ERROR

Cross-tenant unauthorized lookup sebaiknya tidak mengungkapkan apakah resource tenant lain ada.

---

# 148. TENANT NOT FOUND

Tenant resolution failure harus menghasilkan safe error dan tidak fallback ke arbitrary/default tenant untuk authenticated transaction.

---

# 149. DEFAULT TENANT

Default tenant hanya boleh digunakan dalam explicitly single-tenant/bootstrap context, bukan sebagai fallback saat tenant context hilang.

---

# 150. TENANT CONTEXT PROPAGATION

Context harus dipropagasikan ke:

```text
Service
Repository
Queue job
Event
Audit
Trace/log
External integration where needed
```

---

# 151. TRACE CONTEXT

Trace dapat membawa tenant identifier yang aman untuk operational correlation sesuai privacy/cardinality policy.

---

# 152. LOGGING

Log tenant context dapat menggunakan internal tenant ID.

Jangan log secrets atau unnecessary PII.

---

# 153. CROSS-TENANT BATCH JOB

Platform batch yang memproses banyak tenant harus:

```text
Iterate explicit tenant scope
Isolate failures
Checkpoint
Rate limit
Audit
```

---

# 154. FAIR SCHEDULING

Shared workers harus mencegah satu tenant menguasai seluruh capacity.

---

# 155. CIRCUIT BREAKER PER TENANT

Tenant-specific integration failure dapat diisolasi agar tidak membuka circuit global jika provider/account scope berbeda.

---

# 156. TENANT INTEGRATION HEALTH

Integration health dapat dihitung per tenant/account/provider.

---

# 157. TENANT WEBHOOK SIGNATURE

Jika tenant memiliki webhook secret sendiri, signature harus menggunakan secret tenant tersebut dan secret rotation harus supported.

---

# 158. TENANT DOMAIN SECURITY

Domain mapping harus mencegah tenant claim terhadap domain yang bukan miliknya.

---

# 159. CUSTOM DOMAIN REMOVAL

Saat tenant suspended/deleted, custom domain behavior harus explicit untuk mencegah stale content exposure.

---

# 160. TENANT CACHE PURGE

Tenant offboarding/deletion harus memiliki cache purge procedure.

---

# 161. TENANT SEARCH PURGE

Tenant deletion/unpublishing harus menghapus/deactivate tenant records dari search index sesuai retention/publication policy.

---

# 162. TENANT FILE RETENTION

File retention harus mengikuti tenant lifecycle, legal retention, dan Document 21.

---

# 163. TENANT DATABASE RETENTION

Retention tidak boleh hanya bergantung pada tenant status.

Financial/audit/legal records memiliki independent retention policy.

---

# 164. HARD DELETE SAFETY

Hard delete harus:

```text
Authorized
Approved if required
Audited
Backup/retention checked
Cross-service cleanup planned
Verified
```

---

# 165. ANONYMIZATION

Jika full deletion tidak memungkinkan karena legal records, personal data dapat dianonymize sesuai policy tanpa merusak required accounting/audit integrity.

---

# 166. TENANT PROVISIONING IDEMPOTENCY

Retry onboarding tidak boleh membuat duplicate tenant, owner, billing profile, storage namespace, atau integrations.

---

# 167. TENANT IDENTIFIER ENUMERATION

Public APIs tidak boleh mengandalkan sequential tenant IDs sebagai security control.

---

# 168. UUID

UUID dapat digunakan untuk tenant ID tetapi authorization tetap wajib.

---

# 169. TENANT API VERSION

Tenant-specific feature rollout tidak boleh membuat undocumented incompatible API behavior.

---

# 170. TENANT CONTRACT

Enterprise-specific behavior harus terdokumentasi sebagai configuration/entitlement, bukan hidden code fork jika dapat dihindari.

---

# 171. CODE FORK

Per-tenant source-code fork harus dihindari.

Gunakan:

```text
Configuration
Feature flags
Entitlements
Provider adapters
Extension points
```

---

# 172. TENANT EXTENSIBILITY

Tenant customization harus melalui controlled extension points.

Arbitrary tenant executable code tidak diperbolehkan secara default.

---

# 173. TEMPLATE CUSTOMIZATION

Tenant-specific email/document templates harus sandboxed/sanitized sesuai template engine security model.

---

# 174. CONTENT ISOLATION

Articles, landing pages, products, categories, media, dan SEO configuration yang tenant-owned wajib tenant-scoped.

---

# 175. PRODUCT VISIBILITY

Product visibility dapat:

```text
Private tenant
Public tenant catalog
Platform-shared catalog
```

Ownership dan visibility harus dipisahkan secara explicit.

---

# 176. SHARED MASTER DATA

Jika platform menyediakan shared catalog/master data, tenant references tidak boleh mengubah canonical global record tanpa platform permission.

---

# 177. TENANT OVERRIDE

Tenant dapat memiliki override layer untuk allowed fields tanpa duplicating global master data jika architecture mendukung.

---

# 178. CONFIGURATION DRIFT

Platform harus dapat mendeteksi invalid/deprecated tenant configuration setelah software upgrade.

---

# 179. CONFIG MIGRATION

Config schema migration harus versioned dan tenant-safe.

---

# 180. TENANT FEATURE DEPRECATION

Feature deprecation harus mempertimbangkan tenants yang masih memiliki entitlement/configuration lama.

---

# 181. PLAN CHANGE

Upgrade/downgrade plan harus menghasilkan deterministic entitlement changes.

---

# 182. DOWNGRADE SAFETY

Jika tenant menggunakan resource di atas plan baru:

```text
Warn
Grace period
Restrict new creation
Preserve existing data
```

sesuai billing policy.

---

# 183. TENANT SUSPENSION AND JOBS

Saat tenant suspended, scheduled/background jobs harus mengikuti explicit policy:

```text
Stop
Continue critical financial jobs
Continue retention/compliance jobs
```

---

# 184. TENANT EXPIRY

Expired trial tidak boleh otomatis menghapus data.

---

# 185. TENANT REACTIVATION

Reactivation harus memulihkan allowed access tanpa kehilangan configuration/history yang masih retained.

---

# 186. TENANT OWNERSHIP TRANSFER

Tenant owner transfer harus:

```text
Strongly authorized
Validated
Audited
Notify affected parties
```

---

# 187. TENANT ADMIN RECOVERY

Account recovery tenant admin tidak boleh memberikan cross-tenant privilege.

---

# 188. TENANT INVITATION

Invitation harus bound ke tenant dan intended role.

Invitation token tidak boleh dapat dipakai untuk tenant lain.

---

# 189. INVITATION EXPIRY

Invitation harus expiring/revocable.

---

# 190. TENANT USER REMOVAL

Removing user from tenant hanya menghapus membership/access, bukan user identity global jika user masih memiliki tenant lain.

---

# 191. SERVICE ACCOUNT

Service accounts harus tenant-scoped kecuali explicit platform service account.

---

# 192. PLATFORM SERVICE ACCOUNT

Cross-tenant service account harus least privilege dan auditable.

---

# 193. DATABASE MAINTENANCE

Cross-tenant maintenance scripts harus memiliki dry-run/scope safeguards.

---

# 194. SCRIPT SAFETY

Script yang memodifikasi tenant data harus memerlukan explicit tenant selector atau explicit approved all-tenant mode.

---

# 195. ALL-TENANT OPERATION

All-tenant operation harus difficult to trigger accidentally.

---

# 196. TENANT IMPORT/EXPORT FORMAT

Portable tenant data export harus mempertahankan ownership references tetapi tidak mengekspos internal secrets.

---

# 197. MIGRATION BETWEEN ENVIRONMENTS

Tenant production data tidak boleh dipindahkan ke development tanpa approved masking/anonymization process.

---

# 198. TEST TENANT

Testing/staging harus menggunakan synthetic/test tenant data bila memungkinkan.

---

# 199. DEMO TENANT

Demo tenant harus terisolasi dari production customer data.

---

# 200. TENANT SECURITY ACCEPTANCE

Implementation dianggap secure apabila automated tests membuktikan:

```text
No cross-tenant read
No cross-tenant write
No cross-tenant delete
No cache leakage
No file leakage
No search leakage
No report/export leakage
No background-job context leakage
```

---

# 201. PERFORMANCE ACCEPTANCE

Tenant architecture dianggap scalable apabila noisy-neighbor test tidak menyebabkan unacceptable degradation tenant lain dan quota/rate limiting/fair scheduling bekerja.

---

# 202. OPERATIONS ACCEPTANCE

Operator harus dapat:

```text
Create tenant
Suspend tenant
Reactivate tenant
Inspect health
Inspect usage
Manage approved configuration
Troubleshoot integrations
Perform controlled support access
Offboard tenant
```

dengan audit.

---

# 203. FINAL TENANT ARCHITECTURE

```text
                         ┌─────────────────────┐
                         │   PLATFORM LAYER    │
                         │ Super Admin / Ops   │
                         └──────────┬──────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
               ┌─────────┐     ┌─────────┐     ┌─────────┐
               │Tenant A │     │Tenant B │     │Tenant C │
               └────┬────┘     └────┬────┘     └────┬────┘
                    │               │               │
               Users/Data      Users/Data      Users/Data
                    │               │               │
                    └───────────────┼───────────────┘
                                    ▼
                         ┌─────────────────────┐
                         │ SHARED APPLICATION  │
                         ├─────────────────────┤
                         │ Tenant Context      │
                         │ Authorization       │
                         │ Services            │
                         │ Query Guard         │
                         └──────────┬──────────┘
                                    ▼
                         ┌─────────────────────┐
                         │ SHARED DATA LAYER   │
                         │ tenant_id isolation │
                         └─────────────────────┘
```

---

# 204. FINAL PRINCIPLES

```text
1. Tenant boundary is a security boundary.
2. Every tenant-owned resource has canonical tenant ownership.
3. Never trust client tenant identifiers without authorization.
4. Normal requests never execute cross-tenant queries.
5. Cross-tenant access is explicit, privileged, and audited.
6. Cache, files, search, queues, exports, and integrations are tenant-aware.
7. Feature flags, entitlements, and permissions are separate concepts.
8. Tenant configuration cannot weaken platform security policy.
9. Financial and audit retention survive tenant lifecycle when required.
10. Noisy-neighbor protection is mandatory for shared infrastructure.
11. Tenant isolation must be tested automatically.
12. Tenant context must propagate across asynchronous boundaries.
13. Tenant-specific code forks should be avoided.
14. Provisioning and recovery operations must be idempotent.
15. Cross-tenant data exposure is treated as a security incident.
```

---

# 205. DOCUMENT DEPENDENCIES

```text
03_BUSINESS_RULES_AND_POLICY.md
04_PRD_SYSTEM_REQUIREMENTS.md
10_API_AND_INTEGRATION_SPECIFICATION.md
11_SECURITY_AUTHENTICATION_AND_AUDIT_SPECIFICATION.md
13_DEPLOYMENT_DEVOPS_INFRASTRUCTURE_SPECIFICATION.md
14_DATABASE_ARCHITECTURE_AND_DATA_MODEL_SPECIFICATION.md
15_OBSERVABILITY_MONITORING_AND_OPERATIONS_SPECIFICATION.md
16_BACKUP_DISASTER_RECOVERY_AND_BUSINESS_CONTINUITY_SPECIFICATION.md
17_TESTING_QUALITY_ASSURANCE_AND_RELEASE_VALIDATION_SPECIFICATION.md
19_REPORTING_ANALYTICS_AND_DASHBOARD_SPECIFICATION.md
20_NOTIFICATION_AND_COMMUNICATION_SPECIFICATION.md
21_FILE_AND_DOCUMENT_MANAGEMENT_SPECIFICATION.md
22_SEARCH_AND_DISCOVERY_SPECIFICATION.md
23_BUSINESS_WORKFLOW_AND_AUTOMATION_SPECIFICATION.md
24_INTEGRATION_EXTERNAL_SERVICES_AND_WEBHOOK_SPECIFICATION.md
25_PERFORMANCE_SCALABILITY_AND_CAPACITY_SPECIFICATION.md
```

---

# 206. NEXT DOCUMENT

```text
27_BILLING_SUBSCRIPTION_AND_USAGE_MANAGEMENT_SPECIFICATION.md
```

# END OF DOCUMENT
