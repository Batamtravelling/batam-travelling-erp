# BATAM TRAVELLING ERP
# NOTIFICATION AND COMMUNICATION SPECIFICATION

**File Name:** `20_NOTIFICATION_AND_COMMUNICATION_SPECIFICATION.md`  
**Document Number:** 20  
**Version:** 1.0  
**Status:** PRODUCTION BASELINE  
**Project:** Batam Travelling ERP  
**Last Updated:** 2026-08-08

---

# 1. PURPOSE

Dokumen ini mendefinisikan standar dan requirement untuk seluruh sistem notification dan communication pada Batam Travelling ERP.

Cakupan:

- Email
- WhatsApp / messaging provider
- Internal notification
- Transactional notification
- CRM notification
- Follow-up reminder
- Booking notification
- Payment notification
- Invoice notification
- Customer communication
- Staff communication
- Notification template
- Notification preference
- Queue
- Retry
- Delivery tracking
- Provider failure handling
- Rate limiting
- Audit
- Communication history

---

# 2. OBJECTIVE

Notification system harus memastikan informasi penting sampai kepada recipient secara:

```text
Accurate
Timely
Secure
Traceable
Reliable
Permission-aware
```

---

# 3. COMMUNICATION PRINCIPLE

Notification bukan source of truth.

Contoh:

```text
Payment
↓
Database transaction = source of truth
↓
Notification = communication layer
```

Kegagalan notification tidak boleh membatalkan transaksi bisnis yang berhasil.

---

# 4. COMMUNICATION CHANNELS

System mendukung architecture untuk:

```text
Email
WhatsApp
SMS
Internal notification
Push notification
```

Channel yang benar-benar diaktifkan bergantung pada provider dan deployment.

---

# 5. CHANNEL PRIORITY

Untuk setiap notification type dapat ditentukan:

```text
Primary channel
Fallback channel
Optional channel
```

Contoh:

```text
Payment confirmation
→ Email
→ WhatsApp
```

---

# 6. NOTIFICATION TYPES

Notification dibagi:

```text
Transactional
Operational
CRM
Marketing
System
Security
```

---

# 7. TRANSACTIONAL NOTIFICATION

Transactional notification meliputi:

```text
Booking confirmation
Payment confirmation
Payment rejection
Invoice issued
Invoice overdue
Quotation sent
Booking cancellation
Refund confirmation
```

---

# 8. CRM NOTIFICATION

CRM notification:

```text
New lead
Lead assignment
Follow-up due
Follow-up overdue
Customer reply
Quotation response
Lead conversion
```

---

# 9. OPERATIONAL NOTIFICATION

Operational:

```text
Upcoming booking
Payment proof pending
Payment verification required
Booking action required
Task assigned
Task overdue
```

---

# 10. SECURITY NOTIFICATION

Security notification:

```text
New login
Password change
Password reset
Suspicious activity
Account lock
Permission change
```

---

# 11. MARKETING NOTIFICATION

Marketing communication harus dipisahkan dari transactional notification.

Marketing harus mengikuti:

```text
Consent
Opt-in
Opt-out
Campaign rules
Applicable regulation
```

---

# 12. INTERNAL NOTIFICATION

Internal notification ditujukan kepada staff.

Contoh:

```text
New lead assigned
Payment proof uploaded
Booking needs review
Follow-up overdue
Invoice overdue
```

---

# 13. RECIPIENT TYPES

Recipient dapat berupa:

```text
Customer
Lead
Sales
CRM staff
Finance
Operations
Management
Admin
System user
```

---

# 14. RECIPIENT RESOLUTION

Recipient ditentukan dari business relationship.

Contoh:

```text
Lead created
→ Assigned sales
```

atau:

```text
Payment proof uploaded
→ Finance/payment verifier
```

---

# 15. RECIPIENT VALIDATION

Sebelum send:

```text
Recipient exists
Channel exists
Channel valid
Permission/consent valid
Template available
```

harus diperiksa.

---

# 16. CONTACT DATA

Contact channel dapat berasal dari:

```text
Customer profile
Lead profile
User profile
Business configuration
```

---

# 17. INVALID CONTACT

Jika email/phone invalid:

```text
Notification = Failed
Reason = Invalid recipient
```

dan system tidak boleh retry tanpa perubahan data.

---

# 18. NOTIFICATION TEMPLATE

Semua notification transactional harus menggunakan template terpusat.

Template memiliki:

```text
Template ID
Name
Channel
Language
Subject
Body
Variables
Status
Version
```

---

# 19. TEMPLATE VERSIONING

Template harus memiliki version.

Contoh:

```text
booking-confirmation-v1
booking-confirmation-v2
```

---

# 20. TEMPLATE STATUS

Status:

```text
Draft
Active
Inactive
Archived
```

---

# 21. ACTIVE TEMPLATE

Hanya template `Active` yang dapat digunakan untuk production send.

---

# 22. TEMPLATE APPROVAL

Critical transactional template harus melalui review sebelum active.

---

# 23. TEMPLATE VARIABLES

Contoh:

```text
{{customer_name}}
{{booking_number}}
{{booking_date}}
{{payment_amount}}
{{invoice_number}}
{{company_name}}
```

---

# 24. VARIABLE VALIDATION

Template rendering harus gagal dengan aman jika required variable tidak tersedia.

Jangan mengirim:

```text
Hello {{customer_name}}
```

kepada customer.

---

# 25. TEMPLATE PREVIEW

Admin authorized dapat melihat preview template dengan sample data.

---

# 26. TEMPLATE TEST SEND

Admin dapat mengirim test notification ke test recipient.

Test send harus ditandai sebagai test.

---

# 27. TEMPLATE LOCALIZATION

Jika multi-language digunakan, template dapat memiliki:

```text
id-ID
en-US
```

dan bahasa lain sesuai kebutuhan.

---

# 28. DEFAULT LANGUAGE

Bahasa default ditentukan oleh system/business configuration.

---

# 29. CUSTOMER LANGUAGE

Jika customer memiliki preferred language, notification dapat menggunakan preference tersebut.

---

# 30. SUBJECT

Email template harus memiliki subject.

Subject harus jelas dan tidak misleading.

---

# 31. EMAIL STRUCTURE

Transactional email sebaiknya memiliki:

```text
Brand header
Main content
Relevant CTA
Reference number
Support/contact
Footer
```

---

# 32. EMAIL HTML

Email HTML harus responsive dan memiliki plain-text fallback jika provider mendukung.

---

# 33. WHATSAPP TEMPLATE

Jika WhatsApp provider digunakan, template harus mengikuti format/provider policy yang berlaku.

---

# 34. MESSAGE LENGTH

Message harus dirancang agar mudah dibaca pada mobile.

---

# 35. COMMUNICATION QUEUE

Notification tidak boleh menghambat transaction request.

Flow:

```text
Business Event
↓
Notification Job
↓
Queue
↓
Worker
↓
Provider
```

---

# 36. SYNCHRONOUS NOTIFICATION

Synchronous send hanya digunakan jika:

```text
Low latency
Provider reliable
Business flow requires immediate confirmation
```

Tetap harus memiliki timeout.

---

# 37. ASYNCHRONOUS NOTIFICATION

Default untuk:

```text
Email
WhatsApp
Bulk notification
Scheduled notification
Marketing campaign
```

---

# 38. NOTIFICATION JOB

Setiap notification job memiliki:

```text
Job ID
Notification ID
Recipient
Channel
Template
Priority
Status
Created at
Scheduled at
```

---

# 39. NOTIFICATION STATUS

Minimum status:

```text
Queued
Processing
Sent
Delivered
Failed
Retrying
Cancelled
```

---

# 40. DELIVERY STATUS

Jika provider mendukung delivery tracking:

```text
Sent
Delivered
Read
Failed
```

dapat disimpan.

---

# 41. DELIVERY TRACKING

Provider callback/webhook dapat digunakan untuk update delivery status.

---

# 42. PROVIDER WEBHOOK

Webhook harus:

```text
Authenticated
Validated
Idempotent
Logged
```

---

# 43. WEBHOOK IDEMPOTENCY

Duplicate provider callback tidak boleh menghasilkan duplicate notification state transition.

---

# 44. RETRY POLICY

Retry hanya untuk error yang retryable.

Contoh:

```text
Temporary network failure
Provider timeout
Provider temporary unavailable
Rate limit
```

---

# 45. NON-RETRYABLE ERROR

Contoh:

```text
Invalid recipient
Invalid template
Permanent provider rejection
Missing required data
```

---

# 46. RETRY BACKOFF

Gunakan:

```text
Exponential backoff
```

dengan maximum retry.

---

# 47. MAX RETRY

Default:

```text
3 attempts
```

dapat dikonfigurasi berdasarkan channel.

---

# 48. DEAD LETTER

Notification yang gagal setelah retry masuk:

```text
Dead Letter / Failed Notification
```

untuk investigation.

---

# 49. NOTIFICATION FAILURE

Notification failure tidak boleh mengubah business transaction menjadi failed kecuali business rule secara eksplisit menyatakan sebaliknya.

---

# 50. PAYMENT NOTIFICATION

Payment events:

```text
Payment submitted
Payment proof uploaded
Payment verification started
Payment approved
Payment rejected
Payment failed
Payment refunded
```

---

# 51. PAYMENT PROOF UPLOAD

Jika customer atau sales dapat upload bukti transfer:

```text
Upload
↓
Payment status = Pending Verification
↓
Notify Finance
↓
Finance verifies
↓
Approved / Rejected
↓
Notify Customer
```

---

# 52. PAYMENT APPROVAL NOTIFICATION

Customer menerima notification:

```text
Payment approved
Amount
Booking
Reference
Next step
```

---

# 53. PAYMENT REJECTION NOTIFICATION

Jika rejected:

```text
Reason
Booking
Amount
Required action
```

Reason tidak boleh membocorkan internal information yang tidak diperlukan.

---

# 54. BOOKING NOTIFICATION

Booking events:

```text
Booking created
Booking confirmed
Booking updated
Booking cancelled
Booking completed
```

---

# 55. BOOKING CONFIRMATION

Customer menerima:

```text
Booking number
Product
Date
Customer information
Amount/status
Next step
```

---

# 56. BOOKING CANCELLATION

Notification mencakup:

```text
Booking number
Cancellation status
Reason if appropriate
Refund information if applicable
```

---

# 57. QUOTATION NOTIFICATION

Quotation events:

```text
Quotation created
Quotation sent
Quotation updated
Quotation accepted
Quotation rejected
Quotation expired
```

---

# 58. QUOTATION TO BOOKING

Jika quotation accepted dan booking dibuat:

```text
Quotation
↓
Booking
↓
Booking notification
```

System harus mencegah duplicate communication yang tidak perlu.

---

# 59. INVOICE NOTIFICATION

Invoice events:

```text
Invoice issued
Invoice sent
Invoice partially paid
Invoice paid
Invoice overdue
Invoice cancelled
```

---

# 60. INVOICE CONTENT

Notification dapat berisi:

```text
Invoice number
Booking
Amount
Due date
Payment instruction
```

---

# 61. OVERDUE REMINDER

Invoice overdue dapat menghasilkan reminder berdasarkan schedule.

---

# 62. REMINDER POLICY

Reminder tidak boleh dikirim unlimited.

Gunakan:

```text
Maximum reminders
Minimum interval
Stop condition
```

---

# 63. CRM FOLLOW-UP NOTIFICATION

Follow-up event:

```text
Follow-up created
Follow-up due
Follow-up overdue
Follow-up completed
```

---

# 64. SALES FOLLOW-UP REMINDER

Sales menerima reminder:

```text
Lead
Customer
Follow-up date
Purpose
Priority
```

---

# 65. OVERDUE FOLLOW-UP

Overdue follow-up dapat dikirim:

```text
Sales
Team leader
CRM manager
```

sesuai escalation policy.

---

# 66. LEAD ASSIGNMENT

Saat lead assigned:

```text
Notify assigned sales
```

---

# 67. LEAD REASSIGNMENT

Jika lead berpindah sales:

```text
Previous owner
New owner
```

dapat menerima notification sesuai policy.

---

# 68. CUSTOMER REPLY

Jika customer reply melalui supported communication channel:

```text
Conversation updated
↓
Notify responsible staff
```

---

# 69. INTERNAL NOTIFICATION CENTER

User memiliki notification center:

```text
Unread
Read
All
```

---

# 70. INTERNAL NOTIFICATION ITEM

Notification minimal:

```text
Title
Message
Timestamp
Type
Reference
Read status
```

---

# 71. NOTIFICATION DEEP LINK

Notification dapat memiliki link ke relevant entity.

Contoh:

```text
Payment proof uploaded
→ Open payment verification
```

---

# 72. PERMISSION ON DEEP LINK

Deep link harus memvalidasi authorization.

User tidak boleh membuka entity hanya karena memiliki URL notification.

---

# 73. READ STATUS

Internal notification memiliki:

```text
Unread
Read
```

---

# 74. BULK READ

User dapat:

```text
Mark as read
Mark all as read
```

---

# 75. NOTIFICATION COUNTER

UI dapat menampilkan:

```text
Unread count
```

Counter harus efisien dan tidak melakukan expensive query setiap page load.

---

# 76. NOTIFICATION PREFERENCE

User/customer dapat memiliki preference:

```text
Channel
Category
Frequency
Language
```

---

# 77. TRANSACTIONAL VS MARKETING PREFERENCE

Transactional notification tidak boleh diperlakukan sama dengan marketing opt-out jika business/legal requirement mengharuskan transactional communication tetap dikirim.

---

# 78. MARKETING OPT-OUT

Marketing notification harus menghormati:

```text
Opt-out
Unsubscribe
Consent withdrawal
```

---

# 79. COMMUNICATION CONSENT

Consent dapat menyimpan:

```text
Channel
Purpose
Timestamp
Source
Status
```

---

# 80. CONSENT AUDIT

Perubahan consent harus dapat diaudit.

---

# 81. CUSTOMER PREFERENCE

Customer dapat memilih:

```text
Preferred language
Preferred communication channel
```

jika feature diaktifkan.

---

# 82. STAFF PREFERENCE

Staff dapat memilih:

```text
Internal notification
Email notification
Optional communication
```

sesuai role/policy.

---

# 83. CRITICAL NOTIFICATION

Critical notification dapat mengabaikan optional user preference jika diperlukan untuk business/security reason.

---

# 84. NOTIFICATION PRIORITY

Priority:

```text
Critical
High
Normal
Low
```

---

# 85. CRITICAL EXAMPLES

```text
Security event
Payment verification issue
Critical operational failure
```

---

# 86. NOTIFICATION DEDUPLICATION

System harus mencegah duplicate notification untuk event yang sama.

---

# 87. IDEMPOTENCY KEY

Notification event dapat menggunakan:

```text
event_type + entity_id + recipient + channel
```

atau equivalent unique key.

---

# 88. DUPLICATE PREVENTION

Contoh:

```text
Booking confirmed
```

tidak boleh mengirim confirmation dua kali hanya karena worker retry.

---

# 89. EVENT ID

Business event harus memiliki unique event ID.

---

# 90. EVENT → NOTIFICATION

Architecture:

```text
Business Event
↓
Notification Rule
↓
Notification Job
```

---

# 91. NOTIFICATION RULE

Rule menentukan:

```text
Trigger
Recipient
Channel
Template
Priority
Schedule
```

---

# 92. NOTIFICATION RULE EXAMPLE

```text
Trigger:
Payment Approved

Recipient:
Customer

Channel:
Email

Template:
payment-approved

Priority:
High
```

---

# 93. MULTI-CHANNEL

Satu event dapat menghasilkan:

```text
Email
+
WhatsApp
+
Internal notification
```

jika policy mengizinkan.

---

# 94. FALLBACK CHANNEL

Jika primary channel gagal secara permanent:

```text
Primary
↓
Fallback
```

Fallback tidak boleh menghasilkan duplicate jika primary sebenarnya delivered tetapi callback terlambat.

---

# 95. DELIVERY CONFIRMATION

Provider delivery callback harus diprioritaskan sebelum fallback untuk mencegah duplicate.

---

# 96. PROVIDER ABSTRACTION

Application tidak boleh terlalu bergantung pada satu provider.

Gunakan abstraction:

```text
Notification Service
↓
Provider Adapter
↓
Email Provider
WhatsApp Provider
SMS Provider
```

---

# 97. PROVIDER CONFIGURATION

Provider configuration:

```text
Provider
API credential
Sender identity
Webhook
Timeout
Retry
Rate limit
```

Secret harus disimpan securely.

---

# 98. PROVIDER HEALTH

Monitor:

```text
Availability
Latency
Failure rate
Rate limit
Quota
```

---

# 99. PROVIDER FAILOVER

Jika architecture mendukung multiple provider:

```text
Primary provider
↓
Failure
↓
Secondary provider
```

---

# 100. PROVIDER RATE LIMIT

Notification service harus menghormati provider rate limit.

---

# 101. RATE LIMIT QUEUE

Jika rate limit tercapai:

```text
Queue
Throttle
Retry
```

bukan spam provider.

---

# 102. BULK NOTIFICATION

Bulk send harus:

```text
Queued
Batched
Rate controlled
Audited
```

---

# 103. BULK SEND SAFETY

Bulk notification harus memiliki confirmation/authorization untuk mencegah accidental mass send.

---

# 104. CAMPAIGN COMMUNICATION

Marketing campaign memiliki:

```text
Campaign
Audience
Template
Schedule
Channel
Consent filter
```

---

# 105. CAMPAIGN AUDIENCE

Audience harus dihitung dari authorized customer data.

---

# 106. CAMPAIGN PREVIEW

Sebelum send:

```text
Audience count
Sample recipient
Template preview
Channel
Schedule
```

harus dapat diverifikasi.

---

# 107. CAMPAIGN APPROVAL

Mass marketing send dapat membutuhkan approval sesuai governance.

---

# 108. SCHEDULED COMMUNICATION

Scheduled notification memiliki:

```text
Schedule
Timezone
Recipient rule
Template
Channel
```

---

# 109. TIMEZONE

Scheduled communication harus menggunakan timezone yang jelas.

---

# 110. SCHEDULED JOB DUPLICATION

Scheduler harus menggunakan locking/idempotency agar tidak mengirim duplicate.

---

# 111. QUIET HOURS

Jika applicable, communication dapat memiliki quiet hours.

Contoh:

```text
22:00–07:00
```

kecuali critical transactional/security message.

---

# 112. BUSINESS HOLIDAY

Jika reminder tidak boleh dikirim pada hari tertentu, scheduling engine dapat mendukung business calendar.

---

# 113. NOTIFICATION HISTORY

Communication history harus dapat dilihat oleh authorized user.

---

# 114. CUSTOMER COMMUNICATION HISTORY

Customer profile dapat menampilkan:

```text
Sent
Delivered
Failed
Read
```

untuk communication yang relevan.

---

# 115. INTERNAL COMMUNICATION HISTORY

Staff dapat melihat communication yang terkait dengan entity sesuai permission.

---

# 116. ENTITY COMMUNICATION TIMELINE

Contoh:

```text
Customer
↓
Inquiry
↓
Email sent
↓
Quotation sent
↓
Payment reminder
↓
Payment confirmed
```

---

# 117. COMMUNICATION AUDIT

Audit minimal:

```text
Notification ID
Event ID
Recipient
Channel
Template
Created
Sent
Delivered
Failed
Provider
```

---

# 118. SENSITIVE MESSAGE DATA

Notification log tidak boleh menyimpan sensitive content secara berlebihan.

---

# 119. PAYMENT DATA PROTECTION

Notification log tidak boleh menyimpan:

```text
Full card number
CVV
Sensitive authentication data
```

---

# 120. MESSAGE RETENTION

Notification history memiliki retention policy sesuai business, operational, dan privacy requirements.

---

# 121. LOG RETENTION

Technical provider log dapat memiliki retention berbeda dari communication history.

---

# 122. MESSAGE CONTENT STORAGE

System harus menentukan apakah menyimpan:

```text
Full message
Rendered message
Template ID only
Metadata only
```

berdasarkan privacy/security requirements.

---

# 123. NOTIFICATION SEARCH

Authorized user dapat mencari berdasarkan:

```text
Recipient
Reference
Channel
Status
Date
Template
```

---

# 124. NOTIFICATION FILTER

Filter:

```text
Sent
Delivered
Failed
Pending
Retrying
```

---

# 125. FAILED NOTIFICATION DASHBOARD

Dashboard menampilkan:

```text
Failed count
Failure rate
Top error
Provider
Channel
```

---

# 126. NOTIFICATION SLA

Initial target:

```text
Internal notification:
< 5 seconds

Transactional email:
queued within < 5 seconds

Critical operational notification:
queued within < 5 seconds
```

Actual provider delivery time bergantung pada provider.

---

# 127. QUEUE PERFORMANCE

Notification queue monitor:

```text
Queue depth
Oldest job age
Processing rate
Failure rate
Retry count
```

---

# 128. NOTIFICATION WORKER

Worker harus:

```text
Stateless
Retry-safe
Idempotent
Observable
```

---

# 129. WORKER SCALING

Worker dapat di-scale berdasarkan:

```text
Queue depth
Processing time
CPU
Provider rate limit
```

---

# 130. RETRY STORM PREVENTION

Retry harus menggunakan:

```text
Exponential backoff
Jitter
Maximum attempts
```

---

# 131. DEAD LETTER MANAGEMENT

Failed notification harus dapat:

```text
View
Investigate
Retry manually
Cancel
```

sesuai permission.

---

# 132. MANUAL RETRY

Manual retry harus menghasilkan audit event.

---

# 133. MANUAL RESEND

User authorized dapat resend communication.

System harus membedakan:

```text
Automatic retry
Manual resend
```

---

# 134. RESEND SAFETY

Manual resend harus memperingatkan user jika notification sebelumnya sudah delivered.

---

# 135. NOTIFICATION RATE LIMIT PER RECIPIENT

Untuk mencegah spam, system dapat menerapkan recipient-level throttling.

---

# 136. CUSTOMER SPAM PROTECTION

Customer tidak boleh menerima notification duplicate akibat event loop atau retry.

---

# 137. EVENT LOOP PREVENTION

Notification send/update tidak boleh menghasilkan business event yang menyebabkan notification infinite loop.

---

# 138. TEMPLATE SECURITY

Template tidak boleh menjalankan arbitrary code.

---

# 139. TEMPLATE SANITIZATION

HTML content harus disanitasi sesuai security policy.

---

# 140. LINK SECURITY

Links dalam notification harus menggunakan trusted domain/application URL.

---

# 141. TOKENIZED ACTION

Jika notification memiliki secure action link:

```text
Token
Expiration
Authorization
One-time use if required
```

harus diterapkan.

---

# 142. PAYMENT ACTION LINK

Payment link harus:

```text
Secure
Expiring where appropriate
Bound to transaction
```

---

# 143. UNSUBSCRIBE

Marketing email harus memiliki unsubscribe mechanism.

---

# 144. COMMUNICATION COMPLIANCE

System harus dapat mendukung applicable privacy, anti-spam, consent, dan communication regulations.

---

# 145. CUSTOMER SUPPORT

Notification harus menyediakan contact/support information jika customer membutuhkan bantuan.

---

# 146. ERROR MESSAGE

Notification failure tidak boleh memperlihatkan:

```text
Stack trace
API credential
Internal server details
```

kepada recipient.

---

# 147. INTERNAL ERROR DETAIL

Technical error detail hanya tersedia bagi authorized technical/admin users.

---

# 148. NOTIFICATION OBSERVABILITY

Metrics minimum:

```text
Notifications created
Notifications sent
Delivered
Failed
Retry
Queue depth
Provider latency
Provider errors
```

---

# 149. CHANNEL METRICS

Metrics per channel:

```text
Email
WhatsApp
SMS
Push
Internal
```

---

# 150. TEMPLATE METRICS

Monitor:

```text
Send count
Failure count
Delivery rate
```

---

# 151. PROVIDER METRICS

Monitor:

```text
Provider success rate
Latency
Rate limit
Quota
```

---

# 152. ALERTS

Alert jika:

```text
Failure rate increases
Queue backlog increases
Provider unavailable
Notification latency increases
```

---

# 153. NOTIFICATION DASHBOARD

Admin dashboard:

```text
Queue
Sent
Delivered
Failed
Provider health
Top failures
```

---

# 154. COMMUNICATION DASHBOARD

Management dapat melihat aggregate communication performance jika diperlukan.

---

# 155. CUSTOMER COMMUNICATION METRICS

Optional:

```text
Delivery rate
Open/read rate
Response rate
```

Read/open tracking hanya digunakan jika channel/provider mendukung dan privacy policy mengizinkan.

---

# 156. CRM RESPONSE METRIC

CRM dapat menghitung:

```text
Lead response time
Customer response time
Follow-up completion
```

---

# 157. NOTIFICATION ATTRIBUTION

Notification dapat menyimpan relationship ke:

```text
Lead
Customer
Quotation
Booking
Payment
Invoice
Follow-up
```

---

# 158. NOTIFICATION API

Logical API:

```text
/api/notifications
/api/notification-preferences
/api/notification-templates
/api/notification-deliveries
```

Actual API mengikuti dokumen API specification.

---

# 159. INTERNAL NOTIFICATION API

Endpoint harus mendukung:

```text
List
Read
Mark read
Mark all read
Count
```

---

# 160. TEMPLATE API

Admin API:

```text
Create
Update
Preview
Activate
Deactivate
Version
```

---

# 161. PROVIDER API ABSTRACTION

Business logic tidak boleh langsung memanggil provider SDK di banyak tempat.

Gunakan central notification service.

---

# 162. DATABASE MODEL

Minimum entities:

```text
Notification
NotificationTemplate
NotificationTemplateVersion
NotificationDelivery
NotificationPreference
NotificationProvider
NotificationEvent
CommunicationConsent
```

---

# 163. NOTIFICATION ENTITY

Fields minimal:

```text
id
event_id
recipient_id
channel
template_id
priority
status
created_at
scheduled_at
sent_at
delivered_at
failed_at
```

---

# 164. DELIVERY ENTITY

Fields:

```text
notification_id
provider
provider_message_id
status
error_code
error_message
sent_at
delivered_at
```

---

# 165. TEMPLATE ENTITY

Fields:

```text
id
name
channel
language
status
current_version
created_by
created_at
```

---

# 166. PREFERENCE ENTITY

Fields:

```text
recipient_id
channel
category
enabled
updated_at
```

---

# 167. CONSENT ENTITY

Fields:

```text
recipient_id
purpose
channel
status
source
timestamp
```

---

# 168. IDEMPOTENCY STORAGE

Notification system harus memiliki mechanism untuk menyimpan event/idempotency key yang telah diproses.

---

# 169. TRANSACTIONAL OUTBOX

Jika diperlukan, gunakan transactional outbox:

```text
Business Transaction
↓
DB Transaction
↓
Outbox Event
↓
Notification Worker
```

Tujuan:

```text
Business state committed
+
Event reliably published
```

---

# 170. OUTBOX PRINCIPLE

Notification tidak boleh hilang hanya karena application crash setelah business transaction commit.

---

# 171. OUTBOX PROCESSING

Outbox worker:

```text
Read pending
↓
Publish
↓
Mark processed
```

---

# 172. OUTBOX RETRY

Outbox processing harus idempotent.

---

# 173. COMMUNICATION FAILURE ISOLATION

Provider failure tidak boleh menyebabkan:

```text
Booking failure
Payment failure
Invoice failure
```

kecuali explicitly required.

---

# 174. NOTIFICATION TRANSACTION BOUNDARY

Business transaction:

```text
Commit
```

terlebih dahulu.

Notification:

```text
After commit
```

kecuali use case khusus.

---

# 175. EVENTUAL DELIVERY

Notification bersifat eventually delivered.

System harus menampilkan status aktual.

---

# 176. BUSINESS STATUS VS DELIVERY STATUS

Pisahkan:

```text
Payment status
```

dengan:

```text
Payment notification status
```

---

# 177. EXAMPLE

```text
Payment = APPROVED
Notification = FAILED
```

Kondisi ini valid.

Payment tetap approved.

Notification harus retry/investigate.

---

# 178. COMMUNICATION RETENTION

Retention dibedakan:

```text
Business audit
Notification metadata
Message content
Provider logs
```

---

# 179. DATA DELETION

Jika customer data dihapus/anonymized sesuai policy, communication history harus mengikuti data retention/deletion rules.

---

# 180. ANONYMIZATION

Historical communication record dapat dianonymize jika required tanpa menghilangkan audit integrity.

---

# 181. REPORTING INTEGRATION

Notification metrics dapat digunakan oleh reporting:

```text
Delivery rate
Failure rate
Response rate
```

---

# 182. CRM INTEGRATION

Notification event dapat memperbarui CRM timeline.

---

# 183. BOOKING INTEGRATION

Booking event dapat menghasilkan notification.

---

# 184. PAYMENT INTEGRATION

Payment event menghasilkan notification.

---

# 185. FINANCE INTEGRATION

Invoice/payment status dapat menghasilkan reminder.

---

# 186. CMS INTEGRATION

CMS campaign atau content publication dapat menghasilkan notification jika feature diaktifkan.

---

# 187. ADMIN CONFIGURATION

Admin dapat mengatur:

```text
Templates
Provider
Rules
Channel
Retry
Schedule
Preference
```

berdasarkan permission.

---

# 188. PROVIDER SECRET MANAGEMENT

Credential provider harus:

```text
Encrypted
Secret-managed
Not stored in source code
Not exposed in UI
```

---

# 189. PROVIDER ROTATION

Credential rotation harus dapat dilakukan tanpa code change jika architecture memungkinkan.

---

# 190. PROVIDER CONFIG AUDIT

Perubahan provider configuration harus diaudit.

---

# 191. TEMPLATE CHANGE AUDIT

Perubahan template:

```text
Who
What
When
Version
```

harus tercatat.

---

# 192. NOTIFICATION RULE AUDIT

Perubahan notification rule harus diaudit.

---

# 193. CAMPAIGN AUDIT

Campaign:

```text
Created
Approved
Scheduled
Started
Completed
Cancelled
```

harus tercatat.

---

# 194. COMMUNICATION TESTING

Testing minimum:

```text
Template rendering
Recipient resolution
Queue
Retry
Provider failure
Webhook
Idempotency
Deduplication
Permission
Preference
Consent
```

---

# 195. NOTIFICATION TESTING

Test scenario:

```text
Booking created
Payment approved
Payment rejected
Invoice overdue
Lead assigned
Follow-up due
Follow-up overdue
```

---

# 196. FAILURE TESTING

Simulasikan:

```text
Provider timeout
Provider 500
Rate limit
Invalid recipient
Duplicate webhook
Worker crash
Queue backlog
```

---

# 197. LOAD TESTING

Load test:

```text
1,000 notifications
10,000 notifications
Concurrent workers
Provider throttling
```

angka final mengikuti capacity test.

---

# 198. NOTIFICATION PERFORMANCE

Target baseline:

```text
Queue insertion:
p95 < 300 ms

Internal notification:
p95 < 1 second

Worker processing:
Depends on provider
```

---

# 199. NOTIFICATION AVAILABILITY

Notification service harus highly available sesuai criticality, tetapi tidak boleh menjadi single point of failure untuk core transaction.

---

# 200. BUSINESS CONTINUITY

Jika notification provider down:

```text
Queue
Retry
Fallback
Manual communication if critical
```

sesuai policy.

---

# 201. DISASTER RECOVERY

Notification queue/outbox harus masuk dalam backup/recovery strategy sesuai kebutuhan.

---

# 202. MESSAGE LOSS PREVENTION

Critical transactional notification tidak boleh hilang tanpa detectable failure.

---

# 203. MESSAGE DUPLICATION PREVENTION

System harus meminimalkan duplicate send melalui:

```text
Idempotency
Deduplication
Provider message tracking
```

---

# 204. COMMUNICATION CENTER

Optional centralized communication center dapat menyediakan:

```text
Inbox
Sent
Scheduled
Failed
Templates
Preferences
Providers
```

---

# 205. INBOX

Jika two-way communication diaktifkan:

```text
Customer message
↓
Conversation
↓
Staff reply
```

---

# 206. CONVERSATION

Conversation memiliki:

```text
Customer
Channel
Messages
Assigned staff
Status
Last activity
```

---

# 207. CONVERSATION STATUS

```text
Open
Pending
Resolved
Closed
```

---

# 208. CONVERSATION ASSIGNMENT

Conversation dapat diassign ke staff.

---

# 209. CONVERSATION SLA

CRM/customer service dapat memiliki:

```text
First response time
Resolution time
```

---

# 210. TWO-WAY CHANNEL

Jika WhatsApp/two-way messaging diaktifkan:

```text
Inbound message
↓
Webhook
↓
Conversation
↓
Notify staff
```

---

# 211. INBOUND MESSAGE VALIDATION

Inbound webhook harus divalidasi provider signature jika tersedia.

---

# 212. MESSAGE ORDERING

System harus menangani kemungkinan message datang tidak berurutan.

---

# 213. MESSAGE DUPLICATION

Inbound duplicate webhook harus di-deduplicate.

---

# 214. ATTACHMENTS

Jika communication mendukung attachment:

```text
Validate type
Validate size
Scan
Store securely
```

---

# 215. COMMUNICATION ATTACHMENT SECURITY

Attachment tidak boleh dapat dieksekusi sebagai arbitrary code.

---

# 216. CUSTOMER DATA ACCESS

Staff hanya dapat melihat communication customer sesuai scope permission.

---

# 217. COMMUNICATION EXPORT

Jika communication export tersedia:

```text
Audit
Permission
Sensitive data protection
```

harus diterapkan.

---

# 218. NOTIFICATION UX

Notification UI harus:

```text
Clear
Short
Actionable
Contextual
```

---

# 219. CTA

Notification dapat memiliki CTA:

```text
View booking
Verify payment
Follow up
Open invoice
```

---

# 220. CTA SECURITY

CTA harus melakukan server-side authorization.

---

# 221. MOBILE UX

Notification harus mudah digunakan pada mobile.

---

# 222. ACCESSIBILITY

Notification UI harus mendukung:

```text
Keyboard navigation
Screen reader
Clear status
Non-color indicators
```

---

# 223. LANGUAGE

Message harus menggunakan bahasa yang konsisten dengan customer preference/system language.

---

# 224. BRANDING

External communication harus menggunakan approved brand identity.

---

# 225. FOOTER

Email dapat memiliki:

```text
Company
Contact
Support
Legal/privacy link
Unsubscribe for marketing
```

---

# 226. MARKETING SEPARATION

Marketing campaign tidak boleh menggunakan transactional template tanpa explicit approval.

---

# 227. TRANSACTIONAL TEMPLATE SEPARATION

Transactional template tidak boleh dapat diedit sebagai campaign template tanpa permission.

---

# 228. NOTIFICATION CATEGORY

Category harus tersedia untuk filtering:

```text
Booking
Payment
Invoice
CRM
Security
Marketing
System
```

---

# 229. NOTIFICATION PREFERENCE UI

User dapat melihat preference yang relevan.

---

# 230. DEFAULT PREFERENCE

Default preference harus ditentukan oleh business policy dan applicable regulation.

---

# 231. CRITICAL COMMUNICATION

Critical communication memiliki priority tinggi dan tidak boleh tertahan oleh marketing queue.

---

# 232. QUEUE SEPARATION

Jika workload besar, gunakan queue terpisah:

```text
Critical
Transactional
Marketing
Bulk
```

---

# 233. QUEUE PRIORITY

Critical queue diproses lebih dahulu.

---

# 234. WORKER ISOLATION

Marketing worker tidak boleh menghabiskan seluruh worker capacity sehingga transactional notification tertunda.

---

# 235. PROVIDER QUOTA

Provider quota harus dimonitor dan direncanakan sebelum campaign besar.

---

# 236. CAMPAIGN THROTTLING

Campaign harus memiliki configurable send rate.

---

# 237. MASS SEND SAFETY

Sebelum mass send:

```text
Audience count
Invalid recipients
Opt-out count
Estimated volume
Provider quota
```

harus dapat diperiksa.

---

# 238. CAMPAIGN CANCEL

Authorized user dapat cancel campaign yang belum seluruhnya dikirim.

---

# 239. PARTIAL CAMPAIGN

Campaign dapat berstatus:

```text
Partially Sent
```

jika sebagian recipient gagal.

---

# 240. CAMPAIGN REPORT

Report:

```text
Audience
Sent
Delivered
Failed
Read
Unsubscribed
```

jika metric tersedia.

---

# 241. COMMUNICATION COST

Jika provider mengenakan biaya per message, system dapat menyimpan:

```text
Provider
Channel
Message count
Estimated/actual cost
```

---

# 242. COST MONITORING

Management dapat memonitor communication cost jika data tersedia.

---

# 243. COST LIMIT

Mass campaign dapat memiliki budget/limit untuk mencegah accidental overspend.

---

# 244. ALERT COST

Alert jika:

```text
Unexpected volume
Unexpected provider cost
```

---

# 245. SYSTEM NOTIFICATION

System dapat mengirim notification internal untuk:

```text
Backup failure
Integration failure
High queue backlog
Security event
```

mengikuti observability specification.

---

# 246. ADMIN ALERT

Admin technical notification tidak boleh dikirim ke customer.

---

# 247. CUSTOMER-FACING ERROR

Customer hanya menerima user-friendly message.

---

# 248. INTERNAL TECHNICAL ERROR

Technical detail tersedia pada:

```text
Admin
Logs
Monitoring
```

---

# 249. FINAL NOTIFICATION ARCHITECTURE

```text
Business Event
      ↓
Notification Rule
      ↓
Notification Service
      ↓
Queue / Outbox
      ↓
Worker
      ↓
Provider Adapter
      ↓
Email / WhatsApp / SMS / Push
      ↓
Provider Webhook
      ↓
Delivery Status
```

---

# 250. FINAL BUSINESS FLOW

```text
Booking Created
      ↓
Transaction Committed
      ↓
Notification Event
      ↓
Queue
      ↓
Customer Notification
      ↓
Delivery Tracking
```

---

# 251. FINAL PAYMENT FLOW

```text
Payment Proof Uploaded
      ↓
Payment = Pending Verification
      ↓
Notify Finance
      ↓
Finance Approves
      ↓
Payment = Approved
      ↓
Notify Customer
      ↓
Invoice / Booking State Updated
```

Urutan state mengikuti business rules dan transaction design yang telah ditetapkan.

---

# 252. FINAL CRM FLOW

```text
Lead Created
      ↓
Assign Sales
      ↓
Notify Sales
      ↓
Follow-up Created
      ↓
Reminder
      ↓
Follow-up Completed
      ↓
Quotation
      ↓
Booking
```

---

# 253. PRODUCTION READINESS CHECKLIST

```text
[ ] Notification service tersedia
[ ] Queue tersedia
[ ] Worker tersedia
[ ] Email provider configured
[ ] Messaging provider configured jika digunakan
[ ] Template management tersedia
[ ] Template versioning tersedia
[ ] Recipient resolution tersedia
[ ] Retry tersedia
[ ] Dead-letter handling tersedia
[ ] Idempotency tersedia
[ ] Deduplication tersedia
[ ] Delivery tracking tersedia
[ ] Webhook validation tersedia
[ ] Notification preference tersedia
[ ] Consent handling tersedia
[ ] Marketing opt-out tersedia
[ ] Audit tersedia
[ ] Provider monitoring tersedia
[ ] Queue monitoring tersedia
[ ] Critical queue isolation tersedia
[ ] Payment notification tested
[ ] Booking notification tested
[ ] CRM notification tested
[ ] Invoice notification tested
[ ] Security notification tested
[ ] Load test passed
[ ] Failure test passed
[ ] Sensitive data protection tested
```

---

# 254. DOCUMENT DEPENDENCY

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
18_PERFORMANCE_SCALABILITY_AND_CAPACITY_SPECIFICATION.md
19_REPORTING_ANALYTICS_AND_DASHBOARD_SPECIFICATION.md
```

---

# 255. NEXT DOCUMENT

Dokumen berikutnya:

```text
21_FILE_AND_DOCUMENT_MANAGEMENT_SPECIFICATION.md
```

Dokumen tersebut akan mengunci:

```text
File upload
File storage
Customer documents
Payment proof
Invoice/PDF
Quotation documents
Article media
Product images
Attachments
File validation
Virus/malware scanning
File access control
Private/public files
Signed URL
File versioning
File metadata
Storage lifecycle
Retention
Deletion
Download
Preview
Image processing
Document generation
File audit
```

---

# END OF DOCUMENT