# BATAM TRAVELLING ERP
# REPORTING, ANALYTICS AND DASHBOARD SPECIFICATION

**File Name:** `19_REPORTING_ANALYTICS_AND_DASHBOARD_SPECIFICATION.md`  
**Document Number:** 19  
**Version:** 1.0  
**Status:** PRODUCTION BASELINE  
**Project:** Batam Travelling ERP  
**Last Updated:** 2026-08-08

---

# 1. PURPOSE

Dokumen ini mendefinisikan arsitektur, business requirement, functional requirement, data requirement, permission, performance requirement, dan operational requirement untuk:

- Reporting
- Analytics
- Dashboard
- KPI
- Operational monitoring
- Sales analytics
- CRM analytics
- Booking analytics
- Payment analytics
- Finance analytics
- Customer analytics
- Product analytics
- CMS analytics
- Management reporting

Dokumen ini menjadi acuan utama untuk implementasi seluruh fitur reporting dan analytics.

---

# 2. OBJECTIVE

Reporting system harus memungkinkan management dan operational team menjawab:

```text
Apa yang terjadi?
Mengapa terjadi?
Siapa yang melakukan?
Kapan terjadi?
Berapa nilainya?
Apa trend-nya?
Apa yang perlu ditindaklanjuti?
```

---

# 3. REPORTING PRINCIPLE

Reporting harus:

```text
Accurate
Consistent
Traceable
Permission-aware
Timely
Performant
Exportable
Auditable
```

---

# 4. SOURCE OF TRUTH

Setiap metric harus memiliki source of truth yang jelas.

Contoh:

```text
Booking count
→ Booking table

Payment received
→ Payment transaction

Revenue
→ Finance-approved transaction

Lead conversion
→ CRM lifecycle

Website traffic
→ Analytics platform
```

Tidak boleh ada dua definisi metric yang berbeda tanpa dokumentasi.

---

# 5. METRIC DEFINITION

Setiap KPI harus memiliki:

```text
Metric name
Definition
Formula
Source
Filter
Time basis
Owner
Refresh frequency
Permission
```

---

# 6. REPORTING CATEGORIES

Reporting dibagi menjadi:

```text
Management
Sales
CRM
Booking
Payment
Finance
Customer
Product
CMS
Operations
User Activity
System
```

---

# 7. MANAGEMENT DASHBOARD

Management dashboard menampilkan ringkasan:

```text
Revenue
Bookings
Payments
Customers
Leads
Conversion
Outstanding payment
Outstanding invoice
Sales performance
Product performance
```

---

# 8. MANAGEMENT KPI

Minimum KPI:

```text
Total Revenue
Total Booking
Total Customer
Total Lead
Lead Conversion Rate
Booking Conversion Rate
Average Booking Value
Outstanding Payment
Outstanding Invoice
Cancelled Booking
Refund
```

---

# 9. REVENUE KPI

Revenue report harus membedakan:

```text
Gross Revenue
Net Revenue
Paid Revenue
Outstanding Amount
Refund
Discount
Tax
```

Definisi final mengikuti business rules dan finance policy.

---

# 10. REVENUE PERIOD

Revenue dapat ditampilkan berdasarkan:

```text
Today
Yesterday
This Week
This Month
This Quarter
This Year
Custom Range
```

---

# 11. REVENUE TREND

Dashboard harus mendukung trend:

```text
Daily
Weekly
Monthly
Quarterly
Yearly
```

---

# 12. BOOKING DASHBOARD

Booking dashboard:

```text
Total Booking
Confirmed
Pending
Cancelled
Completed
Refunded
```

---

# 13. BOOKING TREND

Tampilkan:

```text
Booking volume
Booking value
Average booking value
Cancellation rate
Completion rate
```

---

# 14. BOOKING BY PRODUCT

Report:

```text
Product
Booking count
Revenue
Average value
Cancellation
```

---

# 15. BOOKING BY SALES

Report:

```text
Sales
Lead
Quotation
Booking
Revenue
Conversion
```

---

# 16. BOOKING BY CUSTOMER

Report:

```text
Customer
Booking count
Total value
Last booking
Average booking
```

---

# 17. CRM DASHBOARD

CRM dashboard minimal:

```text
New Leads
Qualified Leads
Contacted
Quoted
Won
Lost
Follow-up Due
Overdue Follow-up
```

---

# 18. LEAD FUNNEL

Visualisasi:

```text
Visitor
↓
Inquiry
↓
Lead
↓
Contacted
↓
Qualified
↓
Quotation
↓
Booking
↓
Paid
```

---

# 19. CRM CONVERSION

Metric:

```text
Lead → Quotation
Quotation → Booking
Lead → Booking
Booking → Paid
```

---

# 20. LEAD SOURCE

Analytics berdasarkan:

```text
Website
Landing Page
Blog
Organic Search
Social
Referral
Sales
Manual
Other
```

---

# 21. SALES PERFORMANCE

Sales report:

```text
Salesperson
Lead assigned
Lead contacted
Quotation
Booking
Revenue
Conversion rate
Follow-up completion
```

---

# 22. SALES RANKING

Management dapat melihat ranking berdasarkan:

```text
Revenue
Booking
Conversion
Closed deals
```

Ranking harus mengikuti permission.

---

# 23. FOLLOW-UP REPORT

Report CRM:

```text
Due today
Due this week
Overdue
Completed
Missed
```

---

# 24. FOLLOW-UP PERFORMANCE

Metric:

```text
Follow-up completion rate
Average response time
Overdue rate
Lead response rate
```

---

# 25. QUOTATION REPORT

Quotation report:

```text
Quotation count
Draft
Sent
Accepted
Rejected
Expired
Converted
```

---

# 26. QUOTATION CONVERSION

Metric:

```text
Accepted quotations / sent quotations
```

---

# 27. PAYMENT DASHBOARD

Payment dashboard:

```text
Paid
Pending
Verification
Failed
Refunded
Partial
Overdue
```

---

# 28. PAYMENT METHOD REPORT

Report berdasarkan:

```text
Bank transfer
Payment gateway
Cash
Other supported method
```

---

# 29. PAYMENT VERIFICATION REPORT

Jika customer atau sales dapat upload bukti transfer:

```text
Pending verification
Approved
Rejected
Needs review
```

Report harus menampilkan:

```text
Booking
Customer
Amount
Uploader
Uploaded date
Verifier
Verification date
Status
```

---

# 30. PAYMENT AGING

Outstanding payment dapat dikelompokkan:

```text
0–7 days
8–30 days
31–60 days
61–90 days
>90 days
```

Range dapat dikonfigurasi.

---

# 31. FINANCE DASHBOARD

Finance dashboard:

```text
Revenue
Receivable
Paid
Outstanding
Refund
Discount
Tax
Invoice
```

---

# 32. INVOICE REPORT

Invoice report:

```text
Draft
Issued
Sent
Paid
Partially Paid
Overdue
Cancelled
```

---

# 33. RECEIVABLE REPORT

Report:

```text
Customer
Invoice
Booking
Invoice amount
Paid
Outstanding
Due date
Days overdue
```

---

# 34. REFUND REPORT

Refund report:

```text
Refund request
Approved
Rejected
Processed
Refund amount
Reason
```

---

# 35. CUSTOMER DASHBOARD

Customer analytics:

```text
New customers
Returning customers
Active customers
Inactive customers
Customer lifetime value
Average booking value
```

---

# 36. CUSTOMER ACQUISITION

Report:

```text
Customer source
Acquisition period
First booking
First payment
```

---

# 37. CUSTOMER RETENTION

Metric:

```text
Repeat booking rate
Returning customer rate
```

---

# 38. CUSTOMER VALUE

Customer value dapat dihitung berdasarkan:

```text
Total paid booking value
```

Definisi harus konsisten dengan finance policy.

---

# 39. PRODUCT DASHBOARD

Product analytics:

```text
Product views
Inquiries
Bookings
Revenue
Conversion
Cancellation
```

---

# 40. PRODUCT PERFORMANCE

Ranking produk berdasarkan:

```text
Booking
Revenue
Conversion
```

---

# 41. PRODUCT PROFITABILITY

Jika cost data tersedia:

```text
Revenue
Cost
Gross Profit
Margin
```

Jika cost belum tersedia, system tidak boleh mengklaim profit sebagai actual.

---

# 42. PRODUCT CATEGORY REPORT

Analytics berdasarkan:

```text
Product category
Booking
Revenue
Customer
Conversion
```

---

# 43. CMS DASHBOARD

CMS analytics mencakup:

```text
Articles
Landing pages
Views
Clicks
Product clicks
Inquiries
Conversion
```

---

# 44. ARTICLE PERFORMANCE

Article report:

```text
Article
Views
Unique visitors
Engagement
Product clicks
CTA clicks
Leads
Bookings
```

Metric yang tidak tersedia dari source data harus ditandai sebagai unavailable.

---

# 45. ARTICLE → PRODUCT ANALYTICS

Website mendukung product placement di artikel blog.

Analytics harus dapat mengukur:

```text
Article
↓
Product impression
↓
Product click
↓
Inquiry
↓
Booking
```

---

# 46. LANDING PAGE PERFORMANCE

Report:

```text
Landing page
Visitors
CTA clicks
Product clicks
Inquiry
Lead
Booking
Conversion
```

---

# 47. CONTENT CONVERSION

Metric:

```text
Content visitor → inquiry
Content visitor → lead
Content visitor → booking
```

---

# 48. SEO REPORT

Jika SEO data tersedia:

```text
Organic traffic
Landing pages
Search impressions
Clicks
CTR
```

Data external analytics harus dibedakan dari transactional ERP data.

---

# 49. OPERATIONS DASHBOARD

Operations dashboard:

```text
Upcoming booking
Today's booking
Pending action
Payment pending
Customer issue
Cancelled booking
```

---

# 50. DAILY OPERATIONS REPORT

Daily report:

```text
Today's booking
Today's payment
Pending verification
Follow-up due
Upcoming service
Operational exception
```

---

# 51. EXCEPTION REPORT

Exception report harus menunjukkan:

```text
Overdue payment
Overdue follow-up
Failed payment
Failed notification
Cancelled booking
Unverified transfer
```

---

# 52. SYSTEM DASHBOARD

System dashboard untuk authorized technical users:

```text
API latency
Error rate
Queue
CPU
Memory
Database
Storage
```

Detail infrastructure mengikuti dokumen 15 dan 18.

---

# 53. AUDIT REPORT

Audit report dapat menampilkan:

```text
User
Action
Entity
Timestamp
Before
After
IP/device metadata
```

Sensitive fields harus mengikuti security policy.

---

# 54. REPORT FILTERING

Semua report yang relevan harus mendukung:

```text
Date
Status
User
Sales
Product
Customer
Source
Payment method
```

Filter hanya ditampilkan jika relevan.

---

# 55. DATE FILTER

Date filter:

```text
Today
Yesterday
Last 7 days
Last 30 days
This month
Last month
This year
Custom
```

---

# 56. TIMEZONE

Reporting menggunakan timezone system/business yang telah ditentukan.

Timestamp internal tetap menggunakan standard storage strategy.

---

# 57. CURRENCY

Report financial harus memiliki currency yang jelas.

Jika multi-currency digunakan:

```text
Original currency
Converted currency
Exchange rate
Conversion date
```

harus dapat ditelusuri.

---

# 58. REPORT SORTING

User dapat melakukan sorting pada field yang relevan:

```text
Date
Amount
Count
Revenue
Status
Name
```

---

# 59. REPORT PAGINATION

Large report harus menggunakan pagination atau asynchronous export.

---

# 60. REPORT SEARCH

Report dapat memiliki search berdasarkan:

```text
Customer
Booking number
Invoice number
Quotation number
Product
Salesperson
```

---

# 61. REPORT DRILL-DOWN

Dashboard KPI harus dapat membuka detail jika user memiliki permission.

Contoh:

```text
Revenue
↓
Revenue transactions
↓
Booking
↓
Payment
↓
Invoice
```

---

# 62. DRILL-DOWN PERMISSION

User tidak boleh membuka detail yang tidak memiliki authorization.

---

# 63. REPORT DETAIL

Detail report minimal menyediakan:

```text
Entity
Status
Amount
Date
Owner
Reference
```

---

# 64. DASHBOARD CARD

Dashboard card minimal:

```text
Title
Current value
Comparison
Period
Trend
```

---

# 65. TREND COMPARISON

Support:

```text
vs yesterday
vs previous period
vs previous month
vs previous year
```

---

# 66. PERCENTAGE CHANGE

Formula:

```text
(Current - Previous) / Previous × 100%
```

Jika previous value = 0, UI tidak boleh menampilkan misleading percentage.

---

# 67. CHART TYPES

Chart yang dapat digunakan:

```text
Line
Bar
Stacked bar
Area
Pie/Donut
Funnel
Table
```

Gunakan chart yang sesuai dengan jenis data.

---

# 68. DATA VISUALIZATION PRINCIPLE

Chart harus:

```text
Readable
Accurate
Consistent
Accessible
```

---

# 69. COLOR SEMANTICS

Status color harus konsisten.

Contoh:

```text
Success
Warning
Error
Neutral
```

Tidak boleh hanya mengandalkan warna untuk menyampaikan status.

---

# 70. TABLE VIEW

Setiap chart penting harus memiliki alternatif table/data view jika diperlukan.

---

# 71. RESPONSIVE DASHBOARD

Dashboard harus dapat digunakan pada:

```text
Desktop
Tablet
Mobile
```

Jika mobile dashboard tidak praktis untuk semua widget, prioritaskan KPI dan critical operational data.

---

# 72. ROLE-BASED DASHBOARD

Dashboard berdasarkan role:

```text
Admin
Management
Sales
CRM
Finance
Operations
Content
Customer Service
```

---

# 73. ADMIN DASHBOARD

Admin:

```text
System overview
Users
Security
Operational metrics
Audit
```

---

# 74. MANAGEMENT DASHBOARD

Management:

```text
Revenue
Booking
Sales
CRM
Customer
Product
Finance
```

---

# 75. SALES DASHBOARD

Sales:

```text
My leads
Follow-up
Quotation
Booking
Revenue
Conversion
```

---

# 76. CRM DASHBOARD

CRM:

```text
Lead funnel
Follow-up
Lead source
Conversion
Response time
```

---

# 77. FINANCE DASHBOARD

Finance:

```text
Payment
Invoice
Receivable
Refund
Revenue
```

---

# 78. OPERATIONS DASHBOARD

Operations:

```text
Upcoming booking
Today's booking
Pending task
Exception
```

---

# 79. CONTENT DASHBOARD

Content:

```text
Articles
Landing pages
Views
Product clicks
Content conversion
```

---

# 80. CUSTOMER SERVICE DASHBOARD

Customer service:

```text
Inquiry
Open issue
Follow-up
Customer activity
```

---

# 81. PERSONAL DASHBOARD

User dapat memiliki personal dashboard untuk:

```text
My tasks
My leads
My bookings
My follow-ups
My performance
```

---

# 82. DASHBOARD CUSTOMIZATION

Jika diaktifkan, user dapat:

```text
Show/hide widget
Reorder widget
Save filter
```

Customization tidak boleh mengubah data permission.

---

# 83. SAVED REPORT

User dapat menyimpan konfigurasi report:

```text
Name
Filters
Columns
Sorting
Grouping
```

---

# 84. SHARED REPORT

Authorized user dapat membagikan saved report berdasarkan permission.

---

# 85. REPORT FAVORITE

User dapat menandai report sebagai favorite.

---

# 86. EXPORT

Report dapat diekspor jika permission memungkinkan.

Format minimum:

```text
CSV
XLSX
PDF
```

Format final mengikuti implementasi dan use case.

---

# 87. EXPORT LIMIT

Export besar harus asynchronous.

---

# 88. EXPORT AUDIT

Export harus dicatat:

```text
User
Report
Filter
Timestamp
Format
```

---

# 89. EXPORT SECURITY

Export tidak boleh melewati permission user.

---

# 90. SENSITIVE REPORT

Report financial, audit, customer data, dan payment proof harus memiliki access control ketat.

---

# 91. REPORT PERMISSION MODEL

Permission:

```text
View
Create
Edit
Delete
Export
Share
Schedule
```

---

# 92. ROW-LEVEL ACCESS

Jika diperlukan, user hanya dapat melihat data yang menjadi scope-nya.

Contoh:

```text
Sales
→ My leads

Manager
→ Team leads

Finance
→ Financial records
```

---

# 93. COLUMN-LEVEL SECURITY

Sensitive column dapat disembunyikan berdasarkan role.

---

# 94. REPORT DATA MASKING

Sensitive data dapat dimasking.

Contoh:

```text
Phone
Email
Payment information
Personal identification
```

---

# 95. REPORT SCHEDULING

User authorized dapat menjadwalkan report.

Schedule:

```text
Daily
Weekly
Monthly
```

---

# 96. SCHEDULED REPORT DELIVERY

Output dapat dikirim melalui:

```text
Email
Internal notification
Download center
```

Integration mengikuti notification specification.

---

# 97. SCHEDULED REPORT SECURITY

Jangan mengirim sensitive report melalui channel yang tidak aman.

---

# 98. REPORT RECIPIENT CONTROL

Scheduled report hanya dapat dikirim kepada recipient yang authorized.

---

# 99. REPORT HISTORY

System menyimpan:

```text
Generated
Downloaded
Failed
Expired
```

sesuai retention policy.

---

# 100. REPORT EXPIRATION

File export dapat memiliki expiration untuk mengurangi storage risk.

---

# 101. REPORT GENERATION

Small report:

```text
Synchronous
```

Large report:

```text
Asynchronous
```

---

# 102. REPORT QUEUE

Heavy report diproses melalui background queue.

---

# 103. REPORT PRIORITY

Priority:

```text
Critical operational
Management
Scheduled
Ad-hoc
Bulk export
```

---

# 104. REPORT ISOLATION

Reporting tidak boleh membebani transactional database secara berlebihan.

Strategi dapat menggunakan:

```text
Read replica
Materialized view
Precomputed aggregate
Analytics database
Data warehouse
```

sesuai scale.

---

# 105. TRANSACTIONAL DATABASE PROTECTION

Report query tidak boleh menyebabkan:

```text
Booking slowdown
Payment slowdown
Authentication slowdown
```

---

# 106. ANALYTICS DATASET

Analytics dataset dapat mengandung:

```text
Booking facts
Payment facts
Customer dimensions
Product dimensions
Sales dimensions
Date dimensions
```

jika architecture berkembang ke analytical model.

---

# 107. DATA WAREHOUSE

Data warehouse belum wajib pada initial deployment jika volume masih rendah.

Architecture harus memungkinkan penambahan di masa depan.

---

# 108. AGGREGATION

Aggregation dapat dilakukan:

```text
Real-time
Near real-time
Hourly
Daily
```

tergantung kebutuhan.

---

# 109. REAL-TIME METRICS

Real-time digunakan untuk:

```text
Payment status
Booking operational status
Queue
Critical exceptions
```

---

# 110. BATCH ANALYTICS

Batch cocok untuk:

```text
Monthly revenue
Historical analysis
Large aggregation
Management reports
```

---

# 111. DATA FRESHNESS

Setiap report harus memiliki freshness expectation.

Contoh:

| Report | Freshness |
|---|---|
| Payment status | Near real-time |
| Booking operations | Near real-time |
| Sales dashboard | Minutes |
| Management KPI | Minutes/Hours |
| Historical analytics | Daily |

---

# 112. DATA FRESHNESS INDICATOR

Jika data tidak real-time, UI sebaiknya menunjukkan:

```text
Last updated
```

---

# 113. DATA DELAY

Jika data pipeline delay, system tidak boleh menampilkan seolah-olah data real-time.

---

# 114. DATA RECONCILIATION

Financial reports harus dapat direkonsiliasi dengan transactional source.

---

# 115. REVENUE RECONCILIATION

Revenue dashboard harus dapat ditelusuri ke:

```text
Invoice
Payment
Booking
Refund
```

---

# 116. PAYMENT RECONCILIATION

Payment report harus dapat dibandingkan dengan payment transaction source.

---

# 117. BOOKING RECONCILIATION

Booking KPI harus dapat direkonsiliasi dengan booking records.

---

# 118. KPI VERSIONING

Jika formula KPI berubah:

```text
Old definition
New definition
Effective date
```

harus didokumentasikan.

---

# 119. METRIC CATALOG

System harus memiliki metric catalog.

Minimal:

```text
Metric
Definition
Formula
Source
Owner
Refresh
```

---

# 120. REPORT CATALOG

System harus memiliki report catalog:

```text
Report name
Purpose
Audience
Source
Filters
Permissions
Refresh
Export
```

---

# 121. STANDARD REPORTS

Minimum standard report:

```text
Sales Report
CRM Lead Report
Follow-up Report
Quotation Report
Booking Report
Payment Report
Invoice Report
Receivable Report
Refund Report
Customer Report
Product Report
Article Performance Report
Landing Page Report
```

---

# 122. MANAGEMENT REPORT

Management report harus menggabungkan:

```text
Revenue
Booking
Sales
CRM
Payment
Customer
Product
```

---

# 123. DAILY MANAGEMENT SUMMARY

Optional scheduled summary:

```text
Yesterday revenue
Yesterday bookings
Pending payments
New leads
Conversion
Operational exceptions
```

---

# 124. WEEKLY MANAGEMENT SUMMARY

```text
Weekly revenue
Booking trend
Sales performance
Lead conversion
Product performance
Outstanding payment
```

---

# 125. MONTHLY MANAGEMENT SUMMARY

```text
Monthly revenue
Booking
Profitability if available
Sales performance
Customer growth
Product performance
CRM conversion
```

---

# 126. SALES REPORT EXPORT

Sales dapat export hanya data yang diizinkan oleh permission.

---

# 127. FINANCE REPORT EXPORT

Finance export harus dicatat di audit log.

---

# 128. AUDIT REPORT EXPORT

Audit export harus memiliki permission paling ketat.

---

# 129. REPORT API

Reporting API harus dipisahkan secara logical dari transactional API.

Contoh:

```text
/api/reports
/api/analytics
/api/dashboard
```

Actual routing mengikuti API specification.

---

# 130. REPORT API PERFORMANCE

Standard report API:

```text
p95 < 2s
```

Large reports harus asynchronous.

---

# 131. DASHBOARD API

Dashboard sebaiknya tidak melakukan puluhan request individual jika dapat digabungkan secara efisien.

Gunakan aggregation endpoint atau optimized query strategy.

---

# 132. DASHBOARD QUERY OPTIMIZATION

Dashboard harus menghindari:

```text
N+1 query
Unbounded query
Full table scan
Repeated aggregation
```

---

# 133. DASHBOARD CACHE

Dashboard metric yang tidak critical real-time dapat di-cache.

---

# 134. REPORT CACHE

Report cache harus memiliki invalidation/TTL strategy.

---

# 135. FINANCIAL CACHE RESTRICTION

Financial values yang memerlukan real-time accuracy tidak boleh menggunakan stale cache tanpa indikator yang jelas.

---

# 136. ANALYTICS ERROR HANDLING

Jika analytics source gagal:

```text
Show unavailable state
Log error
Do not fabricate data
```

---

# 137. PARTIAL DATA

Jika sebagian data belum tersedia:

```text
Partial data
Last updated
Source status
```

harus ditampilkan jika relevan.

---

# 138. ZERO DATA STATE

Jika tidak ada data:

```text
No data for selected period
```

bukan:

```text
0
```

kecuali memang nilai metric adalah zero.

---

# 139. REPORT VALIDATION

Report harus diuji terhadap known dataset.

---

# 140. KPI TESTING

Setiap KPI harus memiliki automated atau repeatable test untuk formula-nya.

---

# 141. REPORT TESTING

Test:

```text
Filter
Permission
Calculation
Pagination
Sorting
Export
Timezone
Currency
```

---

# 142. REPORT PERFORMANCE TESTING

Test:

```text
Normal dataset
Large dataset
Peak concurrent users
Concurrent report generation
```

---

# 143. REPORT SECURITY TESTING

Test:

```text
Unauthorized report
Cross-role access
Export permission
Row-level access
Sensitive fields
```

---

# 144. DATA QUALITY CHECK

Analytics harus mendeteksi:

```text
Missing data
Duplicate
Invalid status
Orphan record
Unexpected value
```

---

# 145. DATA QUALITY ALERT

Jika data quality turun di bawah threshold, admin/owner harus mendapatkan alert.

---

# 146. REPORT OBSERVABILITY

Monitor:

```text
Report generation time
Failure rate
Query latency
Export volume
Queue depth
Data freshness
```

---

# 147. REPORT SLA

Initial SLA:

```text
Dashboard:
p95 < 2 seconds

Standard report:
p95 < 3 seconds

Large export:
Asynchronous
```

---

# 148. REPORT FAILURE

Jika report gagal:

```text
Status = Failed
Error logged
User notified
Retry available if safe
```

---

# 149. REPORT RETRY

Retry harus aman dan tidak menghasilkan duplicate financial operation.

---

# 150. REPORT JOB ID

Asynchronous report memiliki:

```text
Job ID
Status
Created
Started
Completed
Failed
```

---

# 151. REPORT DOWNLOAD CENTER

User dapat melihat:

```text
Recent exports
Status
Format
Created date
Expiration
Download
```

---

# 152. REPORT STORAGE

Generated report disimpan pada object/file storage sesuai infrastructure specification.

---

# 153. REPORT RETENTION

Report files memiliki retention policy.

---

# 154. REPORT CLEANUP

Expired reports harus dihapus secara otomatis sesuai retention policy.

---

# 155. SCHEDULED REPORT FAILURE

Jika scheduled report gagal:

```text
Log
Retry
Notify owner
```

---

# 156. DASHBOARD AVAILABILITY

Management dashboard harus tersedia selama core system available, dengan graceful degradation bila analytics source bermasalah.

---

# 157. OFFLINE / DEGRADED ANALYTICS

Jika analytics tidak tersedia:

```text
Core booking/payment tetap berjalan.
```

Reporting adalah non-blocking terhadap transactional system.

---

# 158. CRITICAL BUSINESS PRINCIPLE

```text
Reporting failure
≠
Transaction failure
```

Kegagalan dashboard tidak boleh menghentikan booking atau payment.

---

# 159. REPORTING ARCHITECTURE

Baseline architecture:

```text
Transactional System
        ↓
Events / Data Extraction
        ↓
Reporting / Analytics Layer
        ↓
Aggregations
        ↓
Dashboard / Reports
```

---

# 160. DATA FLOW

Contoh:

```text
Booking Created
↓
Booking Event
↓
Analytics Update
↓
Booking KPI
↓
Dashboard
```

---

# 161. PAYMENT DATA FLOW

```text
Payment Confirmed
↓
Finance Event
↓
Revenue Aggregation
↓
Dashboard
```

---

# 162. CRM DATA FLOW

```text
Lead Created
↓
CRM Event
↓
Funnel Aggregation
↓
CRM Dashboard
```

---

# 163. CMS DATA FLOW

```text
Article Published
↓
Content Analytics
↓
Views / Product Clicks
↓
Conversion
```

---

# 164. CONTENT → PRODUCT ATTRIBUTION

Jika user datang melalui article:

```text
Article
↓
Product
↓
Inquiry
↓
Booking
```

system harus mempertahankan attribution identifier jika tracking architecture mendukung.

---

# 165. ATTRIBUTION MODEL

Minimum attribution:

```text
First touch
Last touch
Content source
Campaign source
```

Model final dapat diperluas.

---

# 166. CAMPAIGN REPORT

Jika campaign tracking tersedia:

```text
Campaign
Traffic
Leads
Bookings
Revenue
Conversion
```

---

# 167. UTM SUPPORT

Website dapat menyimpan:

```text
utm_source
utm_medium
utm_campaign
utm_term
utm_content
```

jika tracking digunakan.

---

# 168. ATTRIBUTION DATA RETENTION

Attribution data harus mengikuti privacy dan retention policy.

---

# 169. DASHBOARD PERSONALIZATION

Dashboard dapat menyesuaikan role dan scope user.

---

# 170. DEFAULT DASHBOARD

Setiap role memiliki default dashboard.

---

# 171. DASHBOARD WIDGET PERMISSION

Widget harus menghormati permission.

---

# 172. EMPTY WIDGET

Widget tanpa permission atau tanpa data tidak boleh membocorkan data melalui aggregate.

---

# 173. AGGREGATE DATA SECURITY

Aggregate juga dianggap sensitive jika dapat digunakan untuk menyimpulkan restricted data.

---

# 174. REPORT ACCESS AUDIT

Access terhadap sensitive report dapat dicatat.

---

# 175. REPORT DELETE

User tidak boleh menghapus official report definition kecuali memiliki permission.

---

# 176. REPORT VERSIONING

Report definition dapat memiliki version jika formula atau struktur berubah.

---

# 177. REPORT OWNERSHIP

Setiap official report memiliki owner.

Contoh:

```text
Finance
CRM
Sales
Operations
Management
```

---

# 178. REPORT CHANGE CONTROL

Perubahan report official harus melalui:

```text
Requirement
Review
Test
Approval
Release
```

---

# 179. KPI GOVERNANCE

KPI management tidak boleh diubah sembarangan oleh individual user.

---

# 180. KPI APPROVAL

Critical KPI formula membutuhkan approval dari business owner.

---

# 181. BUSINESS DEFINITION

Contoh:

```text
"Paid Booking"
```

harus memiliki definisi formal.

Misalnya:

```text
Booking dengan payment status confirmed/paid sesuai business rule.
```

---

# 182. REPORT CONSISTENCY

Dashboard dan export untuk metric yang sama harus menggunakan definisi metric yang sama.

---

# 183. REPORT RECONCILIATION FREQUENCY

Financial report dapat direkonsiliasi:

```text
Daily
Monthly
```

sesuai kebutuhan finance.

---

# 184. REPORT ARCHIVE

Historical official reports dapat di-archive untuk audit.

---

# 185. MANAGEMENT REPORT SNAPSHOT

Monthly management report dapat disimpan sebagai snapshot agar historical result tetap dapat direproduksi.

---

# 186. HISTORICAL DATA

Historical report tidak boleh berubah secara silent akibat perubahan formula.

---

# 187. BACKFILL

Jika data analytics diperbaiki:

```text
Backfill
Recalculate
Validate
Document
```

---

# 188. ANALYTICS PIPELINE FAILURE

Jika pipeline gagal:

```text
Detect
Retry
Backfill
Validate
```

---

# 189. DATA LAG ALERT

Alert jika data freshness melewati SLA.

---

# 190. REPORTING CAPACITY

Reporting workload harus memiliki capacity planning sendiri.

Monitor:

```text
Query volume
Report jobs
Export jobs
Storage
Processing time
```

---

# 191. REPORT RESOURCE ISOLATION

Jika reporting workload meningkat, scaling reporting tidak boleh otomatis menghabiskan resource transactional workload.

---

# 192. ANALYTICS DATABASE

Dapat digunakan ketika:

```text
Reporting query mulai berat
Data volume meningkat
Dashboard semakin kompleks
```

---

# 193. MATERIALIZED AGGREGATION

Metric yang sering digunakan dapat diprecompute.

Contoh:

```text
Daily revenue
Monthly booking
Sales performance
```

---

# 194. REAL-TIME VS ANALYTICAL TRADE-OFF

Tidak semua report harus real-time.

Prioritaskan:

```text
Operational data → fresh
Historical analytics → efficient
```

---

# 195. COST CONTROL

Analytics query dan storage harus dipantau agar tidak menghasilkan cloud cost yang tidak terkendali.

---

# 196. REPORT QUERY LIMIT

Report query harus memiliki:

```text
Timeout
Maximum rows
Maximum date range
```

sesuai jenis report.

---

# 197. QUERY TIMEOUT

Query yang melewati threshold harus dihentikan atau diproses asynchronous.

---

# 198. REPORT UX

UI report harus memberikan feedback:

```text
Loading
Processing
Completed
Failed
No data
```

---

# 199. LARGE REPORT UX

Untuk large report:

```text
Generating report...
```

dan user dapat melanjutkan aktivitas lain.

---

# 200. FINAL REPORTING PRINCIPLE

```text
One Metric
=
One Definition
+
One Source of Truth
+
Controlled Access
+
Traceable Calculation
```

---

# 201. FINAL ARCHITECTURE PRINCIPLE

```text
Transactional System
        ↓
Events / ETL
        ↓
Analytics Layer
        ↓
Aggregations
        ↓
Reports / Dashboard
```

Reporting tidak boleh menjadi single point of failure bagi transaksi utama.

---

# 202. PRODUCTION READINESS CHECKLIST

```text
[ ] Metric catalog tersedia
[ ] KPI definition approved
[ ] Standard reports tersedia
[ ] Role-based dashboard tersedia
[ ] Permission diterapkan
[ ] Financial reconciliation tersedia
[ ] Export permission tersedia
[ ] Large export asynchronous
[ ] Report queue tersedia
[ ] Data freshness monitoring tersedia
[ ] Report performance tested
[ ] Report security tested
[ ] Dashboard performance tested
[ ] Reporting isolated dari transactional workload
[ ] Retention policy tersedia
[ ] Audit tersedia
[ ] KPI change control tersedia
```

---

# 203. DOCUMENT DEPENDENCY

Dokumen ini berkaitan dengan:

```text
03_BUSINESS_RULES_AND_POLICY.md
04_PRD_SYSTEM_REQUIREMENTS.md
09_UI_UX_AND_FRONTEND_SPECIFICATION.md
10_API_AND_INTEGRATION_SPECIFICATION.md
11_SECURITY_AUTHENTICATION_AND_AUDIT_SPECIFICATION.md
13_DEPLOYMENT_DEVOPS_INFRASTRUCTURE_SPECIFICATION.md
14_DATABASE_ARCHITECTURE_AND_DATA_MODEL_SPECIFICATION.md
15_OBSERVABILITY_MONITORING_AND_OPERATIONS_SPECIFICATION.md
17_TESTING_QUALITY_ASSURANCE_AND_RELEASE_VALIDATION_SPECIFICATION.md
18_PERFORMANCE_SCALABILITY_AND_CAPACITY_SPECIFICATION.md
```

---

# 204. NEXT DOCUMENT

Dokumen berikutnya:

```text
20_NOTIFICATION_AND_COMMUNICATION_SPECIFICATION.md
```

Dokumen tersebut akan mengunci:

```text
Email
WhatsApp / messaging integration
Internal notification
Notification template
Transactional notification
CRM follow-up notification
Payment notification
Booking notification
Invoice notification
Reminder
Scheduled notification
Retry
Queue
Provider failure
Notification preference
Opt-out
Notification audit
Delivery status
Rate limiting
Template management
```

---

# END OF DOCUMENT