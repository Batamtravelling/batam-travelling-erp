# BATAM TRAVELLING ERP
# EXTERNAL SERVICES, INTEGRATION AND WEBHOOK SPECIFICATION

**File Name:** `24_INTEGRATION_EXTERNAL_SERVICES_AND_WEBHOOK_SPECIFICATION.md`  
**Document Number:** 24  
**Version:** 1.0  
**Status:** PRODUCTION BASELINE  
**Project:** Batam Travelling ERP  
**Last Updated:** 2026-08-08

---

# 1. PURPOSE

Dokumen ini mendefinisikan arsitektur dan requirement integrasi Batam Travelling ERP dengan layanan eksternal.

Cakupan utama:

```text
External API
Payment Gateway
Email Provider
Messaging Provider
Cloud Storage
Maps / Location
Analytics
Webhook
OAuth
API Key
Signature Verification
Retry
Idempotency
Rate Limiting
Circuit Breaker
Provider Failover
Synchronization
Integration Health
External Event Processing
```

Dokumen ini melengkapi:

```text
10_API_AND_INTEGRATION_SPECIFICATION.md
20_NOTIFICATION_AND_COMMUNICATION_SPECIFICATION.md
23_BUSINESS_WORKFLOW_AND_AUTOMATION_SPECIFICATION.md
```

---

# 2. OBJECTIVES

Integration layer harus:

```text
Reliable
Secure
Observable
Auditable
Idempotent
Recoverable
Provider-independent
Replaceable
Versioned
```

---

# 3. CORE PRINCIPLE

Business module tidak boleh bergantung langsung pada implementation detail provider eksternal.

Arsitektur:

```text
Business Module
       ↓
Internal Service / Integration Interface
       ↓
Integration Layer
       ↓
Provider Adapter
       ↓
External Provider
```

---

# 4. PROVIDER ABSTRACTION

Contoh:

```text
PaymentService
    ↓
PaymentProviderAdapter
    ├── Provider A
    ├── Provider B
    └── Provider C
```

Business code tidak boleh mengakses SDK provider secara langsung.

---

# 5. INTEGRATION CATEGORIES

Minimum:

```text
PAYMENT
EMAIL
MESSAGING
STORAGE
MAPS
ANALYTICS
WEBHOOK
IDENTITY
OCR
DOCUMENT
OTHER_EXTERNAL_API
```

---

# 6. INTEGRATION REGISTRY

System harus memiliki registry provider.

Minimum:

```text
integration_id
provider_name
integration_type
status
environment
configuration_reference
health_status
created_at
updated_at
```

---

# 7. INTEGRATION STATUS

```text
ACTIVE
INACTIVE
DEGRADED
FAILED
MAINTENANCE
```

---

# 8. PROVIDER STATUS

Provider dapat memiliki status:

```text
AVAILABLE
DEGRADED
UNAVAILABLE
UNKNOWN
```

---

# 9. PROVIDER ADAPTER

Setiap provider harus diisolasi melalui adapter.

Contoh:

```text
PaymentProviderAdapter
EmailProviderAdapter
MessagingProviderAdapter
StorageProviderAdapter
MapsProviderAdapter
```

---

# 10. NO PROVIDER COUPLING

Domain model tidak boleh menyimpan provider-specific object.

---

# 11. PROVIDER RESPONSE NORMALIZATION

Provider-specific response harus dinormalisasi menjadi internal response.

Contoh:

```text
Provider:
transaction_status = "captured"

Internal:
payment_status = "PAID"
```

---

# 12. EXTERNAL IDENTIFIER

System harus menyimpan provider reference jika dibutuhkan.

Contoh:

```text
external_transaction_id
external_customer_id
external_message_id
external_file_id
```

---

# 13. INTERNAL VS EXTERNAL ID

External ID tidak menggantikan internal primary key.

---

# 14. ENVIRONMENT

Integration configuration harus membedakan:

```text
DEVELOPMENT
STAGING
PRODUCTION
```

---

# 15. TEST/SANDBOX

Provider yang mendukung sandbox harus menggunakan sandbox untuk development dan testing.

---

# 16. PRODUCTION CREDENTIAL

Production credential tidak boleh digunakan di development.

---

# 17. SECRET MANAGEMENT

Credential harus disimpan di secret management layer.

Tidak boleh:

```text
.env committed
source code
workflow definition
database plain text
logs
```

---

# 18. SECRET TYPES

Minimum:

```text
API_KEY
API_SECRET
ACCESS_TOKEN
REFRESH_TOKEN
WEBHOOK_SECRET
PRIVATE_KEY
CLIENT_SECRET
```

---

# 19. SECRET ROTATION

System harus mendukung credential rotation.

---

# 20. CREDENTIAL EXPIRATION

Credential dengan expiry harus dimonitor.

---

# 21. EXPIRING CREDENTIAL ALERT

System harus memberi alert sebelum credential expired.

---

# 22. API AUTHENTICATION

Provider dapat menggunakan:

```text
API_KEY
BEARER_TOKEN
OAUTH2
BASIC_AUTH
HMAC
SIGNED_REQUEST
MTLS
```

sesuai provider.

---

# 23. OAUTH2

Jika provider menggunakan OAuth2:

```text
Authorization
↓
Authorization Code
↓
Access Token
↓
Refresh Token
```

---

# 24. TOKEN STORAGE

Access/refresh token harus encrypted at rest.

---

# 25. TOKEN REFRESH

Integration layer harus dapat melakukan automatic token refresh jika provider mendukung.

---

# 26. TOKEN FAILURE

Jika refresh gagal:

```text
Integration
↓
DEGRADED / FAILED
↓
Alert
```

---

# 27. API KEY

API key tidak boleh tampil di:

```text
frontend
logs
error response
analytics
```

---

# 28. REQUEST SIGNING

Sensitive external requests dapat menggunakan HMAC/signature.

---

# 29. WEBHOOK SECURITY

Inbound webhook wajib:

```text
Authenticate
Verify signature
Validate timestamp
Validate event
Check replay
```

jika provider menyediakan mekanismenya.

---

# 30. WEBHOOK ENDPOINT

Logical:

```text
POST /api/webhooks/{provider}
```

Actual endpoint mengikuti API specification.

---

# 31. WEBHOOK RAW PAYLOAD

Raw webhook payload dapat disimpan untuk debugging/audit sesuai retention policy.

---

# 32. WEBHOOK SIGNATURE

Signature harus diverifikasi menggunakan provider-defined mechanism.

---

# 33. WEBHOOK TIMESTAMP

Jika provider menyediakan timestamp, system harus menolak payload yang terlalu lama di luar replay window.

---

# 34. REPLAY PROTECTION

Gunakan:

```text
event_id
provider_event_id
timestamp
signature
```

untuk mencegah replay.

---

# 35. DUPLICATE WEBHOOK

Duplicate webhook harus aman diproses ulang tanpa duplicate business action.

---

# 36. WEBHOOK ACKNOWLEDGEMENT

Endpoint webhook harus memberikan acknowledgement secepat mungkin setelah basic validation.

---

# 37. ASYNC PROCESSING

Business processing webhook sebaiknya dilakukan asynchronously.

Model:

```text
Webhook
↓
Validate
↓
Persist Event
↓
ACK
↓
Queue
↓
Process
```

---

# 38. WEBHOOK QUEUE

Webhook events dapat masuk ke durable queue.

---

# 39. WEBHOOK FAILURE

Jika processing gagal:

```text
Retry
↓
Dead Letter
↓
Manual Recovery
```

---

# 40. WEBHOOK EVENT RECORD

Minimum:

```text
webhook_event_id
provider
event_type
external_event_id
received_at
signature_status
processing_status
payload_reference
attempt_count
processed_at
```

---

# 41. WEBHOOK PROCESSING STATUS

```text
RECEIVED
VALIDATED
QUEUED
PROCESSING
PROCESSED
FAILED
IGNORED
DUPLICATE
```

---

# 42. UNKNOWN EVENT

Unknown provider event tidak boleh menyebabkan system crash.

Status:

```text
IGNORED
```

atau:

```text
UNSUPPORTED
```

dengan logging.

---

# 43. EVENT VERSION

Provider event schema harus dicatat jika tersedia.

---

# 44. EVENT MAPPING

External event harus dipetakan ke internal event.

Contoh:

```text
provider.payment.captured
        ↓
payment.received
```

---

# 45. INTERNAL EVENT

Internal event harus mengikuti event contract yang didefinisikan system.

---

# 46. PAYMENT INTEGRATION

Payment integration harus mendukung lifecycle:

```text
Create Payment
↓
Redirect / Payment Method
↓
Provider Processing
↓
Webhook
↓
Verification
↓
Internal Payment Update
```

---

# 47. PAYMENT PROVIDER

Provider harus dipilih berdasarkan business configuration.

---

# 48. PAYMENT CREATION

Payment request minimal:

```text
amount
currency
reference
customer
callback
metadata
```

---

# 49. PAYMENT REFERENCE

Internal payment reference harus unique.

---

# 50. IDEMPOTENCY PAYMENT

Payment creation wajib mendukung idempotency.

---

# 51. PAYMENT IDEMPOTENCY KEY

Gunakan stable internal reference sebagai idempotency basis jika provider mendukung.

---

# 52. PAYMENT WEBHOOK

Payment webhook tidak boleh langsung dipercaya tanpa verification.

---

# 53. PAYMENT VERIFICATION

Untuk critical payment state, system harus dapat melakukan server-to-server verification jika provider mendukung.

---

# 54. PAYMENT STATUS

Internal normalized states:

```text
PENDING
PROCESSING
PAID
FAILED
EXPIRED
CANCELLED
REFUNDED
PARTIALLY_REFUNDED
```

---

# 55. PAYMENT AMOUNT VALIDATION

Webhook/payment confirmation harus memvalidasi:

```text
amount
currency
reference
merchant/account
```

sebelum marking paid.

---

# 56. PAYMENT DOUBLE CONFIRMATION

Repeated payment success event tidak boleh membuat duplicate financial transaction.

---

# 57. PAYMENT REFUND

Refund harus menggunakan authorized business service.

---

# 58. REFUND IDEMPOTENCY

Refund operation harus idempotent.

---

# 59. PAYMENT FAILURE

Payment failure dapat memicu workflow:

```text
Payment Failed
↓
Notification
↓
Retry Opportunity
```

mengikuti Document 23.

---

# 60. PAYMENT PROVIDER OUTAGE

Jika provider unavailable:

```text
Detect
↓
Mark degraded
↓
Alert
↓
Optional failover
```

---

# 61. PAYMENT FAILOVER

Provider failover hanya jika business dan financial policy mengizinkan.

---

# 62. EMAIL INTEGRATION

Email provider diakses melalui email service abstraction.

---

# 63. EMAIL PROVIDER

System dapat mendukung primary dan secondary provider.

---

# 64. EMAIL REQUEST

Minimum:

```text
recipient
subject
template
variables
attachments
metadata
```

---

# 65. EMAIL MESSAGE ID

Provider message ID harus disimpan jika tersedia.

---

# 66. EMAIL STATUS

Normalized:

```text
QUEUED
SENT
DELIVERED
BOUNCED
FAILED
```

---

# 67. EMAIL RETRY

Transient provider failures dapat di-retry.

---

# 68. EMAIL BOUNCE

Bounce tidak boleh dianggap sebagai transient failure.

---

# 69. EMAIL SUPPRESSION

Hard bounce dapat memasukkan address ke suppression list jika provider mendukung.

---

# 70. EMAIL WEBHOOK

Provider email webhook dapat digunakan untuk:

```text
delivery
bounce
complaint
open
click
```

sesuai kebutuhan.

---

# 71. EMAIL TRACKING

Tracking hanya boleh digunakan sesuai privacy policy dan consent requirements.

---

# 72. MESSAGING INTEGRATION

Messaging provider harus diakses melalui messaging abstraction.

---

# 73. MESSAGING CHANNELS

Potential:

```text
WhatsApp
SMS
Telegram
Other supported channel
```

Provider availability mengikuti actual integration.

---

# 74. MESSAGE TEMPLATE

Transactional messaging dapat menggunakan approved templates.

---

# 75. MESSAGE STATUS

Normalized:

```text
QUEUED
SENT
DELIVERED
READ
FAILED
```

jika channel menyediakan status tersebut.

---

# 76. MESSAGE WEBHOOK

Inbound delivery/read/status event harus diverifikasi.

---

# 77. CUSTOMER OPT-IN

Marketing messaging wajib memeriksa consent.

---

# 78. OPT-OUT

System harus menghormati opt-out.

---

# 79. MESSAGE RATE LIMIT

Messaging provider rate limits harus dihormati.

---

# 80. MESSAGE RETRY

Retry tidak boleh menghasilkan duplicate customer message.

---

# 81. CLOUD STORAGE

File management menggunakan abstraction layer.

---

# 82. STORAGE PROVIDER

System dapat menggunakan:

```text
S3-compatible
Cloud object storage
Managed file storage
```

---

# 83. FILE UPLOAD

Recommended:

```text
Client
↓
Signed upload URL
↓
Storage
↓
Callback / verification
↓
File record
```

---

# 84. SIGNED URL

Signed URL harus:

```text
Short-lived
Scoped
Non-public
```

---

# 85. FILE ACCESS

File access harus melalui authorization layer.

---

# 86. PUBLIC FILE

Public file harus explicit.

Default:

```text
PRIVATE
```

---

# 87. FILE VIRUS SCAN

Jika security architecture membutuhkan, uploaded files harus melewati malware/virus scanning.

---

# 88. FILE VALIDATION

Minimum:

```text
MIME
Extension
Size
Checksum
```

---

# 89. STORAGE CHECKSUM

Checksum dapat digunakan untuk integrity verification.

---

# 90. FILE VERSIONING

Storage integration harus mendukung file versioning jika diperlukan.

---

# 91. STORAGE FAILURE

Upload failure harus menghasilkan recoverable error.

---

# 92. STORAGE RETRY

Safe upload operations dapat di-retry dengan idempotency.

---

# 93. MAPS INTEGRATION

Maps service abstraction dapat digunakan untuk:

```text
Geocoding
Reverse geocoding
Distance
Route
Place search
Coordinates
```

---

# 94. ADDRESS NORMALIZATION

External address response harus dinormalisasi ke internal location model.

---

# 95. GEOCODING

Geocoding tidak boleh dianggap 100% authoritative.

Confidence/result status harus dipertimbangkan jika provider menyediakannya.

---

# 96. LOCATION CACHE

Repeated geocoding requests dapat menggunakan cache.

---

# 97. MAPS RATE LIMIT

Maps provider quota harus dimonitor.

---

# 98. MAPS FAILURE

Business flow tidak boleh crash jika maps service hanya bersifat enrichment.

---

# 99. CRITICAL LOCATION

Jika location merupakan requirement kritis, workflow harus memiliki fallback/manual input.

---

# 100. ANALYTICS INTEGRATION

Analytics event dikirim melalui analytics abstraction.

---

# 101. ANALYTICS EVENT

Minimum:

```text
event_name
timestamp
anonymous/session identifier
properties
source
```

---

# 102. PII ANALYTICS

PII tidak boleh dikirim ke analytics provider kecuali explicitly permitted and required.

---

# 103. ANALYTICS FAILURE

Analytics failure tidak boleh menyebabkan transaction failure.

---

# 104. ANALYTICS QUEUE

Analytics dapat dikirim asynchronously.

---

# 105. ANALYTICS RETRY

Retry harus menggunakan event idempotency.

---

# 106. EXTERNAL API INTEGRATION

Generic external API harus memiliki:

```text
Base URL
Authentication
Timeout
Retry policy
Rate limit
Circuit breaker
Logging
Health check
```

---

# 107. REQUEST TIMEOUT

Semua external request harus memiliki timeout.

Tidak boleh indefinite request.

---

# 108. CONNECT TIMEOUT

Connection timeout harus terpisah jika client library mendukung.

---

# 109. READ TIMEOUT

Read timeout harus configurable.

---

# 110. RETRY POLICY

Retry hanya untuk transient errors.

Recommended:

```text
429
502
503
504
network timeout
connection reset
```

jika safe untuk operation.

---

# 111. NO RETRY

Jangan retry otomatis untuk:

```text
400
401
403
404
422
business validation
```

kecuali provider-specific behavior mengharuskan.

---

# 112. RETRY BACKOFF

Gunakan exponential backoff dengan jitter.

---

# 113. MAX RETRY

Setiap integration memiliki max retry.

---

# 114. IDEMPOTENCY

State-changing external operations harus memiliki idempotency strategy.

---

# 115. IDEMPOTENCY RECORD

System dapat menyimpan:

```text
idempotency_key
operation
request_hash
status
external_reference
created_at
completed_at
```

---

# 116. REQUEST HASH

Jika key digunakan ulang dengan payload berbeda, system harus menolak request.

---

# 117. RATE LIMIT

Integration layer harus menghormati provider quota.

---

# 118. CLIENT-SIDE RATE LIMITING

Jika diperlukan, request harus masuk rate limiter sebelum external call.

---

# 119. PROVIDER QUOTA

Quota harus dimonitor.

---

# 120. RATE LIMIT RESPONSE

Jika provider mengembalikan 429:

```text
Read Retry-After
↓
Backoff
↓
Retry if safe
```

---

# 121. CIRCUIT BREAKER

External provider yang gagal berulang dapat membuka circuit.

States:

```text
CLOSED
OPEN
HALF_OPEN
```

---

# 122. CIRCUIT OPEN

Saat OPEN, request tidak dikirim ke provider.

---

# 123. HALF OPEN

System melakukan limited test request untuk menentukan recovery.

---

# 124. FALLBACK PROVIDER

Jika tersedia:

```text
Primary
↓
Failure
↓
Secondary
```

---

# 125. FAILOVER POLICY

Failover harus explicit per integration.

Tidak semua provider dapat atau boleh failover.

---

# 126. FINANCIAL FAILOVER

Payment failover memerlukan stronger business controls dibanding email/maps.

---

# 127. PROVIDER PRIORITY

Provider dapat memiliki:

```text
priority
weight
status
```

---

# 128. WEIGHTED ROUTING

Weighted routing hanya digunakan jika business case membutuhkan.

---

# 129. HEALTH CHECK

Integration health harus dapat diperiksa.

---

# 130. ACTIVE HEALTH CHECK

Health check dapat berupa safe provider API call.

---

# 131. PASSIVE HEALTH

System juga dapat menentukan health berdasarkan actual request failure rate.

---

# 132. HEALTH STATUS

```text
HEALTHY
DEGRADED
UNHEALTHY
UNKNOWN
```

---

# 133. HEALTH DASHBOARD

Admin/operator dapat melihat:

```text
Provider
Status
Latency
Error rate
Last successful request
Last failure
Quota
```

---

# 134. INTEGRATION METRICS

Minimum:

```text
request_count
success_count
failure_count
latency
timeout_count
retry_count
rate_limit_count
circuit_open_count
```

---

# 135. WEBHOOK METRICS

```text
received
validated
processed
duplicate
failed
retry
dead_letter
```

---

# 136. PAYMENT METRICS

```text
payment_requests
success_rate
failure_rate
provider_latency
webhook_latency
verification_failure
```

---

# 137. EMAIL METRICS

```text
sent
delivered
bounce
failure
provider_latency
```

---

# 138. STORAGE METRICS

```text
upload_success
upload_failure
download_failure
storage_latency
```

---

# 139. PROVIDER ERROR NORMALIZATION

External errors harus dipetakan ke internal error categories.

---

# 140. ERROR MAPPING

Contoh:

```text
Provider 503
↓
EXTERNAL_SERVICE_UNAVAILABLE
```

---

# 141. ERROR RESPONSE

Frontend hanya menerima safe normalized error.

Provider raw error tidak boleh bocor.

---

# 142. EXTERNAL REQUEST LOG

Log minimal:

```text
integration
provider
operation
request_id
timestamp
duration
status
```

---

# 143. REQUEST PAYLOAD LOGGING

Payload tidak boleh di-log penuh jika mengandung:

```text
Credentials
Payment details
PII
Secrets
Tokens
```

---

# 144. RESPONSE LOGGING

Response body harus di-redact sesuai data classification.

---

# 145. CORRELATION ID

Setiap external request harus memiliki correlation ID.

---

# 146. TRACE CONTEXT

Jika distributed tracing tersedia:

```text
Request
→ Integration
→ Provider
```

harus dapat ditelusuri.

---

# 147. PROVIDER REQUEST ID

Jika provider memberikan request ID, simpan untuk support/debugging.

---

# 148. SUPPORT DIAGNOSTICS

Operator harus dapat mencari integration failure berdasarkan:

```text
internal request ID
external request ID
entity ID
payment ID
webhook ID
```

---

# 149. WEBHOOK REPLAY TOOL

Authorized operator dapat replay failed webhook event.

---

# 150. REPLAY SAFETY

Replay harus menggunakan original event ID dan idempotency mechanism.

---

# 151. WEBHOOK MANUAL PROCESS

Operator dapat memproses ulang event secara manual setelah reviewing failure.

---

# 152. DEAD LETTER QUEUE

Failed external events harus masuk DLQ setelah retry exhausted jika architecture menggunakan queue.

---

# 153. DLQ MONITORING

DLQ backlog harus dimonitor.

---

# 154. DLQ RETENTION

DLQ event mengikuti retention policy.

---

# 155. DLQ RECOVERY

Operator dapat:

```text
Retry
Ignore
Resolve
Archive
```

sesuai permission.

---

# 156. SYNCHRONIZATION

External data synchronization dapat menggunakan:

```text
Real-time webhook
Polling
Scheduled sync
Manual sync
```

---

# 157. WEBHOOK-FIRST

Jika provider mendukung reliable webhook, webhook menjadi preferred mechanism untuk state change.

---

# 158. POLLING FALLBACK

Polling digunakan jika webhook tidak tersedia/reliable.

---

# 159. POLLING INTERVAL

Polling interval harus configurable dan mengikuti provider limits.

---

# 160. INCREMENTAL SYNC

Sync sebaiknya menggunakan:

```text
updated_since
cursor
page token
```

jika provider mendukung.

---

# 161. FULL SYNC

Full synchronization hanya dilakukan:

```text
Initial import
Recovery
Reconciliation
```

atau explicit administrative operation.

---

# 162. PAGINATION

External API pagination wajib ditangani.

---

# 163. CURSOR

Cursor-based pagination harus menyimpan cursor secara aman.

---

# 164. SYNC CHECKPOINT

Long-running synchronization harus memiliki checkpoint.

---

# 165. SYNC FAILURE

Jika sync gagal:

```text
Resume from checkpoint
```

jika memungkinkan.

---

# 166. DATA RECONCILIATION

Financial integration wajib memiliki reconciliation process.

---

# 167. PAYMENT RECONCILIATION

System harus dapat membandingkan:

```text
Internal payments
vs
Provider transactions
```

---

# 168. RECONCILIATION STATUS

```text
MATCHED
MISSING_INTERNAL
MISSING_EXTERNAL
AMOUNT_MISMATCH
STATUS_MISMATCH
DUPLICATE
```

---

# 169. RECONCILIATION JOB

Reconciliation dapat dijalankan scheduled.

---

# 170. RECONCILIATION ALERT

Mismatch harus menghasilkan operational alert.

---

# 171. MANUAL RECONCILIATION

Authorized finance user dapat melakukan resolution.

---

# 172. FINANCIAL IMMUTABILITY

Reconciliation tidak boleh menghapus financial history.

---

# 173. AUDIT

Semua manual reconciliation harus diaudit.

---

# 174. EXTERNAL CUSTOMER SYNC

Jika customer data disinkronkan dengan provider:

```text
Internal Customer
↔
External Customer
```

mapping harus jelas.

---

# 175. SOURCE OF TRUTH

Setiap synced field harus memiliki source-of-truth policy.

---

# 176. FIELD OWNERSHIP

Contoh:

```text
Internal customer status → Internal
Provider message status → Provider
```

---

# 177. CONFLICT RESOLUTION

Jika kedua sisi berubah:

```text
Last write wins
Internal wins
External wins
Manual resolution
```

harus ditentukan per integration.

---

# 178. SYNC LOOP PREVENTION

Internal update yang berasal dari external event tidak boleh memicu infinite sync loop.

---

# 179. SYNC MARKER

Gunakan origin/source marker:

```text
source = EXTERNAL
```

jika diperlukan.

---

# 180. WEBHOOK OUTBOUND

System dapat mengirim webhook ke external consumers.

---

# 181. OUTBOUND WEBHOOK CONFIGURATION

Minimum:

```text
endpoint
events
secret
status
retry_policy
```

---

# 182. OUTBOUND SIGNATURE

Outgoing webhook harus ditandatangani.

---

# 183. SIGNATURE HEADER

Header format mengikuti contract yang ditetapkan API specification.

---

# 184. OUTBOUND RETRY

Retry menggunakan exponential backoff dan idempotency.

---

# 185. OUTBOUND EVENT ID

Setiap outgoing event memiliki unique event ID.

---

# 186. OUTBOUND DELIVERY

Delivery status:

```text
PENDING
SENT
DELIVERED
FAILED
EXHAUSTED
```

---

# 187. OUTBOUND WEBHOOK LOG

Simpan:

```text
event_id
endpoint
attempt
response_status
duration
timestamp
```

---

# 188. WEBHOOK SECRET ROTATION

Secret dapat dirotasi tanpa downtime jika provider/consumer mendukung dual secret window.

---

# 189. WEBHOOK ENDPOINT VALIDATION

External endpoint harus divalidasi sebelum activation jika feasible.

---

# 190. SSRF PROTECTION

Jika user/admin dapat memasukkan webhook destination URL:

```text
Private IP
Loopback
Metadata endpoints
Internal network
```

harus diblokir sesuai security policy.

---

# 191. URL VALIDATION

Webhook URL harus menggunakan allowed protocols.

Default:

```text
HTTPS
```

---

# 192. TLS

Production external communication harus menggunakan TLS.

---

# 193. CERTIFICATE VALIDATION

TLS certificate verification tidak boleh dimatikan di production.

---

# 194. MTLS

mTLS dapat digunakan untuk high-security integrations.

---

# 195. IP ALLOWLIST

Jika provider mendukung, IP allowlisting dapat digunakan sebagai defense-in-depth.

---

# 196. INBOUND IP VALIDATION

IP validation tidak boleh menggantikan cryptographic signature verification jika signature tersedia.

---

# 197. WEBHOOK RATE LIMIT

Inbound webhook endpoint harus memiliki rate limiting.

---

# 198. WEBHOOK SIZE LIMIT

Payload size harus dibatasi.

---

# 199. CONTENT TYPE

Webhook harus memvalidasi content type sesuai contract.

---

# 200. JSON VALIDATION

Webhook payload harus divalidasi terhadap schema.

---

# 201. SCHEMA VALIDATION

Schema mismatch:

```text
Reject
Log
Do not execute business action
```

---

# 202. PROVIDER API VERSION

Provider API version harus dikonfigurasi dan dicatat.

---

# 203. API VERSION UPGRADE

Upgrade provider API harus melalui:

```text
Development
↓
Testing
↓
Staging
↓
Production
```

---

# 204. DEPRECATION

Provider deprecation notice harus dicatat dan dimonitor.

---

# 205. INTEGRATION OWNER

Setiap integration harus memiliki technical/business owner.

---

# 206. PROVIDER CONTRACT

Setiap integration harus memiliki dokumentasi:

```text
Purpose
Provider
Authentication
Endpoints
Events
Data mapping
Retry
Rate limit
Failure behavior
Owner
```

---

# 207. PROVIDER SLA

Provider SLA dapat dicatat untuk operational monitoring.

---

# 208. PROVIDER INCIDENT

Jika provider outage:

```text
Detect
↓
Classify
↓
Alert
↓
Mitigate
↓
Recover
↓
Reconcile
```

---

# 209. INTEGRATION INCIDENT

Incident harus memiliki correlation dengan:

```text
provider
integration
affected workflow
affected entities
```

---

# 210. PROVIDER MAINTENANCE

Provider maintenance window dapat dikonfigurasi.

---

# 211. MAINTENANCE MODE

Integration dapat ditandai:

```text
MAINTENANCE
```

untuk mencegah request baru jika diperlukan.

---

# 212. FAIL-SAFE

Jika external integration bukan critical:

```text
Business transaction
→
Continue
→
Async integration retry
```

---

# 213. FAIL-CLOSED

Jika external verification adalah security/financial requirement:

```text
External verification unavailable
→
Do not finalize transaction
```

---

# 214. INTEGRATION CRITICALITY

Setiap integration harus diberi:

```text
NON_CRITICAL
IMPORTANT
CRITICAL
```

---

# 215. CRITICAL INTEGRATION

Critical integration harus memiliki:

```text
Monitoring
Alerting
Runbook
Recovery
Owner
Fallback/reconciliation strategy
```

---

# 216. NON-CRITICAL INTEGRATION

Contoh:

```text
Analytics
```

dapat gagal tanpa menggagalkan booking.

---

# 217. CRITICAL INTEGRATION

Contoh:

```text
Payment verification
```

dapat memblokir final state transition.

---

# 218. INTEGRATION DEPENDENCY GRAPH

System documentation harus mencatat dependency:

```text
Booking
 └── Payment
      └── Payment Provider
```

---

# 219. DEPENDENCY FAILURE

Failure pada dependency harus dapat dilacak ke affected business capability.

---

# 220. EXTERNAL API CONTRACT

Setiap integration harus memiliki contract:

```text
Request
Response
Error
Authentication
Timeout
Retry
Webhook
```

---

# 221. API CONTRACT TEST

Contract test harus dijalankan sebelum production integration release.

---

# 222. MOCK PROVIDER

Development/testing harus dapat menggunakan mock provider.

---

# 223. SANDBOX PROVIDER

Jika provider menyediakan sandbox, integration test menggunakan sandbox.

---

# 224. TEST CREDENTIAL

Test credential harus terpisah dari production credential.

---

# 225. TEST WEBHOOK

Webhook testing harus mencakup:

```text
Valid signature
Invalid signature
Expired timestamp
Duplicate event
Unknown event
Malformed payload
Provider retry
```

---

# 226. PAYMENT TEST

Payment test minimal:

```text
Success
Failure
Pending
Expired
Refund
Duplicate webhook
Amount mismatch
```

---

# 227. EMAIL TEST

```text
Send success
Provider failure
Bounce
Webhook
Retry
```

---

# 228. STORAGE TEST

```text
Upload
Download
Delete
Permission
Expired URL
Large file
Invalid file
```

---

# 229. MAPS TEST

```text
Valid address
Invalid address
No result
Provider timeout
Rate limit
```

---

# 230. API TEST

```text
Timeout
429
500
502
503
504
Malformed response
```

---

# 231. PROVIDER FAILOVER TEST

Jika failover digunakan:

```text
Primary fails
↓
Secondary selected
↓
Business operation remains consistent
```

---

# 232. NO DOUBLE EXECUTION

Failover tidak boleh menyebabkan operation dieksekusi dua kali.

---

# 233. PAYMENT FAILOVER SAFETY

Payment failover wajib memeriksa apakah primary provider mungkin sudah memproses transaction sebelum secondary attempt.

---

# 234. RECONCILIATION AFTER FAILOVER

Financial operation setelah failover harus dapat direkonsiliasi.

---

# 235. INTEGRATION CONFIGURATION UI

Admin dapat melihat:

```text
Provider
Type
Status
Environment
Health
Last failure
```

Secret value tidak ditampilkan.

---

# 236. CONFIGURATION CHANGE

Integration configuration change harus audited.

---

# 237. TEST CONNECTION

Admin dapat menjalankan safe test connection jika provider mendukung.

---

# 238. TEST CONNECTION SAFETY

Test connection tidak boleh membuat financial transaction.

---

# 239. ENABLE/DISABLE

Authorized admin dapat enable/disable integration.

---

# 240. DISABLE SAFETY

Disabling critical integration harus menampilkan impact warning.

---

# 241. PROVIDER SWITCH

Provider switching harus audited.

---

# 242. PROVIDER SWITCH CHECKLIST

Sebelum switch:

```text
Credentials valid
Health check passed
Contract compatible
Webhook configured
Reconciliation ready
```

---

# 243. INTEGRATION MIGRATION

Provider migration harus memiliki migration plan.

---

# 244. DUAL RUN

Untuk migration tertentu, dual-run dapat digunakan jika aman.

---

# 245. DUAL WRITE

Dual-write untuk financial operations tidak boleh digunakan tanpa strong consistency/idempotency design.

---

# 246. PROVIDER DECOMMISSION

Provider lama hanya boleh dinonaktifkan setelah:

```text
Outstanding transactions resolved
Webhook disabled
Credentials revoked
Historical data retained
```

---

# 247. CREDENTIAL REVOCATION

Credential provider lama harus dicabut setelah migration selesai.

---

# 248. DATA RETENTION

External payload retention mengikuti:

```text
Audit policy
Privacy policy
Provider contract
Legal requirements
```

---

# 249. DATA MINIMIZATION

System hanya mengirim data yang diperlukan ke provider.

---

# 250. PII CLASSIFICATION

Data yang dikirim external harus diklasifikasikan.

---

# 251. PAYMENT DATA

Sensitive payment data harus diproses melalui provider/tokenized mechanism sesuai payment architecture.

---

# 252. CARD DATA

System tidak boleh menyimpan raw card data jika tidak secara eksplisit diperlukan dan compliant.

---

# 253. TOKENIZATION

Payment token digunakan sebagai pengganti sensitive payment data jika tersedia.

---

# 254. LOG REDACTION

Payment credentials, tokens, secrets, dan sensitive identifiers harus di-redact.

---

# 255. PRIVACY

External integrations harus mematuhi privacy requirements yang berlaku untuk aplikasi.

---

# 256. CONSENT

Consent harus diperiksa sebelum mengirim data untuk marketing/personalization jika diperlukan.

---

# 257. DATA DELETION

Jika data subject deletion diterapkan, integration layer harus memiliki deletion/anonymization policy sesuai provider capability.

---

# 258. EXTERNAL DATA DELETION

Jika provider mendukung deletion API, deletion dapat diproses melalui controlled workflow.

---

# 259. AUDIT

External integration operations harus dapat diaudit.

Minimum:

```text
integration
operation
actor
entity
timestamp
status
provider_reference
```

---

# 260. WEBHOOK AUDIT

Inbound webhook audit harus mencatat:

```text
provider
event
external_event_id
verification
processing_result
```

---

# 261. MANUAL ACTION AUDIT

Manual retry/replay/provider switch wajib diaudit.

---

# 262. SUPPORT ACCESS

Support staff tidak boleh melihat secret values.

---

# 263. ADMIN ACCESS

Integration configuration permission harus restricted.

---

# 264. BREAK-GLASS

Emergency access dapat digunakan jika architecture membutuhkan, tetapi harus:

```text
Time-limited
Audited
Approved
```

---

# 265. MONITORING ALERTS

Minimum alert:

```text
Provider unavailable
High error rate
High latency
Rate limit approaching
Credential expiry
Webhook backlog
DLQ backlog
Payment reconciliation mismatch
```

---

# 266. ALERT SEVERITY

```text
INFO
WARNING
ERROR
CRITICAL
```

---

# 267. HEALTH THRESHOLDS

Threshold harus configurable berdasarkan provider.

---

# 268. LATENCY ALERT

Alert jika external provider latency melewati defined threshold secara konsisten.

---

# 269. ERROR RATE ALERT

Alert jika error percentage melewati threshold dalam rolling window.

---

# 270. WEBHOOK LAG

Monitor:

```text
received_at
vs
processed_at
```

untuk mengetahui webhook lag.

---

# 271. PAYMENT WEBHOOK LAG

Payment webhook lag harus diprioritaskan karena memengaruhi booking/payment state.

---

# 272. SYNC LAG

Scheduled sync harus memiliki last-success timestamp.

---

# 273. SYNC FAILURE ALERT

Repeated sync failures harus menghasilkan alert.

---

# 274. INTEGRATION DASHBOARD

Dashboard minimal:

```text
Provider Health
Request Volume
Success Rate
Error Rate
Latency
Retry
Rate Limit
Webhook
Sync
```

---

# 275. OPERATIONS VIEW

Operator dapat melihat provider incident tanpa melihat secrets.

---

# 276. PROVIDER RUNBOOK

Setiap critical provider harus memiliki runbook:

```text
Symptoms
Checks
Mitigation
Failover
Recovery
Reconciliation
Escalation
```

---

# 277. RECOVERY PROCEDURE

General:

```text
Detect
↓
Stop harmful retries
↓
Check provider
↓
Enable fallback if allowed
↓
Recover
↓
Replay/reconcile
↓
Close incident
```

---

# 278. WEBHOOK RECOVERY

```text
Detect backlog
↓
Check queue
↓
Check provider
↓
Retry
↓
DLQ recovery
↓
Reconcile
```

---

# 279. PAYMENT RECOVERY

```text
Provider incident
↓
Stop unsafe retries
↓
Check transaction status
↓
Reconcile
↓
Update internal state
```

---

# 280. DATA CONSISTENCY

Integration layer harus memprioritaskan correctness daripada speed untuk critical financial operations.

---

# 281. EVENTUAL CONSISTENCY

Untuk non-critical integrations:

```text
Internal success
↓
Async external propagation
```

diperbolehkan.

---

# 282. SYNCHRONOUS INTEGRATION

Synchronous call hanya digunakan jika response dibutuhkan untuk melanjutkan business transaction.

---

# 283. ASYNCHRONOUS INTEGRATION

Gunakan async jika:

```text
Notification
Analytics
Search indexing
Non-critical enrichment
```

---

# 284. EXTERNAL DEPENDENCY BOUNDARY

Business transaction harus memiliki explicit dependency boundary.

---

# 285. TIMEOUT BUDGET

Total request latency harus memperhitungkan external dependency timeout.

---

# 286. CASCADING FAILURE

Timeout/retry harus dibatasi agar tidak menyebabkan cascading failure.

---

# 287. BULKHEAD

Critical external providers dapat menggunakan isolated worker/queue.

---

# 288. CONCURRENCY LIMIT

External requests dapat memiliki concurrency limit per provider.

---

# 289. BACKPRESSURE

Queue system harus mampu melakukan backpressure jika provider overload.

---

# 290. LOAD SHEDDING

Non-critical integrations dapat ditunda saat system overload.

---

# 291. PRIORITY QUEUE

Critical operations dapat memiliki queue priority lebih tinggi.

---

# 292. PAYMENT PRIORITY

Payment verification dapat memiliki higher priority dibanding analytics events.

---

# 293. ANALYTICS DEFER

Analytics dapat ditunda jika infrastructure sedang under pressure.

---

# 294. EXTERNAL RESPONSE VALIDATION

System tidak boleh mempercayai response hanya karena HTTP 200.

---

# 295. BUSINESS RESPONSE VALIDATION

Response harus diperiksa:

```text
Schema
Status
Required fields
Business status
Reference
```

---

# 296. MALFORMED RESPONSE

Malformed provider response:

```text
Log
Alert if repeated
Fail safely
```

---

# 297. PROVIDER DATA MAPPING

Mapping harus terdokumentasi.

Contoh:

```text
External:
captured

Internal:
PAID
```

---

# 298. ENUM MAPPING

External enum tidak boleh langsung dipakai sebagai internal enum tanpa mapping.

---

# 299. DATE MAPPING

External date/time harus dinormalisasi ke internal time standard.

---

# 300. CURRENCY MAPPING

Financial integration harus memvalidasi currency.

---

# 301. AMOUNT PRECISION

Financial amount harus menggunakan exact decimal representation.

Floating point tidak boleh digunakan untuk financial arithmetic.

---

# 302. ROUNDING

Rounding harus mengikuti business/financial policy.

---

# 303. CURRENCY CONVERSION

FX conversion bukan responsibility generic integration layer kecuali explicitly defined.

---

# 304. EXTERNAL CUSTOMER REFERENCE

Customer external reference harus unique within provider scope.

---

# 305. EXTERNAL BOOKING REFERENCE

Provider booking/reference harus disimpan jika digunakan untuk reconciliation.

---

# 306. REQUEST RECONCILIATION

Request log harus dapat dicocokkan dengan provider response.

---

# 307. WEBHOOK RECONCILIATION

Webhook event harus dapat dicocokkan dengan original transaction.

---

# 308. PAYMENT FLOW

Final baseline:

```text
                    ┌──────────────────┐
                    │ Internal Payment │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Integration Layer│
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Payment Provider │
                    └────────┬─────────┘
                             │
                         Webhook
                             │
                             ▼
                    ┌──────────────────┐
                    │ Verify / Normalize│
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Payment Service  │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Workflow Engine  │
                    └──────────────────┘
```

---

# 309. WEBHOOK FLOW

```text
Provider
   ↓
HTTPS Webhook
   ↓
Signature Verification
   ↓
Replay Check
   ↓
Persist Event
   ↓
ACK
   ↓
Queue
   ↓
Consumer
   ↓
Business Service
   ↓
Workflow/Event
```

---

# 310. OUTBOUND WEBHOOK FLOW

```text
Business Event
   ↓
Webhook Dispatcher
   ↓
Create Delivery
   ↓
Sign Payload
   ↓
Send
   ↓
Receive Response
   ↓
Success / Retry / DLQ
```

---

# 311. PROVIDER FAILURE FLOW

```text
Request
  ↓
Timeout/Error
  ↓
Classify
  ↓
Retry?
 ├── YES → Backoff → Retry
 └── NO
       ↓
  Circuit / Failure
       ↓
  Fallback if allowed
       ↓
  Alert
```

---

# 312. RECONCILIATION FLOW

```text
Internal Records
       +
Provider Records
       ↓
   Reconciliation
       ↓
 ┌─────┼──────────────┐
 MATCH MISMATCH      DUPLICATE
   │       │              │
   ▼       ▼              ▼
 CLOSE   REVIEW        RESOLVE
```

---

# 313. INTEGRATION DATA MODEL

Logical entities:

```text
integrations
integration_providers
integration_credentials
integration_requests
integration_responses
webhook_events
webhook_deliveries
external_references
sync_jobs
sync_checkpoints
reconciliation_records
```

Actual schema mengikuti Document 14.

---

# 314. INTEGRATION REQUEST

Minimum:

```text
request_id
integration_id
operation
entity_type
entity_id
idempotency_key
status
started_at
completed_at
provider_request_id
```

---

# 315. EXTERNAL REFERENCE

Minimum:

```text
entity_type
entity_id
provider
external_type
external_id
created_at
updated_at
```

---

# 316. SYNC JOB

Minimum:

```text
sync_job_id
integration_id
sync_type
status
cursor
started_at
completed_at
last_error
```

---

# 317. RECONCILIATION RECORD

Minimum:

```text
reconciliation_id
provider
internal_reference
external_reference
status
difference
resolution
resolved_by
resolved_at
```

---

# 318. API ENDPOINTS

Logical endpoints:

```text
GET    /api/integrations
GET    /api/integrations/{id}
POST   /api/integrations/{id}/enable
POST   /api/integrations/{id}/disable
POST   /api/integrations/{id}/health-check
```

---

# 319. WEBHOOK ENDPOINTS

```text
POST /api/webhooks/{provider}
```

Provider-specific endpoints may be used when required.

---

# 320. SYNC ENDPOINTS

Authorized administration:

```text
POST /api/integrations/{id}/sync
GET  /api/integrations/{id}/sync-status
```

---

# 321. RECONCILIATION ENDPOINTS

Finance/admin:

```text
GET  /api/reconciliation
GET  /api/reconciliation/{id}
POST /api/reconciliation/{id}/resolve
```

---

# 322. SECURITY PERMISSIONS

Minimum:

```text
integration.view
integration.manage
integration.test
integration.enable
integration.disable
integration.replay_webhook
integration.retry
integration.reconcile
integration.credentials.manage
```

---

# 323. CREDENTIAL PERMISSION

Credential management harus lebih restricted daripada integration viewing.

---

# 324. WEBHOOK REPLAY PERMISSION

Webhook replay hanya boleh dilakukan oleh authorized operational user.

---

# 325. FINANCIAL RECONCILIATION PERMISSION

Financial reconciliation harus dibatasi pada finance-authorized roles.

---

# 326. API SECURITY

Integration APIs harus menggunakan:

```text
Authentication
Authorization
Rate limiting
Audit
Input validation
```

---

# 327. WEBHOOK AUTHENTICATION

Webhook authentication menggunakan provider-specific signature/token mechanism.

---

# 328. WEBHOOK CSRF

Webhook endpoint yang server-to-server harus dirancang sesuai authentication model dan tidak bergantung pada browser CSRF token.

---

# 329. REQUEST VALIDATION

Semua external response dan inbound webhook harus divalidasi.

---

# 330. SSRF

Dynamic outbound URL harus dilindungi dari SSRF.

---

# 331. INJECTION

Provider response dan webhook payload tidak boleh langsung masuk ke:

```text
SQL
HTML
Shell
Template
Expression
```

tanpa sanitization/parameterization.

---

# 332. XML

Jika provider menggunakan XML:

```text
XXE
Entity expansion
```

harus dinonaktifkan.

---

# 333. JSON LIMITS

JSON payload harus memiliki size/depth limits jika diperlukan.

---

# 334. FILE URL

External file URL harus divalidasi sebelum download.

---

# 335. DOWNLOAD SAFETY

External download harus memiliki:

```text
Timeout
Size limit
Content validation
SSRF protection
Malware scanning if required
```

---

# 336. PROVIDER FILE IMPORT

Imported files harus diperlakukan sebagai untrusted input.

---

# 337. INTEGRATION TESTING

Testing harus mencakup:

```text
Unit
Contract
Integration
Webhook
Failure
Security
Load
Recovery
Reconciliation
```

---

# 338. CONTRACT TESTING

Provider response mapping harus diuji terhadap expected schema.

---

# 339. FAILURE INJECTION

Test environment harus dapat mensimulasikan:

```text
Timeout
500
503
429
Malformed response
Duplicate event
```

---

# 340. CHAOS TESTING

Critical integrations dapat menjalani controlled failure injection.

---

# 341. DISASTER RECOVERY

Integration configuration dan webhook event records harus termasuk dalam backup/recovery scope sesuai Document 16.

---

# 342. CREDENTIAL RECOVERY

Credential recovery harus menggunakan secret management backup/recovery mechanism.

---

# 343. WEBHOOK RECOVERY

After disaster:

```text
Restore
↓
Reconcile
↓
Replay missing events if necessary
```

---

# 344. PAYMENT RECOVERY

Financial state harus direkonsiliasi terhadap provider setelah disaster recovery.

---

# 345. RPO

Integration event data harus mengikuti RPO yang ditetapkan pada disaster recovery architecture.

---

# 346. RTO

Critical integration recovery harus mengikuti RTO business capability.

---

# 347. DOCUMENTATION

Setiap provider wajib memiliki integration documentation internal.

---

# 348. PROVIDER INVENTORY

Production inventory harus mencatat:

```text
Provider
Purpose
Environment
Owner
Criticality
Credential expiry
Webhook
Status
```

---

# 349. PROVIDER ONBOARDING CHECKLIST

```text
[ ] Business purpose defined
[ ] Provider selected
[ ] Contract reviewed
[ ] API documentation reviewed
[ ] Authentication configured
[ ] Secrets stored securely
[ ] Adapter implemented
[ ] Error mapping implemented
[ ] Retry policy implemented
[ ] Idempotency implemented
[ ] Rate limit handled
[ ] Webhook implemented
[ ] Signature validation implemented
[ ] Replay protection implemented
[ ] Monitoring implemented
[ ] Alerting implemented
[ ] Sandbox tested
[ ] Security reviewed
[ ] Production tested
[ ] Runbook created
[ ] Owner assigned
```

---

# 350. PAYMENT PROVIDER CHECKLIST

```text
[ ] Payment creation
[ ] Payment status
[ ] Webhook
[ ] Signature
[ ] Server verification
[ ] Idempotency
[ ] Refund
[ ] Amount validation
[ ] Currency validation
[ ] Reconciliation
[ ] Failure recovery
[ ] Provider outage strategy
```

---

# 351. EMAIL PROVIDER CHECKLIST

```text
[ ] API authentication
[ ] Template support
[ ] Send
[ ] Delivery status
[ ] Bounce
[ ] Failure
[ ] Retry
[ ] Webhook
[ ] Rate limit
[ ] Suppression
```

---

# 352. MESSAGING PROVIDER CHECKLIST

```text
[ ] Authentication
[ ] Templates
[ ] Send
[ ] Delivery status
[ ] Webhook
[ ] Retry
[ ] Rate limit
[ ] Opt-out
[ ] Consent
```

---

# 353. STORAGE PROVIDER CHECKLIST

```text
[ ] Upload
[ ] Download
[ ] Delete
[ ] Signed URL
[ ] Access control
[ ] File validation
[ ] Checksum
[ ] Retention
[ ] Backup
```

---

# 354. WEBHOOK CHECKLIST

```text
[ ] HTTPS
[ ] Signature
[ ] Timestamp
[ ] Replay protection
[ ] Event ID
[ ] Schema validation
[ ] Persistence
[ ] ACK
[ ] Queue
[ ] Retry
[ ] DLQ
[ ] Monitoring
```

---

# 355. PRODUCTION READINESS

```text
[ ] Provider abstraction implemented
[ ] Credentials secured
[ ] OAuth/token management implemented where required
[ ] Request timeout configured
[ ] Retry policy configured
[ ] Idempotency implemented
[ ] Rate limiting implemented
[ ] Circuit breaker implemented where required
[ ] Health check implemented
[ ] Monitoring implemented
[ ] Alerting implemented
[ ] Webhook verification implemented
[ ] Replay protection implemented
[ ] External event persistence implemented
[ ] DLQ implemented where required
[ ] Reconciliation implemented for financial flows
[ ] Failover tested where applicable
[ ] Security testing passed
[ ] Contract testing passed
[ ] Load testing passed
[ ] Recovery tested
[ ] Runbook completed
[ ] Provider owner assigned
```

---

# 356. ACCEPTANCE CRITERIA

Implementation dianggap production-ready apabila:

### Provider Abstraction

```text
Business modules tidak bergantung langsung pada SDK provider.
```

### Security

```text
Credential, token, webhook, dan external communication terlindungi.
```

### Reliability

```text
Transient external failures dapat ditangani tanpa duplicate business operation.
```

### Webhook

```text
Webhook dapat diverifikasi, dipersist, diproses asynchronous, di-retry, dan direcover.
```

### Payment

```text
Payment state hanya dapat berubah menjadi final setelah validation dan verification yang sesuai.
```

### Reconciliation

```text
Financial transactions dapat dibandingkan dengan provider dan mismatch dapat ditangani.
```

### Observability

```text
Provider health, latency, error, retry, rate limit, webhook backlog, dan reconciliation mismatch dapat dimonitor.
```

### Recovery

```text
Integration failure dan provider outage memiliki recovery procedure.
```

### Security

```text
SSRF, replay, credential leakage, injection, unauthorized integration management, dan webhook spoofing memiliki mitigasi.
```

### Maintainability

```text
Provider dapat diganti tanpa melakukan perubahan besar pada business module.
```

---

# 357. FINAL INTEGRATION ARCHITECTURE

```text
                         ┌───────────────────────┐
                         │     ERP MODULES       │
                         │ CRM / Booking /       │
                         │ Finance / Operations  │
                         └───────────┬───────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │  INTERNAL SERVICES    │
                         └───────────┬───────────┘
                                     │
                                     ▼
                    ┌────────────────────────────────┐
                    │       INTEGRATION LAYER         │
                    ├────────────────────────────────┤
                    │ Provider Adapter                │
                    │ Authentication                  │
                    │ Retry                           │
                    │ Idempotency                     │
                    │ Rate Limit                      │
                    │ Circuit Breaker                 │
                    │ Health Check                    │
                    │ Error Normalization             │
                    └───────────────┬────────────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              ▼                     ▼                     ▼
       ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
       │   Payment   │       │   Message   │       │   Storage   │
       │   Provider  │       │   Provider  │       │   Provider  │
       └──────┬──────┘       └──────┬──────┘       └─────────────┘
              │                     │
           Webhook               Webhook
              │                     │
              └──────────┬──────────┘
                         ▼
                ┌──────────────────┐
                │ Webhook Gateway  │
                ├──────────────────┤
                │ Verify           │
                │ Replay Protect   │
                │ Persist          │
                │ Queue            │
                └────────┬─────────┘
                         │
                         ▼
                ┌──────────────────┐
                │ Workflow Engine  │
                └────────┬─────────┘
                         │
                         ▼
                ┌──────────────────┐
                │ Business Service │
                └──────────────────┘

         ┌─────────────────────────────────────────┐
         │ Observability / Audit / Reconciliation │
         └─────────────────────────────────────────┘
```

---

# 358. FINAL DESIGN PRINCIPLE

External provider adalah dependency.

ERP business logic tetap menjadi source of truth untuk business state internal.

```text
External Provider
       ↓
Integration Layer
       ↓
Normalized Event / Response
       ↓
Business Service
       ↓
Workflow
       ↓
Internal State
```

Untuk critical financial state:

```text
External Event
      ↓
Verify
      ↓
Validate
      ↓
Idempotency
      ↓
Business Rule
      ↓
Commit
      ↓
Audit
```

Bukan:

```text
Webhook
↓
Direct Database Update
```

---

# 359. DOCUMENT DEPENDENCIES

Dokumen ini berkaitan langsung dengan:

```text
03_BUSINESS_RULES_AND_POLICY.md
04_PRD_SYSTEM_REQUIREMENTS.md
09_UI_UX_AND_FRONTEND_SPECIFICATION.md
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
```

---

# 360. NEXT DOCUMENT

Dokumen berikutnya:

```text
25_PERFORMANCE_SCALABILITY_AND_CAPACITY_SPECIFICATION.md
```

Fokus:

```text
Performance architecture
Capacity planning
Load model
Concurrency
Caching
Database performance
API performance
Queue performance
Worker scaling
Horizontal scaling
Vertical scaling
Autoscaling
Rate limiting
Resource limits
Performance budgets
Stress testing
Load testing
Capacity forecasting
Peak traffic
SLA/SLO performance
Bottleneck analysis
Performance observability
```

---

# END OF DOCUMENT