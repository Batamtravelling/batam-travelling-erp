# BATAM TRAVELLING ERP
# API & INTEGRATION SPECIFICATION

**File Name:** `10_API_AND_INTEGRATION_SPECIFICATION.md`  
**Document Number:** 10  
**Version:** 1.0  
**Status:** API & INTEGRATION BASELINE  
**Project:** Batam Travelling ERP  
**Last Updated:** 2026-08-08

---

# 1. PURPOSE

Dokumen ini mendefinisikan standar teknis untuk:

- API architecture
- Backend communication
- Authentication
- Authorization
- REST API
- Request / response
- Validation
- Error handling
- File upload
- File access
- Webhook
- Event system
- CRM integration
- Website integration
- CMS integration
- Product integration
- Lead capture
- Payment integration
- Email
- WhatsApp
- Notification
- Analytics
- External services
- Security
- Audit
- Idempotency
- Rate limiting
- Retry
- Integration monitoring

Dokumen ini menjadi acuan utama implementasi komunikasi antara frontend, backend, database, CMS, ERP, dan external services.

---

# 2. API PRINCIPLE

API harus:

- Consistent
- Predictable
- Secure
- Permission-aware
- State-aware
- Idempotent untuk operation yang sesuai
- Observable
- Versioned
- Backward-compatible jika memungkinkan
- Validated server-side

Prinsip utama:

> Frontend meminta tindakan. Backend memutuskan apakah tindakan tersebut valid.

---

# 3. SYSTEM ARCHITECTURE

Arsitektur utama:

```text
Public Website
      │
      ▼
Frontend / Web Application
      │
      ▼
API Layer
      │
      ├── CRM
      ├── Sales
      ├── Booking
      ├── Finance
      ├── Operations
      ├── CMS
      └── Reporting
             │
             ▼
          Database
```

External integrations:

```text
ERP / API
   │
   ├── Payment Provider
   ├── Email Provider
   ├── WhatsApp Provider
   ├── File Storage
   ├── Analytics
   └── Other External Services
```

---

# 4. API LAYERS

API implementation dipisahkan menjadi:

```text
Presentation/API Layer
        ↓
Application / Service Layer
        ↓
Business Logic
        ↓
Repository / Data Access Layer
        ↓
Database
```

Business logic tidak boleh ditempatkan hanya di frontend.

---

# 5. API STYLE

Default API menggunakan:

```text
HTTP/HTTPS
REST
JSON
```

Jika kebutuhan tertentu membutuhkan:

- WebSocket
- Server-Sent Events
- GraphQL
- RPC

penggunaan harus ditentukan secara eksplisit dan tidak menggantikan REST tanpa alasan teknis.

---

# 6. API BASE URL

API harus memiliki environment-specific base URL.

Contoh:

```text
Development
/api/v1

Staging
/api/v1

Production
/api/v1
```

Actual domain tidak boleh di-hard-code ke component frontend.

---

# 7. API VERSIONING

API menggunakan versioning.

Contoh:

```text
/api/v1/...
```

Breaking change harus menggunakan versi baru:

```text
/api/v2/...
```

Minor enhancement yang backward-compatible tidak perlu membuat major version baru.

---

# 8. RESOURCE NAMING

Resource menggunakan plural noun.

Contoh:

```text
/api/v1/customers
/api/v1/leads
/api/v1/quotations
/api/v1/bookings
/api/v1/invoices
/api/v1/payments
/api/v1/articles
/api/v1/products
```

Hindari:

```text
/getCustomer
/createBooking
/doPayment
```

---

# 9. HTTP METHODS

Gunakan standard HTTP method:

```text
GET
POST
PUT
PATCH
DELETE
```

Guideline:

```text
GET
Read

POST
Create / Action

PUT
Full replacement

PATCH
Partial update

DELETE
Delete / Archive jika business rule mendukung
```

Business-sensitive actions dapat menggunakan explicit action endpoint.

Contoh:

```text
POST /quotations/{id}/send
POST /quotations/{id}/accept
POST /bookings/{id}/confirm
POST /payments/{id}/verify
POST /articles/{id}/publish
```

---

# 10. API RESPONSE FORMAT

Response harus konsisten.

Success:

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed.",
    "details": []
  }
}
```

---

# 11. RESPONSE METADATA

Untuk list:

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 125,
    "total_pages": 7
  }
}
```

---

# 12. API REQUEST ID

Setiap request sebaiknya memiliki:

```text
request_id
```

Tujuannya:

- Debugging
- Logging
- Audit
- Support
- Incident investigation

Contoh header:

```text
X-Request-ID
```

---

# 13. AUTHENTICATION

API private harus menggunakan authentication.

Authentication dapat menggunakan:

- Session
- Secure cookie
- Access token
- Refresh token

Implementasi final mengikuti architecture backend.

---

# 14. AUTHENTICATION RULE

Authentication menjawab:

> Siapa user ini?

Authorization menjawab:

> Apa yang boleh dilakukan user ini?

Keduanya harus dipisahkan.

---

# 15. AUTHORIZATION

Setiap protected endpoint harus memvalidasi:

```text
Authenticated User
+
Role
+
Permission
+
Resource Ownership
+
Business Rule
```

---

# 16. PERMISSION FORMAT

Permission mengikuti struktur dari document 07.

Contoh:

```text
crm.lead.view
crm.lead.create
crm.lead.edit
crm.lead.assign

quotation.view
quotation.create
quotation.edit
quotation.send
quotation.accept

payment.view
payment.create
payment.verify

content.article.view
content.article.create
content.article.edit
content.article.publish
```

Nama final mengikuti permission matrix.

---

# 17. RESOURCE-LEVEL AUTHORIZATION

Permission saja tidak selalu cukup.

Contoh:

Sales memiliki:

```text
quotation.edit
```

tetapi hanya boleh mengedit quotation yang:

- Dimiliki olehnya
- Berada dalam scope team-nya
- Atau secara eksplisit diberikan kepadanya

sesuai business policy.

---

# 18. CUSTOMER AUTHORIZATION

Customer hanya dapat mengakses record miliknya.

Contoh:

```text
Customer A
→ Booking A
→ Invoice A
→ Payment A
→ Itinerary A
```

Customer A tidak boleh mengakses:

```text
Booking B
Invoice B
Payment B
```

meskipun mengetahui ID record.

---

# 19. IDOR PREVENTION

Backend tidak boleh hanya memeriksa:

```text
GET /bookings/{id}
```

berdasarkan ID.

Backend wajib memastikan user memiliki hak terhadap resource tersebut.

---

# 20. INPUT VALIDATION

Semua input dari client dianggap untrusted.

Validasi harus dilakukan server-side.

Validasi mencakup:

- Required field
- Type
- Format
- Length
- Range
- Relationship
- Permission
- Business rule
- State transition

---

# 21. BUSINESS VALIDATION

Contoh:

Frontend mengirim:

```text
POST /payments/{id}/verify
```

Backend harus memeriksa:

```text
Payment exists
+
User authorized
+
Payment not already verified
+
Proof exists if required
+
Amount valid
+
Invoice valid
+
Booking valid
```

---

# 22. API ERROR STATUS

Gunakan HTTP status yang sesuai.

```text
200 OK
201 Created
202 Accepted
204 No Content

400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Unprocessable Entity
429 Too Many Requests

500 Internal Server Error
502 Bad Gateway
503 Service Unavailable
```

---

# 23. BUSINESS ERROR CODE

Error harus memiliki machine-readable code.

Contoh:

```text
BOOKING_NOT_FOUND
BOOKING_INVALID_STATE
PAYMENT_ALREADY_VERIFIED
PAYMENT_AMOUNT_MISMATCH
QUOTATION_EXPIRED
QUOTATION_ALREADY_ACCEPTED
CONTENT_NOT_APPROVED
PRODUCT_NOT_PUBLISHED
PERMISSION_DENIED
```

---

# 24. ERROR MESSAGE

Message harus:

- Aman
- Jelas
- Tidak membocorkan internal information
- Dapat dipahami frontend

Jangan mengembalikan:

```text
SQL error
Stack trace
Database credentials
Internal path
Secret
```

---

# 25. PAGINATION

List endpoint harus mendukung pagination.

Contoh:

```text
GET /api/v1/customers?page=1&per_page=20
```

Maximum `per_page` harus dibatasi.

---

# 26. FILTERING

Gunakan query parameter.

Contoh:

```text
GET /api/v1/bookings?status=CONFIRMED
```

Multiple filters:

```text
GET /api/v1/bookings?status=CONFIRMED&sales_id=123
```

---

# 27. SORTING

Contoh:

```text
GET /api/v1/bookings?sort=-travel_date
```

Format sorting harus konsisten di seluruh API.

---

# 28. SEARCH

Contoh:

```text
GET /api/v1/customers?search=John
```

Search harus:

- Permission-aware
- Paginated
- Rate-limited jika diperlukan

---

# 29. GLOBAL SEARCH

Global search dapat menyediakan endpoint:

```text
GET /api/v1/search?q=batam
```

Hasil harus mengembalikan tipe resource.

Contoh:

```json
{
  "type": "customer",
  "id": "123",
  "title": "John Doe"
}
```

---

# 30. API FIELD NAMING

Gunakan naming convention yang konsisten.

Default:

```text
snake_case
```

Contoh:

```text
customer_id
booking_id
travel_date
created_at
updated_at
```

Frontend dapat melakukan transformation jika diperlukan.

---

# 31. TIMESTAMP

Timestamp API menggunakan format standard.

Rekomendasi:

```text
ISO 8601
```

Contoh:

```text
2026-08-08T10:30:00Z
```

---

# 32. MONEY

API tidak boleh mengandalkan floating-point untuk financial calculation.

Gunakan integer minor unit atau decimal strategy yang konsisten.

Contoh:

```json
{
  "amount": 5000000,
  "currency": "IDR"
}
```

---

# 33. MONEY RESPONSE

Untuk financial value, response sebaiknya menyediakan:

```text
amount
currency
```

Contoh:

```json
{
  "amount": 5000000,
  "currency": "IDR"
}
```

Frontend bertanggung jawab melakukan display formatting.

---

# 34. FINANCIAL CALCULATION

Frontend tidak boleh menjadi authority untuk:

- Total invoice
- Payment balance
- Tax
- Discount
- Commission
- Refund
- Margin

Backend harus menghitung dan mengembalikan hasil final.

---

# 35. QUOTATION API

Minimal resource:

```text
GET    /quotations
POST   /quotations
GET    /quotations/{id}
PATCH  /quotations/{id}
POST   /quotations/{id}/send
POST   /quotations/{id}/accept
POST   /quotations/{id}/reject
POST   /quotations/{id}/duplicate
POST   /quotations/{id}/convert-to-booking
```

Endpoint final mengikuti module architecture.

---

# 36. BOOKING API

Minimal:

```text
GET    /bookings
POST   /bookings
GET    /bookings/{id}
PATCH  /bookings/{id}
POST   /bookings/{id}/confirm
POST   /bookings/{id}/cancel
POST   /bookings/{id}/complete
```

State transition harus divalidasi backend.

---

# 37. INVOICE API

Minimal:

```text
GET    /invoices
POST   /invoices
GET    /invoices/{id}
POST   /invoices/{id}/issue
POST   /invoices/{id}/send
POST   /invoices/{id}/void
```

---

# 38. PAYMENT API

Minimal:

```text
GET    /payments
POST   /payments
GET    /payments/{id}
POST   /payments/{id}/verify
POST   /payments/{id}/reject
POST   /payments/{id}/request-clarification
```

---

# 39. PAYMENT PROOF API

Customer/Sales dapat upload proof sesuai permission.

Contoh:

```text
POST /payments/{id}/proof
```

Data:

```text
amount
payment_date
payment_method
reference
file
notes
```

---

# 40. PAYMENT VERIFICATION

Verification harus transaction-safe.

Backend harus mencegah:

```text
Two finance users
→ verify same payment
→ simultaneously
```

Gunakan transaction/locking/idempotency strategy.

---

# 41. CRM LEAD API

Minimal:

```text
GET    /leads
POST   /leads
GET    /leads/{id}
PATCH  /leads/{id}
POST   /leads/{id}/assign
POST   /leads/{id}/convert
POST   /leads/{id}/activities
```

---

# 42. WEBSITE LEAD API

Public website membutuhkan endpoint khusus untuk lead capture.

Contoh:

```text
POST /public/v1/leads
```

Endpoint public harus memiliki:

- Validation
- Rate limiting
- Anti-spam
- Bot protection jika diperlukan
- Source attribution
- Abuse prevention

---

# 43. WEBSITE LEAD PAYLOAD

Contoh:

```json
{
  "name": "John Doe",
  "phone": "+62...",
  "email": "john@example.com",
  "travel_date": "2026-09-10",
  "number_of_travelers": 4,
  "product_id": "pkg_123",
  "article_id": "article_456",
  "landing_page_id": "lp_789",
  "source": "website",
  "message": "I would like to request a quotation."
}
```

Field aktual mengikuti business requirements.

---

# 44. LEAD SOURCE ATTRIBUTION

Jika inquiry berasal dari article:

```text
source = website
source_type = article
source_id = article_id
```

Jika dari landing page:

```text
source_type = landing_page
source_id = landing_page_id
```

Jika dari product:

```text
source_type = product
source_id = product_id
```

---

# 45. ARTICLE → PRODUCT API

Article dapat menyimpan product references.

Contoh:

```text
GET /articles/{id}
```

Response dapat menyediakan:

```json
{
  "id": "article_123",
  "title": "Panduan Liburan Batam",
  "products": [
    {
      "id": "pkg_001",
      "name": "Batam 3D2N",
      "url": "/packages/batam-3d2n"
    }
  ]
}
```

Hanya public-safe product data yang boleh dikembalikan ke public client.

---

# 46. PRODUCT API

Minimal:

```text
GET /products
GET /products/{id}
POST /products
PATCH /products/{id}
POST /products/{id}/publish
POST /products/{id}/unpublish
```

Public endpoint:

```text
GET /public/v1/products
GET /public/v1/products/{slug}
```

---

# 47. PUBLIC PRODUCT API

Public product endpoint hanya mengembalikan:

```text
name
slug
description
image
duration
public_price
currency
highlights
included
excluded
public_itinerary
availability
cta
```

Tidak boleh mengembalikan:

```text
cost
margin
supplier_cost
commission
internal_notes
```

---

# 48. PRODUCT PUBLISHING

Product harus memiliki state.

Minimal:

```text
DRAFT
REVIEW
APPROVED
PUBLISHED
UNPUBLISHED
ARCHIVED
```

Public API hanya mengembalikan:

```text
PUBLISHED
```

---

# 49. ARTICLE API

Internal:

```text
GET    /articles
POST   /articles
GET    /articles/{id}
PATCH  /articles/{id}
POST   /articles/{id}/submit-review
POST   /articles/{id}/approve
POST   /articles/{id}/publish
POST   /articles/{id}/unpublish
POST   /articles/{id}/archive
```

Public:

```text
GET /public/v1/articles
GET /public/v1/articles/{slug}
```

---

# 50. LANDING PAGE API

Internal:

```text
GET    /landing-pages
POST   /landing-pages
GET    /landing-pages/{id}
PATCH  /landing-pages/{id}
POST   /landing-pages/{id}/publish
POST   /landing-pages/{id}/unpublish
```

Public:

```text
GET /public/v1/landing-pages/{slug}
```

---

# 51. CMS PRODUCT REFERENCE

Article dan landing page harus menyimpan reference.

Contoh:

```json
{
  "type": "product",
  "product_id": "pkg_123"
}
```

Jangan menyimpan duplicate commercial product data sebagai source of truth.

---

# 52. PRODUCT REFERENCE VALIDATION

Saat content dipublish, backend harus memeriksa:

```text
Product exists
+
Product is public
+
Reference is valid
```

Jika tidak valid:

```text
PRODUCT_REFERENCE_INVALID
```

atau warning sesuai business rule.

---

# 53. CONTENT RENDERING

Public API harus dapat mengembalikan structured content atau sanitized HTML sesuai frontend architecture.

Contoh block:

```json
{
  "type": "product",
  "product_id": "pkg_123"
}
```

Frontend kemudian mengambil public product representation.

---

# 54. RENDERING SECURITY

Rich text/content tidak boleh langsung dipercaya.

Backend harus melakukan:

- Sanitization
- Validation
- Safe URL handling
- Safe HTML policy

---

# 55. PUBLIC CONTENT API

Public API hanya mengembalikan content yang:

```text
Published
+
Public
+
Within publish window
```

Jika content memiliki scheduled publish:

```text
current_time >= publish_at
```

Jika memiliki unpublish:

```text
current_time < unpublish_at
```

---

# 56. CONTENT SCHEDULING

Scheduler harus menggunakan business timezone yang telah ditentukan.

API tidak boleh menginterpretasikan waktu secara berbeda antara:

```text
CMS
Backend
Database
Frontend
```

---

# 57. MEDIA API

Minimal:

```text
POST /media
GET /media/{id}
DELETE /media/{id}
```

Public media menggunakan access strategy yang aman.

---

# 58. FILE UPLOAD

File upload harus memvalidasi:

```text
MIME type
Extension
Size
Filename
User permission
Storage policy
```

Jangan mempercayai extension saja.

---

# 59. FILE STORAGE

File dapat disimpan pada object storage.

Contoh architecture:

```text
Frontend
   ↓
API
   ↓
Signed Upload / Upload Service
   ↓
Object Storage
   ↓
Database Metadata
```

---

# 60. SIGNED URL

Untuk private file gunakan signed URL atau authorization-aware access.

Contoh:

```text
Payment Proof
Customer Document
Internal Vendor Document
```

Public URL tidak boleh digunakan untuk sensitive files.

---

# 61. FILE VIRUS / MALWARE SCANNING

Jika infrastructure memungkinkan, file upload harus melalui malware scanning sebelum dianggap trusted.

---

# 62. EMAIL INTEGRATION

Email digunakan untuk:

```text
Quotation
Invoice
Booking Confirmation
Payment Notification
Itinerary
Customer Notification
Internal Notification
```

Email provider harus dapat diganti tanpa mengubah business logic.

---

# 63. EMAIL SERVICE ABSTRACTION

Gunakan service:

```text
EmailService
```

bukan memanggil provider langsung dari controller.

Flow:

```text
Business Event
    ↓
Notification Service
    ↓
Email Service
    ↓
Email Provider
```

---

# 64. EMAIL TEMPLATE

Template harus mendukung:

```text
Template ID
Locale
Variables
Subject
Body
```

Contoh:

```text
quotation.sent
invoice.issued
booking.confirmed
payment.received
```

---

# 65. EMAIL FAILURE

Jika email gagal:

```text
Business transaction
```

tidak otomatis dianggap gagal kecuali business rule memang mengharuskannya.

Contoh:

```text
Quotation saved successfully
Email delivery failed
```

Status:

```text
Quotation = SENT
Email = FAILED
```

kemudian retry.

---

# 66. WHATSAPP INTEGRATION

WhatsApp dapat digunakan untuk:

- Lead notification
- Sales follow-up
- Quotation link
- Booking confirmation
- Payment reminder
- Trip reminder

Provider harus melalui abstraction layer.

---

# 67. WHATSAPP TEMPLATE

Template harus:

```text
Approved / permitted by provider
Parameterized
Versioned
Logged
```

Contoh variables:

```text
customer_name
quotation_number
booking_number
payment_amount
trip_date
secure_link
```

---

# 68. WHATSAPP SECURITY

Jangan mengirim:

```text
Internal Notes
Supplier Cost
Margin
Sensitive Financial Data
```

kecuali secara eksplisit diperlukan dan diizinkan.

---

# 69. NOTIFICATION SERVICE

Notification service dapat mengirim:

```text
Email
WhatsApp
In-app Notification
```

Business event tidak boleh mengetahui detail provider.

---

# 70. EVENT-DRIVEN ARCHITECTURE

System dapat menggunakan domain events.

Contoh:

```text
LeadCreated
QuotationSent
QuotationAccepted
BookingCreated
BookingConfirmed
PaymentProofUploaded
PaymentVerified
InvoiceIssued
ArticlePublished
ProductPublished
LandingPagePublished
```

---

# 71. EVENT STRUCTURE

Event minimal memiliki:

```json
{
  "event_id": "evt_123",
  "event_type": "payment.verified",
  "occurred_at": "2026-08-08T10:00:00Z",
  "actor_id": "user_123",
  "resource_type": "payment",
  "resource_id": "pay_123"
}
```

---

# 72. EVENT ID

Setiap event memiliki unique:

```text
event_id
```

Tujuannya mencegah duplicate processing.

---

# 73. EVENT CONSUMERS

Contoh:

```text
PaymentVerified
      ↓
Notification Service
      ↓
Customer notification

PaymentVerified
      ↓
Finance Reporting

BookingConfirmed
      ↓
Operations notification

ArticlePublished
      ↓
Cache invalidation
      ↓
Search indexing
```

---

# 74. WEBHOOK

Webhook digunakan untuk external system yang mengirim event ke ERP.

Contoh:

```text
Payment Provider
      ↓
Webhook
      ↓
ERP
```

---

# 75. WEBHOOK SECURITY

Webhook harus memvalidasi:

- Signature
- Timestamp
- Provider
- Event ID
- Payload
- Replay protection

---

# 76. WEBHOOK IDEMPOTENCY

Jika webhook yang sama diterima dua kali:

```text
Webhook Event ID = X
```

event kedua tidak boleh menghasilkan transaction kedua.

---

# 77. WEBHOOK LOGGING

Setiap webhook dicatat:

```text
Provider
Event ID
Received At
Signature Status
Processing Status
Error
Retry Count
```

---

# 78. PAYMENT PROVIDER INTEGRATION

Jika payment gateway digunakan:

```text
Customer
   ↓
Payment Request
   ↓
Payment Provider
   ↓
Payment Result
   ↓
Webhook
   ↓
ERP
```

Frontend redirect/result tidak boleh menjadi satu-satunya authority payment success.

---

# 79. PAYMENT WEBHOOK AUTHORITY

Final payment status harus ditentukan berdasarkan trusted provider callback/webhook atau verification mechanism yang ditentukan integration.

---

# 80. PAYMENT IDEMPOTENCY

Payment creation harus mendukung idempotency.

Contoh header:

```text
Idempotency-Key
```

Jika request dikirim ulang dengan key yang sama:

```text
Do not create duplicate payment.
```

---

# 81. FINANCIAL TRANSACTION SAFETY

Financial endpoint harus:

- Transactional
- Auditable
- Idempotent where applicable
- Permission-aware
- Concurrency-safe

---

# 82. REFUND INTEGRATION

Refund dapat menggunakan:

```text
POST /refunds
POST /refunds/{id}/approve
POST /refunds/{id}/process
```

Final endpoint mengikuti module design.

Refund tidak boleh diproses hanya berdasarkan frontend status.

---

# 83. AVAILABILITY API

Operations dapat membutuhkan:

```text
GET /availability
```

Filter:

```text
date
resource_type
resource_id
destination
```

Availability harus berasal dari backend source of truth.

---

# 84. VENDOR INTEGRATION

Jika vendor integration diperlukan, gunakan abstraction:

```text
VendorService
```

bukan mengikat seluruh business logic ke provider tertentu.

---

# 85. EXTERNAL SERVICE ABSTRACTION

External provider harus dibungkus service interface.

Contoh:

```text
PaymentService
EmailService
WhatsAppService
StorageService
AnalyticsService
```

Dengan demikian provider dapat diganti.

---

# 86. RETRY POLICY

Retry hanya untuk error yang retryable.

Contoh retryable:

```text
Network timeout
Temporary provider failure
HTTP 502
HTTP 503
```

Tidak retry otomatis untuk:

```text
Validation Error
Permission Error
Invalid Payment
Invalid Data
```

---

# 87. EXPONENTIAL BACKOFF

External API retry sebaiknya menggunakan exponential backoff.

Jangan melakukan infinite retry.

---

# 88. DEAD LETTER / FAILED JOB

Jika asynchronous job terus gagal, job dipindahkan ke failed/dead-letter state.

Admin dapat melihat:

```text
Job
Error
Attempts
Last Attempt
Next Action
```

---

# 89. ASYNCHRONOUS JOBS

Gunakan background jobs untuk:

- Email
- WhatsApp
- PDF generation
- Large export
- Image processing
- Analytics processing
- Search indexing
- Scheduled publishing

---

# 90. SYNCHRONOUS TRANSACTION

Jangan membuat transaksi bisnis utama bergantung pada external network request yang tidak diperlukan.

Contoh:

```text
Create Booking
```

harus selesai di database sebelum notification dikirim jika notification tidak menjadi requirement transaksi.

---

# 91. API RATE LIMITING

Rate limit wajib untuk public-sensitive endpoints.

Contoh:

```text
Login
Public Lead
Password Reset
OTP
Payment
Webhook
Search
```

---

# 92. PUBLIC API ABUSE PROTECTION

Public lead endpoint harus memiliki:

- Rate limit
- Validation
- CAPTCHA/anti-bot jika diperlukan
- Honeypot jika sesuai
- Duplicate detection
- Abuse monitoring

---

# 93. CORS

CORS harus membatasi origin yang diizinkan.

Jangan menggunakan wildcard secara default untuk authenticated APIs.

---

# 94. CSRF

Jika authentication menggunakan cookie/session, CSRF protection wajib diterapkan sesuai architecture.

---

# 95. XSS PROTECTION

User-generated content harus disanitasi.

Terutama:

```text
Article
Comment
Customer Notes
Lead Message
Vendor Notes
```

---

# 96. SQL INJECTION

Database access harus menggunakan parameterized queries/ORM/query builder yang aman.

Jangan concatenating raw user input ke SQL.

---

# 97. SECRET MANAGEMENT

API key:

- Payment secret
- Email credential
- WhatsApp token
- Storage credential
- Database password

tidak boleh berada di:

```text
Frontend source code
Public repository
Client bundle
Public API response
```

Gunakan environment/secret management.

---

# 98. ENVIRONMENT

Minimal:

```text
Development
Staging
Production
```

Credential antar environment harus terpisah.

---

# 99. API DOCUMENTATION

API harus memiliki dokumentasi machine-readable jika memungkinkan.

Rekomendasi:

```text
OpenAPI
```

Dokumentasi mencakup:

- Endpoint
- Method
- Authentication
- Request
- Response
- Error
- Example
- Permission

---

# 100. API DEPRECATION

Endpoint deprecated harus memiliki:

```text
Deprecation Notice
Migration Guide
Replacement Endpoint
Sunset Date
```

jika applicable.

---

# 101. BACKWARD COMPATIBILITY

Perubahan response yang memecahkan client lama harus dihindari dalam minor version.

Jangan sembarangan:

- Rename field
- Delete field
- Change type
- Change semantic

tanpa migration strategy.

---

# 102. API AUDIT

Sensitive operations harus dicatat:

```text
Actor
Action
Resource
Timestamp
IP if policy allows
Request ID
Result
Reason
```

Contoh:

```text
Payment verified
Invoice voided
Booking cancelled
Refund approved
Article published
Product unpublished
```

---

# 103. AUDIT VS APPLICATION LOG

Audit log:

```text
Business action
```

Application log:

```text
Technical execution
```

Keduanya tidak boleh dicampur sebagai satu-satunya logging mechanism.

---

# 104. OBSERVABILITY

System harus menyediakan:

```text
Logs
Metrics
Errors
Request ID
Job status
Integration status
```

---

# 105. INTEGRATION MONITORING

Management/admin dapat mengetahui jika:

```text
Email provider unavailable
Payment provider unavailable
WhatsApp provider unavailable
Storage unavailable
Webhook failing
```

---

# 106. HEALTH CHECK

API menyediakan health endpoints sesuai infrastructure.

Contoh:

```text
/health
/ready
```

Health check tidak boleh membocorkan secret atau internal configuration.

---

# 107. EXTERNAL API TIMEOUT

Setiap external API request harus memiliki timeout.

Jangan menunggu tanpa batas.

---

# 108. EXTERNAL API CIRCUIT BREAKER

Jika provider terus gagal, system dapat menggunakan circuit breaker agar kegagalan tidak menyebar ke seluruh application.

---

# 109. CACHE

Cache dapat digunakan untuk:

```text
Public Products
Published Articles
Landing Pages
Destination
FAQ
```

Jangan cache data yang membutuhkan real-time accuracy tanpa strategy yang jelas.

---

# 110. CACHE INVALIDATION

Cache harus di-invalidate ketika:

```text
Product Published
Product Updated
Article Published
Article Updated
Landing Page Published
Landing Page Updated
```

---

# 111. SEARCH INDEX

Jika search engine digunakan:

```text
Content Published
      ↓
Search Index
```

Unpublished content harus dihapus atau ditandai unavailable dari public search.

---

# 112. SEO INDEXING

CMS publish event dapat memicu:

```text
Cache Invalidation
Search Index
Sitemap Update
```

---

# 113. SITEMAP

Public content yang published dapat masuk sitemap.

Contoh:

```text
Articles
Products
Destinations
Landing Pages
```

Unpublished content tidak boleh masuk public sitemap.

---

# 114. CANONICAL URL

API/public content harus menyediakan canonical information jika diperlukan.

---

# 115. ARTICLE CONTENT API FLOW

Flow:

```text
Content Staff
      ↓
POST /articles
      ↓
Draft
      ↓
PATCH /articles/{id}
      ↓
Submit Review
      ↓
Approve
      ↓
Publish
      ↓
Public API
      ↓
Website
```

---

# 116. ARTICLE PRODUCT BLOCK FLOW

Flow:

```text
Article Editor
      ↓
Search Product
      ↓
Select Product
      ↓
Save product_id
      ↓
Validate product
      ↓
Publish Article
      ↓
Public Article API
      ↓
Product Block
      ↓
Product Page
```

---

# 117. LANDING PAGE LEAD FLOW

Flow:

```text
Visitor
      ↓
Landing Page
      ↓
Lead Form
      ↓
POST /public/v1/leads
      ↓
Lead Validation
      ↓
Lead Created
      ↓
CRM
      ↓
Assignment
      ↓
Follow-up
```

---

# 118. ARTICLE LEAD FLOW

Flow:

```text
Visitor
      ↓
Article
      ↓
Product Block
      ↓
Product Page
      ↓
CTA
      ↓
Inquiry
      ↓
Lead
      ↓
CRM
```

Attribution harus dipertahankan jika memungkinkan.

---

# 119. PRODUCT CTA FLOW

```text
Product Page
      ↓
Request Quote
      ↓
Lead Form
      ↓
Public Lead API
      ↓
CRM
      ↓
Sales
```

---

# 120. QUOTATION COMMUNICATION FLOW

```text
Quotation Created
      ↓
POST /quotations/{id}/send
      ↓
Quotation State = SENT
      ↓
Notification Event
      ↓
Email / WhatsApp
      ↓
Customer
```

Delivery failure tidak otomatis mengubah quotation state kecuali business rule menentukan demikian.

---

# 121. CUSTOMER ACCEPTANCE FLOW

```text
Customer
      ↓
Quotation
      ↓
Accept
      ↓
POST /quotations/{id}/accept
      ↓
Backend Validation
      ↓
Quotation = ACCEPTED
      ↓
Event
      ↓
Sales Notification
      ↓
Booking Conversion
```

---

# 122. BOOKING CREATION FLOW

```text
Accepted Quotation
      ↓
Convert to Booking
      ↓
Backend
      ↓
Booking Created
      ↓
Package Snapshot
      ↓
Payment Terms
      ↓
Invoice
      ↓
Operations
```

---

# 123. PAYMENT PROOF FLOW

```text
Customer/Sales
      ↓
Upload Proof
      ↓
File Storage
      ↓
Payment Proof Record
      ↓
Payment = PROOF_UPLOADED
      ↓
Finance Notification
      ↓
Finance Review
      ↓
Verify / Reject
```

---

# 124. PAYMENT VERIFICATION FLOW

```text
Finance
      ↓
POST /payments/{id}/verify
      ↓
Permission Check
      ↓
Business Validation
      ↓
Database Transaction
      ↓
Payment = VERIFIED
      ↓
Invoice Balance Updated
      ↓
Booking Payment Status Updated
      ↓
PaymentVerified Event
      ↓
Notifications
```

---

# 125. CONTENT PUBLISHING FLOW

```text
Author
 ↓
Draft
 ↓
Review
 ↓
Approve
 ↓
Publish
 ↓
Cache Invalidation
 ↓
Search Index
 ↓
Public Website
```

---

# 126. API TRANSACTION BOUNDARY

Business transaction harus menentukan atomic operation.

Contoh payment verification:

```text
Payment Verified
+
Invoice Balance Updated
+
Booking Payment Status Updated
```

harus konsisten.

Jika salah satu gagal, transaction harus rollback atau menggunakan compensating strategy yang eksplisit.

---

# 127. CONCURRENCY CONTROL

Untuk resource sensitif gunakan:

- Database transaction
- Optimistic locking
- Pessimistic locking
- Unique constraint
- Idempotency

sesuai kebutuhan.

---

# 128. DUPLICATE PREVENTION

System harus mencegah duplicate untuk operation tertentu.

Contoh:

```text
Duplicate payment
Duplicate invoice
Duplicate booking conversion
Duplicate webhook
Duplicate lead submission
```

Strategy dapat menggunakan:

```text
Unique Constraint
Idempotency Key
Business Reference
Event ID
```

---

# 129. API SECURITY PRINCIPLE

Tidak boleh mengandalkan:

```text
Frontend validation
Hidden button
Hidden route
Obscure ID
```

sebagai security.

Security selalu di backend.

---

# 130. PUBLIC API SECURITY

Public endpoint harus:

- Minimal data
- Rate limited
- Validated
- Sanitized
- Abuse protected
- Logged appropriately

---

# 131. CUSTOMER API SECURITY

Customer API harus:

- Authenticated
- Ownership checked
- Permission checked
- Sensitive fields filtered

---

# 132. ADMIN API SECURITY

Admin endpoint membutuhkan:

- Strong authentication
- Permission
- Audit
- Additional confirmation untuk sensitive action

---

# 133. CONTENT API SECURITY

CMS endpoint harus memvalidasi:

```text
Role
Permission
Content ownership
Workflow state
Publishing permission
```

---

# 134. PUBLIC CONTENT SANITIZATION

Public content tidak boleh mengeksekusi arbitrary JavaScript dari editor.

---

# 135. API FILE ACCESS SECURITY

Sensitive file:

```text
Payment Proof
Invoice Internal Copy
Vendor Document
Customer Document
```

harus memiliki authorization check.

---

# 136. API DATA MINIMIZATION

Endpoint hanya mengembalikan field yang diperlukan.

Contoh customer public endpoint tidak boleh mengembalikan:

```text
internal_notes
margin
supplier_data
commission
```

---

# 137. DTO / RESPONSE MODEL

Internal database model tidak boleh otomatis diekspos sebagai API response.

Gunakan:

```text
Entity
↓
DTO / Serializer
↓
API Response
```

Tujuannya:

- Security
- Stability
- Versioning
- Data minimization

---

# 138. INTERNAL VS PUBLIC API

Pisahkan secara jelas:

```text
Internal API
/public API
/customer API
```

Public API tidak boleh menggunakan response model internal secara langsung.

---

# 139. API CONTRACT TESTING

API contract harus diuji agar frontend dan backend tetap sinkron.

Test mencakup:

```text
Request schema
Response schema
Required fields
Error codes
Authentication
Permission
```

---

# 140. INTEGRATION TESTING

Minimal test:

```text
Website → Lead API
Lead → CRM
CRM → Follow-up
Quotation → Notification
Quotation → Booking
Payment → Finance
Payment → Invoice
Article → Product
Article → Public Website
Landing Page → CRM
```

---

# 141. FAILURE SCENARIOS

System harus diuji untuk:

```text
Payment provider down
Email provider down
WhatsApp provider down
Storage failure
Webhook duplicate
Network timeout
Database conflict
Unauthorized request
Expired session
Invalid product
Unpublished product
Invalid content reference
```

---

# 142. GRACEFUL DEGRADATION

Jika external service gagal:

```text
Core business transaction
```

harus tetap berjalan jika service tersebut bukan mandatory dependency.

Contoh:

```text
Booking created
Email failed
```

Booking tetap dapat dibuat dan email masuk retry queue.

---

# 143. CRITICAL DEPENDENCY

Jika external service memang mandatory untuk transaksi, backend harus secara eksplisit menentukan:

```text
Transaction Failed
```

bukan memberikan false success.

---

# 144. API DOCUMENTATION EXAMPLE

Setiap endpoint minimal mendokumentasikan:

```text
Purpose
Method
URL
Authentication
Permission
Request
Response
Errors
Business Rules
Idempotency
Side Effects
```

---

# 145. SIDE EFFECT DOCUMENTATION

Contoh:

```text
POST /quotations/{id}/send
```

Side effects:

```text
Quotation status changes to SENT
Activity created
Notification event generated
Email job created
```

---

# 146. API SIDE EFFECT PRINCIPLE

Side effect harus:

- Explicit
- Traceable
- Retry-safe
- Idempotent jika diperlukan

---

# 147. INTEGRATION CONFIGURATION

External integrations harus configurable melalui environment/configuration.

Contoh:

```text
PAYMENT_PROVIDER
EMAIL_PROVIDER
WHATSAPP_PROVIDER
STORAGE_PROVIDER
ANALYTICS_PROVIDER
```

---

# 148. NO PROVIDER LOCK-IN

Business logic tidak boleh tersebar di provider-specific code.

Gunakan adapter:

```text
PaymentService
 ├── ProviderAAdapter
 └── ProviderBAdapter
```

---

# 149. API ENVIRONMENT SAFETY

Development dan staging tidak boleh mengirim transaksi nyata tanpa explicit configuration.

Contoh:

```text
Payment Sandbox
Email Test Mode
WhatsApp Sandbox
```

---

# 150. PRODUCTION SAFETY

Production environment harus:

- Menggunakan production credentials
- HTTPS
- Secure cookies
- Secret management
- Logging
- Monitoring
- Backup
- Rate limiting
- Audit

---

# 151. API CHANGE MANAGEMENT

Setiap perubahan API harus mengevaluasi:

```text
Frontend impact
Mobile impact
Public website impact
Customer portal impact
External integration impact
Database migration
Backward compatibility
```

---

# 152. DATABASE MIGRATION

API deployment yang membutuhkan database migration harus memiliki:

```text
Migration
Backward compatibility strategy
Rollback strategy
```

---

# 153. FEATURE FLAGS

Feature baru yang berisiko dapat menggunakan feature flag.

Contoh:

```text
NEW_CMS_EDITOR
NEW_PAYMENT_PROVIDER
NEW_LANDING_PAGE_BUILDER
```

---

# 154. API PERFORMANCE

API harus menghindari:

```text
N+1 query
Unbounded list
Large payload
Unnecessary joins
Repeated external calls
```

---

# 155. PUBLIC API PERFORMANCE

Public website membutuhkan:

- Caching
- Pagination
- Optimized payload
- Image optimization
- CDN jika tersedia

---

# 156. INTERNAL API PERFORMANCE

ERP harus tetap responsif untuk:

- Large customer list
- Large booking list
- Reports
- CRM activity
- Content library

Gunakan server-side filtering/pagination.

---

# 157. REPORTING API

Report endpoint harus dipisahkan dari transaction endpoint jika query sangat berat.

Contoh:

```text
GET /reports/sales
GET /reports/finance
GET /reports/operations
GET /reports/content
```

Jika report berat, gunakan asynchronous generation.

---

# 158. EXPORT API

Large export:

```text
POST /exports
```

kemudian:

```text
GET /exports/{id}
```

Status:

```text
QUEUED
PROCESSING
COMPLETED
FAILED
```

---

# 159. PDF GENERATION

PDF generation dapat dilakukan asynchronously.

Contoh:

```text
POST /quotations/{id}/pdf
```

Response dapat:

```text
job_id
```

kemudian frontend memonitor status.

---

# 160. API EVENT NAMING

Event naming harus konsisten.

Rekomendasi:

```text
resource.action
```

Contoh:

```text
lead.created
quotation.sent
quotation.accepted
booking.confirmed
payment.proof_uploaded
payment.verified
invoice.issued
article.published
product.published
landing_page.published
```

---

# 161. EVENT VERSIONING

Jika event contract berubah secara breaking:

```text
event_type
event_version
```

dapat digunakan.

Contoh:

```text
payment.verified
version: 1
```

---

# 162. EVENT DELIVERY

Event delivery dapat:

```text
At least once
```

maka consumer harus idempotent.

Exactly-once tidak boleh diasumsikan tanpa infrastructure yang benar-benar menjaminnya.

---

# 163. EVENT RETENTION

Event/audit retention mengikuti:

- Business requirement
- Legal requirement
- Storage policy

---

# 164. INTEGRATION LOG RETENTION

Integration logs harus memiliki retention policy dan tidak menyimpan secrets.

---

# 165. PRIVACY

API harus mengikuti privacy principle:

- Data minimization
- Purpose limitation
- Access control
- Secure storage
- Controlled retention

---

# 166. PII

PII seperti:

```text
Name
Phone
Email
Address
Passport information if collected
```

harus diperlakukan sebagai sensitive customer data.

---

# 167. PII IN LOGS

Jangan log full sensitive data jika tidak diperlukan.

Contoh:

Buruk:

```text
Full payment card data
Full password
Full authentication token
```

Yang benar:

```text
Masked identifier
Reference ID
Request ID
```

---

# 168. TOKEN SECURITY

Access token, refresh token, API keys, webhook secrets tidak boleh:

- Masuk log
- Masuk frontend bundle
- Masuk public API response
- Masuk error message

---

# 169. API CHECKLIST

Sebelum endpoint dianggap selesai:

```text
[ ] Authentication
[ ] Authorization
[ ] Validation
[ ] Business Rule
[ ] Error Handling
[ ] Response Contract
[ ] Audit if required
[ ] Logging
[ ] Idempotency if required
[ ] Rate Limiting if public
[ ] Tests
[ ] Documentation
```

---

# 170. PUBLIC WEBSITE CHECKLIST

Sebelum feature public website dianggap selesai:

```text
[ ] Public-safe API
[ ] Published state check
[ ] SEO
[ ] Responsive
[ ] Error state
[ ] Loading state
[ ] Cache strategy
[ ] Image optimization
[ ] CTA
[ ] Lead capture
[ ] CRM attribution
```

---

# 171. ARTICLE CHECKLIST

Artikel siap publish jika:

```text
[ ] Title
[ ] Slug
[ ] Content
[ ] Featured image
[ ] Category
[ ] SEO title
[ ] Meta description
[ ] Valid links
[ ] Product references validated
[ ] CTA
[ ] Mobile preview
[ ] Approval completed
```

---

# 172. LANDING PAGE CHECKLIST

Landing page siap publish jika:

```text
[ ] Hero
[ ] Clear value proposition
[ ] CTA
[ ] Product reference valid
[ ] Lead form
[ ] CRM integration
[ ] SEO
[ ] Mobile layout
[ ] Preview
[ ] Approval
```

---

# 173. PRODUCT IN ARTICLE CHECKLIST

Product block siap publish jika:

```text
[ ] Product exists
[ ] Product is public/publishable
[ ] Product reference valid
[ ] Public data only
[ ] Product URL valid
[ ] CTA valid
[ ] No duplicate product data
```

---

# 174. CRM LEAD CHECKLIST

Website lead dianggap berhasil jika:

```text
[ ] Lead validated
[ ] Lead created
[ ] Source stored
[ ] Product stored if applicable
[ ] Article stored if applicable
[ ] Landing page stored if applicable
[ ] Assignment workflow triggered
[ ] Follow-up created if required
[ ] Sales notified
```

---

# 175. END-TO-END INTEGRATION

Critical business flow:

```text
WEBSITE
   ↓
ARTICLE
   ↓
PRODUCT
   ↓
CTA
   ↓
LEAD API
   ↓
CRM
   ↓
FOLLOW-UP
   ↓
QUOTATION
   ↓
CUSTOMER ACCEPTANCE
   ↓
BOOKING
   ↓
INVOICE
   ↓
PAYMENT
   ↓
FINANCE VERIFICATION
   ↓
OPERATIONS
   ↓
TRIP
   ↓
COMPLETION
   ↓
FOLLOW-UP
```

System harus dirancang agar setiap transition dapat dilacak.

---

# 176. SOURCE OF TRUTH

Untuk masing-masing aspek:

```text
Business Direction
→ 01_BUSINESS_FOUNDATION.md

Business Process
→ 02_BUSINESS_PROCESS_AND_SOP.md

Business Rules
→ 03_BUSINESS_RULES_AND_POLICY.md

System Requirements
→ 04_PRD_SYSTEM_REQUIREMENTS.md

Modules
→ 05_MODULE_SPECIFICATIONS.md

Database
→ 06_DATA_MODEL_AND_DATABASE_SCHEMA.md

Roles & Permissions
→ 07_USER_ROLES_PERMISSIONS_MATRIX.md

Workflow
→ 08_WORKFLOW_STATE_MACHINE.md

UI / UX / Frontend / CMS
→ 09_UI_UX_AND_FRONTEND_SPECIFICATION.md

API & Integration
→ 10_API_AND_INTEGRATION_SPECIFICATION.md
```

Jika terjadi konflik:

> Business rules dan system requirements tetap menjadi authority untuk business behavior.

API tidak boleh menciptakan business rule baru yang bertentangan dengan dokumen sebelumnya.

---

# 177. API IMPLEMENTATION PRINCIPLE

Developer harus:

```text
Read Specification
      ↓
Define Contract
      ↓
Validate Permission
      ↓
Implement Business Logic
      ↓
Implement API
      ↓
Implement Tests
      ↓
Document
      ↓
Integrate Frontend
```

Jangan:

```text
Build endpoint first
then invent business rules later
```

---

# 178. FINAL API PRINCIPLE

API Batam Travelling ERP harus menjadi:

```text
Secure
Predictable
Consistent
Auditable
Permission-aware
Business-rule-aware
Integration-ready
Scalable
Observable
```

---

# 179. FINAL INTEGRATION PRINCIPLE

External services adalah pendukung business system, bukan pengganti business system.

```text
ERP
 │
 ├── Payment Provider
 ├── Email Provider
 ├── WhatsApp Provider
 ├── Storage Provider
 └── Analytics
```

ERP tetap menjadi source of truth untuk business state.

---

# 180. FINAL WEBSITE–ERP PRINCIPLE

Website dan ERP harus dianggap sebagai satu business ecosystem:

```text
                    ┌──────────────┐
                    │    WEBSITE   │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              ↓            ↓            ↓
           Article      Product      Landing Page
              │            │            │
              └────────────┼────────────┘
                           ↓
                          CTA
                           ↓
                         LEAD
                           ↓
                          CRM
                           ↓
                       FOLLOW-UP
                           ↓
                       QUOTATION
                           ↓
                        BOOKING
                           ↓
                        PAYMENT
                           ↓
                       OPERATIONS
                           ↓
                          TRIP
                           ↓
                       CUSTOMER
```

---

# 181. DEFINITION OF DONE

Dokumen API & Integration dianggap terimplementasi apabila:

```text
[ ] Authentication implemented
[ ] Authorization implemented
[ ] API versioning implemented
[ ] Standard response implemented
[ ] Error contract implemented
[ ] Validation implemented
[ ] Pagination implemented
[ ] Filtering implemented
[ ] Logging implemented
[ ] Audit implemented where required
[ ] Idempotency implemented where required
[ ] Rate limiting implemented where required
[ ] File upload secured
[ ] Public API separated from internal API
[ ] CMS API implemented
[ ] Product API implemented
[ ] Article API implemented
[ ] Landing Page API implemented
[ ] Lead API implemented
[ ] CRM integration implemented
[ ] Payment integration abstraction implemented
[ ] Email integration abstraction implemented
[ ] WhatsApp integration abstraction implemented
[ ] Webhook security implemented
[ ] Event handling implemented
[ ] Retry strategy implemented
[ ] Integration monitoring implemented
[ ] API documentation implemented
[ ] Critical E2E tests implemented
```

---

# 182. NEXT DOCUMENT

Dokumen berikutnya:

```text
11_SECURITY_AUTHENTICATION_AND_AUDIT_SPECIFICATION.md
```

Dokumen tersebut akan memperdalam:

- Authentication
- Authorization
- RBAC
- Resource ownership
- Session management
- MFA jika digunakan
- Password policy
- Security architecture
- Audit trail
- Data privacy
- File security
- API security
- Admin security
- Customer security
- Incident logging
- Security checklist

---

# END OF DOCUMENT