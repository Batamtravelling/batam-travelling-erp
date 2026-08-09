# BATAM TRAVELLING ERP
# SECURITY, AUTHENTICATION & AUDIT SPECIFICATION

**File Name:** `11_SECURITY_AUTHENTICATION_AND_AUDIT_SPECIFICATION.md`  
**Document Number:** 11  
**Version:** 1.0  
**Status:** SECURITY BASELINE  
**Project:** Batam Travelling ERP  
**Last Updated:** 2026-08-08

---

# 1. PURPOSE

Dokumen ini menetapkan standar keamanan untuk seluruh Batam Travelling ERP, termasuk:

- Authentication
- Authorization
- RBAC
- Permission
- Resource ownership
- Session management
- Password security
- MFA
- API security
- Frontend security
- Customer portal security
- Admin security
- File security
- Data protection
- Privacy
- Audit trail
- Security logging
- Webhook security
- Integration security
- Rate limiting
- Abuse prevention
- Incident handling
- Security testing

Dokumen ini menjadi acuan utama implementasi security system.

---

# 2. SECURITY PRINCIPLE

Prinsip utama:

> Never trust the client.

Frontend tidak boleh dianggap trusted.

Semua keputusan security harus dilakukan oleh backend.

Security tidak boleh bergantung pada:

- Hidden button
- Hidden route
- Frontend validation
- Obscure URL
- Obscure ID
- Disabled UI element
- Client-side role checking

---

# 3. SECURITY OBJECTIVES

System harus menjaga:

```text
Confidentiality
Integrity
Availability
Authenticity
Accountability
Traceability
```

---

# 4. SECURITY ARCHITECTURE

Security layer:

```text
User
 ↓
TLS / HTTPS
 ↓
Authentication
 ↓
Session / Token Validation
 ↓
Authorization
 ↓
Permission
 ↓
Resource Ownership
 ↓
Business Rule
 ↓
Database
```

Tidak boleh melewati layer tersebut.

---

# 5. TRUST BOUNDARIES

System memiliki beberapa trust boundary:

```text
Public Internet
      ↓
Public Website
      ↓
API
      ↓
Authenticated Application
      ↓
Internal ERP
      ↓
Database
```

External services berada di luar trust boundary:

```text
Payment Provider
Email Provider
WhatsApp Provider
Storage Provider
Analytics Provider
```

Semua external input harus dianggap untrusted.

---

# 6. USER TYPES

Security architecture mendukung minimal:

```text
Public Visitor
Customer
Sales
Finance
Operations
Content Staff
Manager
Administrator
System / Service Account
```

Role final mengikuti:

`07_USER_ROLES_PERMISSIONS_MATRIX.md`

---

# 7. AUTHENTICATION VS AUTHORIZATION

Authentication:

> Siapa user?

Authorization:

> Apa yang boleh user lakukan?

Contoh:

```text
Authentication
→ John adalah Sales User #123

Authorization
→ John boleh melihat lead
→ John boleh membuat quotation
→ John tidak boleh verify payment
```

---

# 8. AUTHENTICATION METHODS

System dapat menggunakan:

- Email + password
- Phone + OTP jika diperlukan
- Social login jika diperlukan
- Magic link jika diperlukan
- Service credentials untuk machine-to-machine integration

Metode final harus ditentukan berdasarkan deployment architecture.

---

# 9. PASSWORD POLICY

Jika password authentication digunakan:

Password harus:

- Tidak disimpan plaintext
- Di-hash dengan password hashing algorithm yang sesuai
- Tidak muncul di log
- Tidak dikirim melalui email
- Tidak dikembalikan oleh API

Rekomendasi:

```text
Argon2id
```

atau algorithm modern yang setara.

---

# 10. PASSWORD STORAGE

Database hanya menyimpan password hash.

Tidak boleh menyimpan:

```text
password_plaintext
```

Tidak boleh ada endpoint:

```text
GET /users/{id}/password
```

---

# 11. PASSWORD RESET

Password reset menggunakan one-time token.

Flow:

```text
Request Reset
 ↓
Generate Secure Token
 ↓
Store Hashed Token
 ↓
Send Reset Link
 ↓
User Opens Link
 ↓
Validate Token
 ↓
Set New Password
 ↓
Invalidate Token
 ↓
Invalidate Existing Sessions if required
```

---

# 12. RESET TOKEN SECURITY

Reset token harus:

- Cryptographically random
- Short-lived
- One-time use
- Stored securely
- Invalidated after use

Token tidak boleh disimpan plaintext jika architecture memungkinkan secure hashing.

---

# 13. LOGIN SECURITY

Login harus memiliki:

- Rate limiting
- Failed attempt monitoring
- Secure error message
- Session regeneration
- Brute-force protection

Jangan memberikan error:

```text
Email exists but password wrong
```

Gunakan message generik.

---

# 14. BRUTE FORCE PROTECTION

Repeated failed login dapat menyebabkan:

- Temporary throttling
- Progressive delay
- Account protection
- IP/device monitoring

Jangan langsung permanent lock tanpa recovery mechanism.

---

# 15. ACCOUNT LOCKOUT

Jika account lockout digunakan:

Lockout harus:

- Terbatas waktunya
- Dapat dipulihkan
- Diaudit
- Tidak menjadi alat denial-of-service yang mudah dieksploitasi

---

# 16. SESSION MANAGEMENT

Session harus memiliki:

- Secure identifier
- Expiration
- Idle timeout
- Absolute timeout jika diperlukan
- Logout invalidation
- Rotation setelah authentication

---

# 17. SESSION COOKIE

Jika menggunakan cookie:

Cookie harus mempertimbangkan:

```text
Secure
HttpOnly
SameSite
```

Session cookie tidak boleh accessible melalui JavaScript jika tidak diperlukan.

---

# 18. SESSION INVALIDATION

Session harus dapat di-invalidasi ketika:

- User logout
- Password changed
- Account disabled
- Security incident
- Admin forces logout
- Session expired

---

# 19. MULTI-FACTOR AUTHENTICATION

MFA direkomendasikan untuk:

- Administrator
- Finance
- Manager
- High-privilege users

MFA dapat menggunakan:

- Authenticator application
- WebAuthn/passkey
- OTP
- Provider-supported MFA

Metode final mengikuti infrastructure.

---

# 20. MFA RECOVERY

Recovery mechanism harus aman.

Recovery code:

- One-time
- Securely stored
- Not logged
- Regeneratable

Admin reset MFA harus diaudit.

---

# 21. PRIVILEGED ACCOUNT

Account dengan high privilege harus memiliki security tambahan.

Contoh:

```text
Administrator
Finance Manager
System Administrator
```

Sensitive action dapat membutuhkan:

- Re-authentication
- MFA
- Confirmation
- Reason
- Audit trail

---

# 22. SERVICE ACCOUNT

Machine-to-machine integration harus menggunakan service identity.

Service account:

- Tidak menggunakan human password
- Memiliki minimum permission
- Memiliki credential rotation
- Diaudit
- Tidak digunakan untuk login normal

---

# 23. API AUTHENTICATION

Protected API harus memvalidasi:

```text
Identity
Credential validity
Session/token status
Expiration
Revocation
```

---

# 24. API TOKEN SECURITY

Token tidak boleh:

- Masuk URL
- Masuk logs
- Masuk analytics
- Masuk error response
- Dimasukkan ke source code

Gunakan secure header/cookie sesuai architecture.

---

# 25. TOKEN EXPIRATION

Access credential harus memiliki expiration.

Refresh mechanism harus:

- Secure
- Rotatable
- Revocable
- Auditable

---

# 26. TOKEN ROTATION

Refresh token rotation direkomendasikan untuk meningkatkan security.

Jika token reuse terdeteksi, session family dapat dicabut sesuai security strategy.

---

# 27. API AUTHORIZATION

Setiap protected endpoint harus memeriksa:

```text
User
+
Role
+
Permission
+
Resource
+
Ownership
+
Business State
```

---

# 28. RBAC

Role-Based Access Control digunakan sebagai baseline.

Contoh:

```text
Sales
Finance
Operations
Content Staff
Manager
Administrator
Customer
```

Role tidak boleh menjadi satu-satunya authorization layer.

---

# 29. PERMISSION

Permission harus granular.

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
payment.verify

content.article.create
content.article.edit
content.article.publish
```

Permission final mengikuti Document 07.

---

# 30. LEAST PRIVILEGE

User hanya mendapatkan permission yang dibutuhkan untuk pekerjaannya.

Jangan memberikan:

```text
admin.*
```

jika user hanya membutuhkan:

```text
payment.view
payment.verify
```

---

# 31. SEPARATION OF DUTIES

Sensitive business actions harus mempertimbangkan separation of duties.

Contoh:

```text
Sales
→ Create quotation

Finance
→ Verify payment
```

Sales tidak otomatis memiliki authority finance.

---

# 32. FINANCIAL SECURITY

Financial actions memiliki security level tinggi.

Contoh:

- Verify payment
- Refund
- Void invoice
- Adjust payment
- Modify financial amount
- Approve refund

Semua harus:

- Permission controlled
- Audited
- Transaction-safe

---

# 33. PAYMENT VERIFICATION

Payment verification harus mencatat:

```text
Payment ID
Verifier
Timestamp
Previous status
New status
Amount
Reference
Decision
Reason
```

---

# 34. REFUND SECURITY

Refund membutuhkan permission khusus.

Flow:

```text
Request Refund
 ↓
Review
 ↓
Approve
 ↓
Process
 ↓
Audit
```

Jangan mengizinkan single uncontrolled endpoint:

```text
POST /refund
```

yang langsung memproses uang tanpa authorization.

---

# 35. RESOURCE OWNERSHIP

Ownership harus diperiksa server-side.

Contoh:

Customer:

```text
Customer A
→ Booking A
```

Customer A tidak boleh:

```text
GET /bookings/B
```

meskipun ID diketahui.

---

# 36. TENANT / SCOPE ISOLATION

Jika system suatu saat mendukung multi-company/branch/tenant:

Semua query harus mempertimbangkan:

```text
tenant_id
branch_id
organization_id
```

sesuai architecture.

Jangan mengandalkan frontend filter.

---

# 37. IDOR PROTECTION

Semua object reference harus melewati authorization check.

Contoh:

```text
/api/v1/invoices/123
```

Tidak otomatis berarti user berhak melihat invoice 123.

---

# 38. ADMIN SECURITY

Administrator memiliki akses luas tetapi tetap harus:

- Authenticated
- Authorized
- Audited
- MFA protected jika memungkinkan

Admin tidak boleh bypass audit.

---

# 39. ADMIN IMPERSONATION

Jika fitur impersonation diperlukan:

```text
Admin
 ↓
Impersonate Customer
 ↓
Customer Session
```

harus:

- Explicit
- Time-limited
- Highly audited
- Visibly indicated
- Tidak dapat digunakan untuk bypass logging

---

# 40. CUSTOMER PORTAL SECURITY

Customer hanya boleh mengakses:

```text
Profile
Bookings
Quotations
Invoices
Payments
Documents
Itinerary
```

yang berkaitan dengan account/customer tersebut.

---

# 41. CUSTOMER DATA EXPOSURE

Customer API tidak boleh mengembalikan:

```text
Internal Notes
Supplier Cost
Margin
Internal Commission
Internal Staff Notes
Other Customer Data
```

---

# 42. INTERNAL DATA EXPOSURE

ERP endpoint tidak boleh secara default mengembalikan semua database columns.

Gunakan explicit response DTO.

---

# 43. DATA CLASSIFICATION

Data dapat dikategorikan:

```text
PUBLIC
INTERNAL
CONFIDENTIAL
SENSITIVE
```

Contoh:

### PUBLIC

- Published article
- Published product
- Public landing page

### INTERNAL

- Internal workflow
- Operational notes

### CONFIDENTIAL

- Sales data
- Supplier pricing
- Margin

### SENSITIVE

- Authentication credential
- Payment-related sensitive information
- Identity documents
- Security tokens

---

# 44. DATA MINIMIZATION

System hanya mengumpulkan data yang diperlukan.

Jangan membuat field:

```text
"just_in_case"
```

tanpa business requirement.

---

# 45. PII PROTECTION

PII harus memiliki:

- Access control
- Appropriate storage security
- Limited exposure
- Retention policy
- Audit where necessary

---

# 46. PASSWORD / SECRET NON-DISCLOSURE

Tidak boleh ada API response yang mengembalikan:

```text
password
password_hash
api_key
secret
private_key
access_token
refresh_token
webhook_secret
```

kecuali secure one-time provisioning mechanism yang memang diperlukan.

---

# 47. ENCRYPTION IN TRANSIT

Production traffic harus menggunakan HTTPS/TLS.

Tidak boleh mengirim credential melalui plain HTTP.

---

# 48. ENCRYPTION AT REST

Sensitive data yang membutuhkan protection tambahan dapat menggunakan encryption at rest.

Database/storage infrastructure harus menggunakan secure storage configuration.

---

# 49. FILE SECURITY

File upload harus memeriksa:

```text
Authentication
Authorization
MIME
Extension
Size
Content
Storage location
Access policy
```

---

# 50. PRIVATE FILES

Private files:

```text
Payment Proof
Customer Documents
Identity Documents
Internal Vendor Documents
```

tidak boleh memiliki public permanent URL.

---

# 51. FILE DOWNLOAD AUTHORIZATION

Setiap download private file harus memvalidasi:

```text
User
Permission
Resource Ownership
File Status
```

---

# 52. FILE UPLOAD ABUSE

Proteksi terhadap:

- Oversized file
- Malicious file
- Executable file
- Polyglot file
- Repeated upload abuse

---

# 53. CONTENT SECURITY

CMS content harus disanitasi.

Tidak boleh mengizinkan arbitrary script injection melalui:

- Article
- Landing page
- Product description
- Rich text
- Customer message

kecuali explicitly controlled trusted feature.

---

# 54. XSS PROTECTION

Protection harus mencakup:

- Input sanitization
- Output encoding
- Safe HTML allowlist
- Content Security Policy jika applicable

---

# 55. CSRF PROTECTION

Jika menggunakan cookie-based authentication, state-changing request harus dilindungi dari CSRF.

---

# 56. CORS

CORS harus membatasi trusted origins.

Jangan:

```text
Access-Control-Allow-Origin: *
```

untuk authenticated browser APIs tanpa alasan yang valid.

---

# 57. SECURITY HEADERS

Production website sebaiknya menggunakan security headers sesuai architecture, termasuk:

```text
Content-Security-Policy
Strict-Transport-Security
X-Content-Type-Options
Referrer-Policy
Frame protections
```

Konfigurasi harus diuji agar tidak merusak legitimate functionality.

---

# 58. RATE LIMITING

Rate limiting minimal diterapkan pada:

```text
Login
Password Reset
OTP
Public Lead
Search
Payment
File Upload
Webhook
```

---

# 59. BRUTE FORCE / ABUSE MONITORING

System harus dapat mendeteksi pola:

```text
Repeated login failure
Repeated OTP request
Repeated lead submission
Repeated payment request
Repeated file upload
```

---

# 60. BOT PROTECTION

Public forms dapat menggunakan:

- CAPTCHA
- Honeypot
- Behavioral detection
- Rate limit
- Email/phone validation

sesuai kebutuhan.

---

# 61. WEBHOOK SECURITY

Webhook harus memvalidasi:

```text
Signature
Timestamp
Event ID
Provider
Payload
```

---

# 62. WEBHOOK REPLAY PROTECTION

Webhook lama atau duplicate harus ditolak atau diabaikan.

Gunakan:

```text
event_id
timestamp
nonce
```

sesuai provider.

---

# 63. API KEY SECURITY

API key harus:

- Scoped
- Rotatable
- Revocable
- Stored securely
- Audited

---

# 64. SECRET MANAGEMENT

Secret tidak boleh berada di:

```text
Git repository
Frontend source
Public configuration
Database plain text jika tidak diperlukan
Logs
Screenshots
Error messages
```

Gunakan environment/secret manager.

---

# 65. SECURITY LOGGING

Security event harus dicatat.

Contoh:

```text
Login success
Login failure
Logout
Password change
Password reset
MFA change
Permission change
Role change
Account disabled
Admin action
Sensitive financial action
```

---

# 66. AUDIT TRAIL

Audit trail menjawab:

```text
WHO
DID WHAT
TO WHICH RESOURCE
WHEN
FROM WHERE
WITH WHAT RESULT
WHY
```

Jika alasan diwajibkan, reason harus dicatat.

---

# 67. AUDIT EVENT FORMAT

Contoh:

```json
{
  "audit_id": "audit_123",
  "actor_type": "USER",
  "actor_id": "user_123",
  "action": "payment.verify",
  "resource_type": "payment",
  "resource_id": "pay_123",
  "timestamp": "2026-08-08T10:30:00Z",
  "result": "SUCCESS",
  "reason": "Bank transfer confirmed",
  "request_id": "req_123"
}
```

---

# 68. AUDIT ACTION NAMING

Gunakan format:

```text
resource.action
```

Contoh:

```text
user.login
user.logout
user.password_changed

lead.created
lead.assigned

quotation.created
quotation.sent
quotation.accepted

booking.created
booking.confirmed
booking.cancelled

payment.proof_uploaded
payment.verified
payment.rejected

invoice.issued
invoice.voided

article.published
product.published
landing_page.published
```

---

# 69. AUDIT IMMUTABILITY

Audit trail tidak boleh diedit melalui normal application UI.

Idealnya:

```text
Append-only
```

Audit deletion harus dibatasi pada infrastructure/retention process yang terkontrol.

---

# 70. AUDIT RETENTION

Audit retention mengikuti:

- Business requirements
- Legal requirements
- Security requirements
- Storage policy

---

# 71. AUDIT VS APPLICATION LOG

### Audit log

Mencatat business/security action.

### Application log

Mencatat technical execution.

Contoh:

```text
Audit:
Payment verified by Finance User

Application log:
PaymentVerificationService completed in 182ms
```

---

# 72. REQUEST LOGGING

Request log sebaiknya mencatat:

```text
Request ID
Method
Endpoint
Status
Duration
Authenticated user ID
Timestamp
```

Jangan mencatat secrets.

---

# 73. SECURITY LOGGING PRIVACY

Jangan memasukkan:

```text
Password
Token
API key
Full payment credentials
Sensitive identity data
```

ke application logs.

---

# 74. FAILED AUTHENTICATION LOG

Failed login dapat mencatat:

```text
Timestamp
Account identifier
IP where policy allows
User agent where appropriate
Failure category
Request ID
```

Password tidak pernah dicatat.

---

# 75. ROLE CHANGE AUDIT

Setiap role change harus dicatat:

```text
Actor
Target user
Previous role
New role
Timestamp
Reason
```

---

# 76. PERMISSION CHANGE AUDIT

Jika permission custom tersedia:

```text
Actor
Target
Permission added
Permission removed
Reason
Timestamp
```

---

# 77. ACCOUNT STATUS AUDIT

Perubahan:

```text
ACTIVE
SUSPENDED
DISABLED
LOCKED
```

harus dapat dilacak.

---

# 78. SENSITIVE ACTION CONFIRMATION

Sensitive actions dapat membutuhkan explicit confirmation.

Contoh:

```text
Void Invoice
Refund Payment
Delete Customer
Change Admin Permission
Disable User
```

---

# 79. SOFT DELETE

Untuk business-critical records, prefer:

```text
ARCHIVED
```

atau soft delete daripada hard delete jika history dibutuhkan.

Contoh:

```text
Customer
Booking
Invoice
Payment
Quotation
Audit
```

---

# 80. HARD DELETE

Hard delete hanya diperbolehkan jika:

- Tidak melanggar business requirement
- Tidak merusak audit
- Tidak merusak referential integrity
- Tidak menghilangkan required history

---

# 81. DATA RETENTION

Setiap data class harus memiliki retention policy.

Contoh:

```text
Operational data
Financial records
Customer data
Security logs
Audit logs
Temporary files
```

Retention final mengikuti legal/business policy.

---

# 82. DATA EXPORT

Customer data export harus:

- Authenticated
- Authorized
- Audited
- Rate limited
- Limited to owned data

---

# 83. DATA IMPORT

Import harus:

- Authenticated
- Authorized
- Validated
- Virus scanned if files
- Audited
- Transaction-safe where applicable

---

# 84. BULK OPERATIONS

Bulk operation membutuhkan:

- Permission
- Validation
- Preview where useful
- Audit
- Error report

Contoh:

```text
Bulk Assign Leads
Bulk Update Products
Bulk Publish Content
```

---

# 85. SECURITY FOR CMS

CMS harus memiliki:

```text
Author
Editor
Reviewer
Publisher
Admin
```

atau role equivalent sesuai permission matrix.

Tidak semua content user boleh publish langsung.

---

# 86. PUBLISH SECURITY

Publishing content adalah privileged business action.

Harus memvalidasi:

```text
User permission
Content status
Content completeness
Referenced product validity
SEO requirements if mandatory
```

---

# 87. PRODUCT SECURITY

Product internal data dapat mengandung:

```text
Cost
Margin
Supplier data
Commission
Internal notes
```

Data tersebut tidak boleh exposed ke public API.

---

# 88. ARTICLE SECURITY

Article public endpoint hanya menampilkan:

```text
Published content
Public metadata
Public product references
Public CTA
```

---

# 89. LANDING PAGE SECURITY

Landing page public endpoint tidak boleh expose:

```text
Internal campaign notes
Internal cost
CRM configuration secrets
Integration credentials
Internal analytics credentials
```

---

# 90. LEAD FORM SECURITY

Public lead form harus:

```text
Validate input
Rate limit
Sanitize
Anti-spam
Record source
Create CRM lead
```

---

# 91. LEAD DATA SECURITY

Lead dapat mengandung:

- Name
- Phone
- Email
- Travel information
- Message

Access harus dibatasi sesuai CRM permission.

---

# 92. CRM SECURITY

CRM access harus mengikuti:

```text
Role
Team
Ownership
Assignment
Management scope
```

---

# 93. SALES DATA SECURITY

Sales tidak boleh otomatis melihat:

```text
Finance-only information
Sensitive payment details
Other sales private notes
Administrative security information
```

kecuali permission diberikan.

---

# 94. FINANCE DATA SECURITY

Finance memiliki access terhadap financial records sesuai permission, tetapi tidak otomatis memiliki:

```text
System administration
User password
Security secrets
```

---

# 95. OPERATIONS SECURITY

Operations membutuhkan customer/trip information tetapi tidak otomatis membutuhkan:

```text
Supplier cost
Margin
Admin permissions
Authentication secrets
```

---

# 96. SECURITY INCIDENT

Security incident adalah kondisi seperti:

- Credential compromise
- Unauthorized access
- Data leak
- Suspicious login
- Malicious file upload
- Webhook compromise
- API abuse

---

# 97. INCIDENT RESPONSE

Minimal flow:

```text
Detect
 ↓
Record
 ↓
Contain
 ↓
Investigate
 ↓
Remediate
 ↓
Recover
 ↓
Review
```

---

# 98. INCIDENT SEVERITY

Incident dapat diklasifikasikan:

```text
LOW
MEDIUM
HIGH
CRITICAL
```

berdasarkan impact.

---

# 99. ACCOUNT COMPROMISE

Jika account dicurigai compromised:

```text
Revoke Sessions
 ↓
Reset Credential
 ↓
Revoke Tokens
 ↓
Review Audit
 ↓
Review Sensitive Actions
 ↓
Restore Access
```

---

# 100. API ABUSE INCIDENT

Jika API abuse terdeteksi:

```text
Rate limit
Block/throttle source if justified
Revoke compromised credentials
Review logs
Review affected records
```

---

# 101. SECURITY MONITORING

Monitor:

```text
Failed login spikes
Unusual admin actions
Permission changes
Mass exports
Repeated payment attempts
Webhook failures
API rate-limit events
Large file uploads
```

---

# 102. ALERTING

Alert dapat dibuat untuk:

```text
Multiple admin failures
Repeated payment verification failures
Suspicious permission escalation
Mass customer export
Credential compromise
Integration security failure
```

---

# 103. BACKUP SECURITY

Backup harus:

- Access controlled
- Encrypted where appropriate
- Monitored
- Tested
- Separate from primary environment

---

# 104. RESTORE TEST

Backup dianggap reliable hanya jika restore pernah diuji.

Restore test harus dilakukan secara berkala sesuai operational policy.

---

# 105. DATABASE SECURITY

Database harus:

- Not publicly exposed
- Credential protected
- Least privilege
- Encrypted in transit where applicable
- Backed up
- Monitored

---

# 106. DATABASE ACCOUNT

Application database account tidak boleh memiliki unnecessary administrative privilege.

---

# 107. DATABASE AUDIT

Sensitive database operation dapat diaudit di infrastructure layer jika diperlukan.

Application audit tetap menjadi source utama untuk business action.

---

# 108. DEPENDENCY SECURITY

Dependencies harus:

- Version controlled
- Updated
- Scanned
- Removed jika unused

---

# 109. SUPPLY CHAIN SECURITY

Jangan memasukkan dependency yang tidak jelas asalnya ke production tanpa review.

---

# 110. SECURE DEVELOPMENT

Developer harus:

```text
Validate input
Use parameterized queries
Avoid secrets in code
Handle errors safely
Write security tests
Review permissions
```

---

# 111. CODE REVIEW

Security-sensitive change harus melalui code review.

Contoh:

```text
Authentication
Authorization
Payment
Refund
User role
Permission
File upload
Public API
Webhook
```

---

# 112. SECURITY TESTING

Minimal testing:

```text
Authentication tests
Authorization tests
IDOR tests
RBAC tests
CSRF tests if applicable
XSS tests
SQL injection tests
Rate limit tests
File upload tests
Webhook signature tests
Session tests
Audit tests
```

---

# 113. NEGATIVE TESTING

Security testing harus menguji:

```text
Unauthorized user
Wrong role
Wrong owner
Expired token
Invalid token
Tampered request
Duplicate request
Malformed request
```

---

# 114. API SECURITY TEST EXAMPLE

Test:

```text
Sales User
→ POST /payments/123/verify
```

Expected:

```text
403 Forbidden
```

jika Sales tidak memiliki permission.

---

# 115. OWNERSHIP TEST EXAMPLE

```text
Customer A
→ GET /bookings/customer-B-booking
```

Expected:

```text
403 or 404
```

sesuai security strategy.

---

# 116. AUDIT TEST EXAMPLE

```text
Finance verifies payment
```

Expected audit:

```text
payment.verified
actor = finance_user
resource = payment
result = SUCCESS
```

---

# 117. SECURITY TEST FOR ROLE CHANGE

```text
Manager changes Sales → Finance
```

Expected:

```text
Role updated
Audit created
Existing authorization recalculated
```

---

# 118. SECURITY TEST FOR DISABLED USER

Disabled user must not be able to:

```text
Login
Refresh session
Access protected API
Perform privileged action
```

Existing sessions should be invalidated according to policy.

---

# 119. SECURITY TEST FOR EXPIRED SESSION

Expired session:

```text
GET protected endpoint
```

must return authentication failure.

---

# 120. SECURITY TEST FOR FILE ACCESS

User without permission:

```text
GET private payment proof
```

must fail.

---

# 121. SECURITY TEST FOR PUBLIC API

Public product API must not expose:

```text
supplier_cost
margin
internal_notes
commission
```

---

# 122. SECURITY TEST FOR CMS

Unpublished article:

```text
GET /public/v1/articles/{slug}
```

must not return public content.

---

# 123. SECURITY TEST FOR PRODUCT REFERENCE

Article references unpublished product.

Publishing article should:

```text
Reject
```

or apply explicit business rule.

It must not silently expose unpublished product information.

---

# 124. SECURITY TEST FOR WEBHOOK

Invalid webhook signature:

```text
→ Reject
→ Log security event
→ Do not process transaction
```

---

# 125. SECURITY TEST FOR DUPLICATE WEBHOOK

Same event twice:

```text
First
→ Process

Second
→ Ignore / return already processed
```

No duplicate financial transaction.

---

# 126. SECURITY TEST FOR PAYMENT IDEMPOTENCY

Same payment request with same idempotency key:

```text
First
→ Create

Second
→ Return existing result
```

No duplicate payment.

---

# 127. SECURITY TEST FOR PUBLIC LEAD

Repeated malicious requests:

```text
→ Rate limited
→ Spam protection
→ No uncontrolled CRM flooding
```

---

# 128. SECURITY TEST FOR AUDIT INTEGRITY

Normal application users must not be able to:

```text
Edit audit
Delete audit
Rewrite audit
```

---

# 129. SECURITY CONFIGURATION

Production configuration harus memastikan:

```text
DEBUG = false
HTTPS = enabled
Secure cookies = enabled
Secrets = externalized
CORS = restricted
Rate limiting = enabled
Audit = enabled
Monitoring = enabled
```

Actual variable names mengikuti infrastructure.

---

# 130. SECURITY DEFAULTS

Default behavior harus secure.

Contoh:

```text
New user
→ No unnecessary admin permissions

New API
→ Protected by default

New file
→ Private by default unless explicitly public

New content
→ Draft by default

New integration
→ Disabled until configured
```

---

# 131. FAIL CLOSED

Jika authorization service gagal, system tidak boleh otomatis memberikan access.

Prinsip:

> Security failure must fail closed.

---

# 132. FAIL SAFE

Jika external notification gagal:

```text
Core business transaction
```

dapat tetap berjalan jika notification bukan mandatory dependency.

Security decision tetap harus fail closed.

---

# 133. SECURITY BY DESIGN

Security harus dipikirkan sebelum implementation.

Setiap feature baru harus menjawab:

```text
Who can access?
What can they do?
Which data can they see?
Which action is sensitive?
What must be audited?
What happens if compromised?
```

---

# 134. SECURITY REVIEW CHECKLIST

Sebelum feature dianggap selesai:

```text
[ ] Authentication reviewed
[ ] Authorization reviewed
[ ] Permission reviewed
[ ] Ownership reviewed
[ ] Input validation reviewed
[ ] Output filtering reviewed
[ ] Sensitive data reviewed
[ ] File security reviewed
[ ] API security reviewed
[ ] Rate limiting reviewed
[ ] Audit reviewed
[ ] Logging reviewed
[ ] Error handling reviewed
[ ] Dependency security reviewed
[ ] Security tests passed
```

---

# 135. PRIVILEGED ACTION CHECKLIST

Untuk action sensitif:

```text
[ ] Correct role
[ ] Correct permission
[ ] Correct resource
[ ] Correct state
[ ] Confirmation if required
[ ] Reason if required
[ ] Audit event
[ ] Transaction safety
[ ] Notification if required
```

---

# 136. SECURITY SOURCE OF TRUTH

Security behavior harus konsisten dengan:

```text
00_PROJECT_INSTRUCTIONS.md
01_BUSINESS_FOUNDATION.md
03_BUSINESS_RULES_AND_POLICY.md
04_PRD_SYSTEM_REQUIREMENTS.md
07_USER_ROLES_PERMISSIONS_MATRIX.md
08_WORKFLOW_STATE_MACHINE.md
10_API_AND_INTEGRATION_SPECIFICATION.md
11_SECURITY_AUTHENTICATION_AND_AUDIT_SPECIFICATION.md
```

Jika terjadi konflik:

1. Project-level instruction
2. Business policy
3. Security requirement
4. System requirement
5. Module/API implementation

Implementation tidak boleh menurunkan security level yang telah ditentukan.

---

# 137. DEFINITION OF DONE

Security implementation dianggap selesai jika:

```text
[ ] Authentication implemented
[ ] Password security implemented if applicable
[ ] Session management implemented
[ ] MFA implemented for privileged users if required
[ ] RBAC implemented
[ ] Permission checks implemented
[ ] Resource ownership checks implemented
[ ] IDOR protection implemented
[ ] API security implemented
[ ] Public API protected
[ ] File access protected
[ ] Rate limiting implemented
[ ] Webhook verification implemented
[ ] Secret management implemented
[ ] Audit trail implemented
[ ] Security logging implemented
[ ] Sensitive actions audited
[ ] Data classification applied
[ ] Backup security implemented
[ ] Security testing implemented
[ ] Incident process documented
[ ] Production security configuration reviewed
```

---

# 138. FINAL SECURITY PRINCIPLE

Batam Travelling ERP harus mengikuti prinsip:

```text
AUTHENTICATE
      ↓
AUTHORIZE
      ↓
VALIDATE
      ↓
CHECK OWNERSHIP
      ↓
CHECK BUSINESS STATE
      ↓
EXECUTE
      ↓
AUDIT
      ↓
MONITOR
```

Tidak boleh:

```text
Frontend says OK
      ↓
Backend trusts it
```

---

# 139. FINAL AUDIT PRINCIPLE

Setiap tindakan penting harus dapat dijawab:

> Siapa melakukan apa, terhadap data apa, kapan, dari konteks apa, hasilnya apa, dan mengapa?

Jika system tidak dapat menjawab pertanyaan tersebut untuk tindakan kritis, audit implementation belum lengkap.

---

# 140. FINAL SECURITY PRINCIPLE

Security bukan sebuah module terpisah.

Security harus menjadi property dari seluruh system:

```text
Website
CRM
Sales
Quotation
Booking
Finance
Payment
Operations
CMS
API
Database
Files
Integrations
Reports
```

---

# 141. NEXT DOCUMENT

Dokumen berikutnya:

```text
12_TESTING_QUALITY_ASSURANCE_AND_ACCEPTANCE_SPECIFICATION.md
```

Dokumen tersebut akan mendefinisikan:

- Testing strategy
- Unit testing
- Integration testing
- API testing
- E2E testing
- Security testing
- UI testing
- Regression testing
- UAT
- Acceptance criteria
- Test data
- Test environments
- Bug severity
- Release gates
- Definition of Done
- Production readiness

---

# END OF DOCUMENT