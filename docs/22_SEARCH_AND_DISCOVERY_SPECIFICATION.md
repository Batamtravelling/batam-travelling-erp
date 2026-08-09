# BATAM TRAVELLING ERP
# SEARCH AND DISCOVERY SPECIFICATION

**File Name:** `22_SEARCH_AND_DISCOVERY_SPECIFICATION.md`  
**Document Number:** 22  
**Version:** 1.0  
**Status:** PRODUCTION BASELINE  
**Project:** Batam Travelling ERP  
**Last Updated:** 2026-08-08

---

# 1. PURPOSE

Dokumen ini mendefinisikan architecture, functional requirements, indexing strategy, relevance, filtering, sorting, autocomplete, permission enforcement, public search, internal ERP search, CMS search, dan search analytics untuk Batam Travelling ERP.

Search & Discovery harus memungkinkan user menemukan informasi yang relevan secara cepat tanpa melanggar authorization atau data isolation.

---

# 2. OBJECTIVE

Search system harus menyediakan:

```text
Fast
Relevant
Permission-aware
Consistent
Scalable
Auditable
```

Search harus bekerja untuk:

```text
Internal ERP
Customer portal
Public website
CMS
Product catalog
Article/blog
Media library
```

---

# 3. SEARCH PRINCIPLE

Search bukan bypass authorization.

```text
Search Result
    ↓
Authorization
    ↓
Visible Result
```

User hanya boleh menemukan resource yang memang boleh ia akses.

---

# 4. SEARCH DOMAINS

Minimum search domain:

```text
CUSTOMER
LEAD
CONTACT
BOOKING
PAYMENT
INVOICE
QUOTATION
PRODUCT
ARTICLE
LANDING_PAGE
MEDIA
DOCUMENT
TASK
ACTIVITY
USER
```

---

# 5. SEARCH MODES

System mendukung:

```text
GLOBAL_SEARCH
ENTITY_SEARCH
PUBLIC_SEARCH
CMS_SEARCH
MEDIA_SEARCH
```

---

# 6. GLOBAL SEARCH

Global search memungkinkan user mencari beberapa entity dari satu input.

Contoh:

```text
"john"
```

dapat menghasilkan:

```text
Customer
Booking
Invoice
Quotation
Activity
```

---

# 7. ENTITY SEARCH

Entity search fokus pada satu domain.

Contoh:

```text
Customer Search
Product Search
Booking Search
```

---

# 8. PUBLIC SEARCH

Public website search hanya mencari content yang:

```text
Published
Public
Indexable
```

---

# 9. CMS SEARCH

CMS search mencakup:

```text
Article
Landing Page
Product
Media
Category
Tag
```

sesuai permission CMS user.

---

# 10. MEDIA SEARCH

Media library search berdasarkan:

```text
Filename
Title
Alt text
Caption
Tag
Type
Upload date
```

---

# 11. DOCUMENT SEARCH

Document search berdasarkan:

```text
Filename
Category
Owner
Entity
Uploader
Date
Status
```

Full-text document search hanya diaktifkan jika security model mendukung.

---

# 12. SEARCH INPUT

Search input harus menerima:

```text
Text
Numbers
Codes
Reference numbers
Names
Keywords
```

---

# 13. MINIMUM QUERY LENGTH

Untuk global/public search:

```text
Minimum = 2 characters
```

dapat digunakan sebagai baseline.

Autocomplete dapat memiliki threshold berbeda.

---

# 14. EMPTY QUERY

Empty query tidak boleh melakukan expensive global search.

Jika UI membutuhkan default list:

```text
GET recent/popular
```

harus menggunakan endpoint/list operation khusus.

---

# 15. QUERY NORMALIZATION

Search engine harus melakukan normalization seperti:

```text
Trim
Case normalization
Whitespace normalization
```

sesuai kebutuhan.

---

# 16. TYPO TOLERANCE

Search dapat mendukung typo tolerance.

Contoh:

```text
"Batm"
```

dapat menemukan:

```text
"Batam"
```

---

# 17. FUZZY SEARCH

Fuzzy search harus dibatasi agar tidak menghasilkan terlalu banyak irrelevant result.

---

# 18. EXACT MATCH

Exact identifier harus memiliki priority tinggi.

Contoh:

```text
INV-2026-000123
```

harus lebih relevan daripada document lain yang hanya mengandung angka serupa.

---

# 19. PREFIX SEARCH

Autocomplete harus mendukung prefix search.

Contoh:

```text
Bat
```

→

```text
Batam
Batam Tour
Batam Hotel
```

---

# 20. PARTIAL SEARCH

Entity search dapat mendukung partial matching.

---

# 21. SEARCH TOKENIZATION

Text harus di-tokenize sesuai language/search engine capability.

---

# 22. INDONESIAN LANGUAGE

Public content search harus mendukung Bahasa Indonesia.

---

# 23. ENGLISH LANGUAGE

Jika website memiliki English content, search harus dapat mengindeks English content.

---

# 24. STOPWORDS

Search engine dapat menggunakan language-specific stopwords.

Namun stopword removal tidak boleh merusak identifier atau business terms.

---

# 25. SEARCHABLE FIELDS

Setiap entity harus mendefinisikan field mana yang searchable.

Contoh Customer:

```text
name
email
phone
customer_code
```

---

# 26. CUSTOMER SEARCH FIELDS

Minimum:

```text
customer_code
name
email
phone
company_name
```

---

# 27. LEAD SEARCH FIELDS

Minimum:

```text
lead_code
name
email
phone
company
```

---

# 28. BOOKING SEARCH FIELDS

Minimum:

```text
booking_code
customer_name
customer_code
product_name
travel_date
```

---

# 29. PAYMENT SEARCH FIELDS

Minimum:

```text
payment_reference
booking_code
customer_name
amount
```

---

# 30. INVOICE SEARCH FIELDS

Minimum:

```text
invoice_number
customer_name
booking_code
```

---

# 31. QUOTATION SEARCH FIELDS

Minimum:

```text
quotation_number
customer_name
lead_name
```

---

# 32. PRODUCT SEARCH FIELDS

Minimum:

```text
product_code
name
short_description
description
category
tag
```

---

# 33. ARTICLE SEARCH FIELDS

Minimum:

```text
title
excerpt
body
category
tag
author
```

---

# 34. LANDING PAGE SEARCH FIELDS

Minimum:

```text
title
slug
description
SEO title
SEO description
```

---

# 35. MEDIA SEARCH FIELDS

Minimum:

```text
filename
title
alt_text
caption
tag
```

---

# 36. SEARCH WEIGHTING

Fields memiliki relevance weight berbeda.

Contoh:

```text
Exact code       = Very High
Exact title      = High
Name             = High
Keyword          = Medium
Description      = Lower
```

---

# 37. SEARCH RELEVANCE

Baseline ranking:

```text
Exact match
↓
Prefix match
↓
Strong field match
↓
Multiple field match
↓
Fuzzy match
↓
Weak content match
```

---

# 38. MULTI-FIELD MATCH

Document yang cocok pada beberapa field dapat mendapatkan relevance score lebih tinggi.

---

# 39. RECENCY BOOST

Untuk entity tertentu, recent data dapat memperoleh boost.

Contoh:

```text
Customer activity
CRM activity
Recent bookings
```

Namun recency tidak boleh mengalahkan exact identifier match.

---

# 40. BUSINESS PRIORITY BOOST

Search dapat memberikan boost untuk:

```text
Active product
Published article
Current booking
Active customer
```

---

# 41. INACTIVE DATA

Inactive records dapat tetap searchable untuk authorized internal users.

---

# 42. DELETED DATA

Deleted records tidak boleh muncul dalam normal search.

---

# 43. ARCHIVED DATA

Archived data dapat dicari jika user memiliki permission.

---

# 44. PUBLIC CONTENT INDEXING

Public search hanya mengindeks:

```text
Published
Public
Search-enabled
```

content.

---

# 45. DRAFT CONTENT

Draft article/landing page tidak boleh muncul pada public search.

---

# 46. SCHEDULED CONTENT

Scheduled content hanya muncul pada public search setelah publish time tercapai.

---

# 47. UNPUBLISHED PRODUCT

Unpublished product tidak boleh muncul di public search.

---

# 48. CMS PREVIEW

CMS preview dapat mencari draft jika user memiliki permission.

Preview result harus diberi status draft.

---

# 49. SEARCH AUTHORIZATION

Setiap search request harus menentukan:

```text
User
Role
Tenant/scope
Entity permission
Visibility
```

---

# 50. PERMISSION-AWARE INDEX

Search index dapat menggunakan ACL metadata jika diperlukan.

---

# 51. SECURITY FILTER

Alternative implementation:

```text
Search
↓
Candidate results
↓
Authorization filter
↓
Final results
```

---

# 52. NO DATA LEAK

Search result tidak boleh mengungkap:

```text
Existence
Name
Code
Metadata
```

dari resource yang user tidak berhak akses.

---

# 53. RESULT COUNT LEAK

Total result count juga tidak boleh mengungkap jumlah private resource yang tidak boleh dilihat user.

---

# 54. SEARCH API

Logical endpoint:

```text
GET /api/search
```

---

# 55. GLOBAL SEARCH REQUEST

Contoh logical query:

```text
/api/search?q=batam
```

---

# 56. ENTITY FILTER

```text
/api/search?q=batam&type=product
```

---

# 57. MULTIPLE ENTITY FILTER

```text
/api/search?q=batam&type=product,article
```

jika didukung.

---

# 58. SEARCH PAGINATION

Search harus mendukung pagination.

Baseline:

```text
page
page_size
```

---

# 59. PAGE SIZE

Default:

```text
20
```

Maximum:

```text
100
```

Actual values configurable.

---

# 60. CURSOR PAGINATION

Untuk high-volume search, cursor-based pagination lebih disukai.

---

# 61. OFFSET PAGINATION

Offset pagination dapat digunakan untuk low-volume/admin search.

---

# 62. SORTING

Supported:

```text
Relevance
Newest
Oldest
Name
Price
Date
Status
```

sesuai entity.

---

# 63. DEFAULT SORT

Default:

```text
Relevance
```

untuk search query.

---

# 64. ADMIN LIST SORT

Admin entity listing dapat default:

```text
Newest
```

atau business-specific sort.

---

# 65. FILTERING

Search harus mendukung filter yang relevan.

Contoh Product:

```text
Category
Price
Status
Availability
```

---

# 66. CUSTOMER FILTER

```text
Status
Sales owner
Created date
Source
```

---

# 67. BOOKING FILTER

```text
Status
Travel date
Product
Sales
Payment status
```

---

# 68. PAYMENT FILTER

```text
Status
Payment method
Date
Amount
Verification status
```

---

# 69. ARTICLE FILTER

```text
Category
Tag
Author
Status
Published date
```

---

# 70. MEDIA FILTER

```text
Type
Category
Uploader
Date
Size
Status
```

---

# 71. FACETED SEARCH

Public product/content search dapat menggunakan facets.

Contoh:

```text
Category
Destination
Price range
Duration
```

---

# 72. FACET COUNT SECURITY

Facet count hanya menghitung resource yang visible.

---

# 73. SEARCH AUTOCOMPLETE

Autocomplete harus:

```text
Fast
Lightweight
Relevant
Permission-aware
```

---

# 74. AUTOCOMPLETE RESPONSE

Autocomplete dapat mengembalikan:

```text
label
type
id
display metadata
```

---

# 75. AUTOCOMPLETE LIMIT

Baseline:

```text
Maximum 10 suggestions
```

---

# 76. AUTOCOMPLETE DEBOUNCE

Frontend harus menggunakan debounce untuk mengurangi request.

Baseline:

```text
200–300 ms
```

---

# 77. AUTOCOMPLETE CACHE

Safe public suggestions dapat di-cache.

Private suggestions harus mempertimbangkan user scope.

---

# 78. SEARCH HISTORY

User dapat memiliki recent search history jika feature diaktifkan.

---

# 79. SEARCH HISTORY PRIVACY

Search history adalah user-specific dan tidak boleh terlihat user lain.

---

# 80. CLEAR SEARCH HISTORY

User dapat menghapus search history jika feature tersedia.

---

# 81. POPULAR SEARCH

Public website dapat menampilkan popular search terms.

---

# 82. POPULAR SEARCH PRIVACY

Popular search harus menggunakan aggregated data.

Jangan mengekspos individual user searches.

---

# 83. SEARCH ANALYTICS

Track:

```text
Query
Timestamp
Result count
Selected result
Search domain
```

sesuai privacy policy.

---

# 84. ZERO RESULT TRACKING

Search tanpa result harus dapat diukur.

---

# 85. ZERO RESULT ANALYSIS

Gunakan untuk menemukan:

```text
Missing content
Missing products
Misspellings
Demand patterns
```

---

# 86. SEARCH CLICK TRACKING

System dapat mencatat result mana yang dipilih.

---

# 87. SEARCH CONVERSION

Public search dapat dihubungkan dengan:

```text
Product view
Booking
Inquiry
Lead creation
```

untuk analytics.

---

# 88. SEARCH INDEX

Production dapat menggunakan dedicated search index untuk high-volume search.

---

# 89. DATABASE SEARCH

Database native search dapat digunakan untuk:

```text
Low volume
Admin CRUD
Simple filters
```

---

# 90. DEDICATED SEARCH ENGINE

Dedicated engine dapat digunakan untuk:

```text
Full-text
Fuzzy search
Faceting
Relevance
Large catalog
```

---

# 91. SEARCH ENGINE ABSTRACTION

Application harus tidak terlalu bergantung pada provider-specific query format.

---

# 92. INDEXABLE ENTITY

Entity harus memiliki explicit index policy.

Contoh:

```text
Product → YES
Published Article → YES
Draft Article → INTERNAL ONLY
Payment → PRIVATE
```

---

# 93. INDEX DOCUMENT

Search index document minimal:

```text
id
entity_type
title
searchable_text
status
visibility
scope
created_at
updated_at
```

---

# 94. INDEX ACL

Jika diperlukan:

```text
allowed_roles
allowed_users
organization_scope
customer_id
sales_scope
```

---

# 95. INDEX SOURCE OF TRUTH

Database/application tetap menjadi source of truth.

Search index adalah derived data.

---

# 96. INDEX UPDATE

Saat entity berubah:

```text
Entity Update
↓
Index Update Event
↓
Search Index
```

---

# 97. INDEX DELETE

Saat entity deleted/unpublished:

```text
Entity Change
↓
Remove/disable index document
```

---

# 98. EVENT-DRIVEN INDEXING

Event-driven indexing direkomendasikan untuk scalability.

---

# 99. INDEXING QUEUE

Indexing dapat menggunakan queue:

```text
Entity
↓
Event
↓
Queue
↓
Indexer
↓
Search Engine
```

---

# 100. INDEX RETRY

Failed indexing harus memiliki retry mechanism.

---

# 101. DEAD LETTER

Persistent indexing failure dapat masuk dead-letter queue.

---

# 102. INDEX LAG

System harus memonitor delay:

```text
Database update
→
Search index update
```

---

# 103. EVENTUAL CONSISTENCY

Search index dapat eventual consistent.

Namun critical internal lookup berdasarkan exact identifier dapat menggunakan source database jika diperlukan.

---

# 104. READ-AFTER-WRITE

Jika user baru membuat entity dan langsung mencari, system sebaiknya memberikan predictable behavior.

---

# 105. CRITICAL LOOKUP

Untuk:

```text
Booking code
Invoice number
Payment reference
Quotation number
```

exact lookup dapat langsung ke database.

---

# 106. EXACT IDENTIFIER RESOLUTION

Identifier exact harus memprioritaskan direct lookup.

---

# 107. SEARCH INDEX REBUILD

System harus dapat rebuild index dari database.

---

# 108. FULL REINDEX

Full reindex workflow:

```text
Read source
↓
Transform
↓
Bulk index
↓
Validate count
↓
Activate index
```

---

# 109. ZERO-DOWNTIME REINDEX

Gunakan versioned index jika search engine mendukung.

---

# 110. INDEX VERSION

Contoh:

```text
erp-search-v1
erp-search-v2
```

---

# 111. INDEX SWITCH

Setelah validation:

```text
v1 → v2
```

dengan controlled switch.

---

# 112. INDEX VALIDATION

Validate:

```text
Document count
Sample records
Permissions
Search relevance
```

---

# 113. INDEX FAILURE

Jika reindex gagal:

```text
Current production index
```

tetap digunakan sampai replacement valid.

---

# 114. SEARCH AVAILABILITY

Jika search engine unavailable, system harus memiliki fallback untuk critical operations.

---

# 115. FALLBACK SEARCH

Fallback dapat menggunakan database query untuk:

```text
Exact identifier
Simple name lookup
```

---

# 116. SEARCH TIMEOUT

Search request harus memiliki timeout.

---

# 117. SEARCH RETRY

Frontend tidak boleh melakukan unlimited retry.

---

# 118. SEARCH RATE LIMIT

Public search harus memiliki rate limit untuk mencegah abuse.

---

# 119. SEARCH ABUSE

Proteksi terhadap:

```text
Query flooding
Very long query
Wildcard abuse
Regex abuse
Enumeration
```

---

# 120. QUERY LENGTH LIMIT

Baseline:

```text
Maximum 200 characters
```

untuk normal search.

---

# 121. SPECIAL QUERY SYNTAX

Advanced query syntax tidak diaktifkan untuk public users kecuali explicitly required.

---

# 122. REGEX SEARCH

Regex search tidak tersedia untuk public API.

---

# 123. WILDCARD SEARCH

Unlimited wildcard search tidak diperbolehkan.

---

# 124. SQL INJECTION

Search parameter harus menggunakan parameterized query.

---

# 125. SEARCH ENGINE INJECTION

Search query harus divalidasi sesuai query parser search engine.

---

# 126. HTML ESCAPING

Search result yang ditampilkan pada UI harus di-escape.

---

# 127. XSS PROTECTION

Search term tidak boleh dieksekusi sebagai HTML/JavaScript.

---

# 128. SEARCH RESULT HIGHLIGHTING

Highlighting dapat digunakan.

Contoh:

```text
Batam
```

match ditampilkan secara visual.

---

# 129. HIGHLIGHT SECURITY

Highlighted text harus di-render safely.

---

# 130. RESULT CARD

Public product result dapat menampilkan:

```text
Image
Name
Short description
Price
Category
```

---

# 131. ARTICLE RESULT

Article result dapat menampilkan:

```text
Cover
Title
Excerpt
Category
Published date
```

---

# 132. LANDING PAGE RESULT

Landing page result dapat menampilkan:

```text
Title
Description
Thumbnail
```

---

# 133. CUSTOMER RESULT

Internal customer result dapat menampilkan:

```text
Name
Customer code
Phone
Email
Status
```

sesuai permission.

---

# 134. BOOKING RESULT

Internal booking result dapat menampilkan:

```text
Booking code
Customer
Product
Travel date
Status
```

---

# 135. INVOICE RESULT

```text
Invoice number
Customer
Amount
Status
Date
```

---

# 136. QUOTATION RESULT

```text
Quotation number
Customer/Lead
Amount
Status
Date
```

---

# 137. PAYMENT RESULT

```text
Payment reference
Booking
Amount
Status
Verification state
```

Sensitive payment metadata harus mengikuti permission.

---

# 138. MEDIA RESULT

```text
Thumbnail
Filename
Type
Usage count
```

---

# 139. DOCUMENT RESULT

```text
Filename
Category
Owner
Entity
Date
```

---

# 140. SEARCH GROUPING

Global search dapat mengelompokkan:

```text
Customers
Bookings
Products
Articles
Invoices
```

---

# 141. RESULT LIMIT PER TYPE

Global search dapat membatasi result per entity type.

Contoh:

```text
5 Customers
5 Products
5 Articles
```

---

# 142. VIEW ALL

User dapat membuka full entity search dari result group.

---

# 143. SEARCH UI

Global search UI harus menyediakan:

```text
Search input
Autocomplete
Recent searches
Result groups
Filters
View all
```

---

# 144. KEYBOARD SUPPORT

Desktop search harus mendukung:

```text
Enter
Arrow Up
Arrow Down
Escape
```

---

# 145. ACCESSIBILITY

Search UI harus mendukung keyboard navigation dan screen reader semantics.

---

# 146. MOBILE SEARCH

Mobile search harus:

```text
Responsive
Touch-friendly
Fast
```

---

# 147. SEARCH LOADING STATE

UI harus menampilkan loading state yang tidak mengganggu typing.

---

# 148. SEARCH EMPTY STATE

Jika tidak ada result:

```text
Tidak ditemukan
```

dengan suggestion bila memungkinkan.

---

# 149. SEARCH ERROR STATE

Jika service error:

```text
Search temporarily unavailable
```

tanpa internal error detail.

---

# 150. SEARCH SUGGESTION

Suggestion dapat berupa:

```text
Related keyword
Category
Product
Article
```

---

# 151. PUBLIC SEARCH SEO

Public search page harus mengikuti SEO policy.

Search result page tidak boleh otomatis terindeks oleh search engine eksternal jika menghasilkan infinite/dynamic query space, kecuali strategy SEO memang mengizinkan.

---

# 152. SEARCH URL

Public search dapat menggunakan URL query:

```text
/search?q=batam
```

---

# 153. SEARCH URL SECURITY

Search URL tidak boleh memberikan access ke private resource.

---

# 154. SEARCH PARAMETER

Supported:

```text
q
page
sort
category
filter
```

sesuai domain.

---

# 155. SEARCH STATE

Frontend harus mempertahankan state saat user kembali dari detail result jika UX mengharuskan.

---

# 156. FILTER RESET

User dapat reset semua filter.

---

# 157. FILTER URL

Public search filter dapat disimpan pada URL agar shareable jika tidak mengandung private data.

---

# 158. PRIVATE SEARCH URL

Internal search URL tidak boleh dianggap sebagai authorization credential.

---

# 159. SEARCH DEEP LINK

Search result dapat deep-link ke entity detail.

Entity detail tetap melakukan authorization.

---

# 160. SEARCH RESULT CACHE

Public result dapat di-cache.

Private result cache harus user/scope-aware atau tidak di-cache.

---

# 161. SEARCH CACHE INVALIDATION

Public content update harus dapat mengurangi stale result.

---

# 162. PUBLIC INDEX REFRESH

Publish/unpublish article/product harus trigger index update.

---

# 163. ARTICLE PUBLISH FLOW

```text
Draft
↓
Publish
↓
Index
↓
Public Search
```

---

# 164. ARTICLE UNPUBLISH FLOW

```text
Published
↓
Unpublish
↓
Remove/disable index
↓
No longer public search result
```

---

# 165. PRODUCT PUBLISH FLOW

```text
Draft
↓
Published
↓
Index
↓
Public Search
```

---

# 166. PRODUCT UNPUBLISH

```text
Published
↓
Unpublished
↓
Index disabled
```

---

# 167. LANDING PAGE FLOW

```text
Draft
↓
Published
↓
Searchable
```

sesuai search visibility setting.

---

# 168. SEARCH VISIBILITY FLAG

Content dapat memiliki:

```text
searchable = true/false
```

---

# 169. NOINDEX VS INTERNAL SEARCH

SEO `noindex` dan internal site search visibility adalah dua konsep berbeda.

---

# 170. SEARCHABLE BUT NOINDEX

Content dapat:

```text
Internal Search = YES
Google Index = NO
```

---

# 171. NOT SEARCHABLE

Jika `searchable = false`, content tidak muncul dalam internal/public search sesuai domain.

---

# 172. SEARCH TAGS

Content dapat menggunakan tags untuk meningkatkan discovery.

---

# 173. TAG NORMALIZATION

Tag harus dinormalisasi agar:

```text
Batam
batam
BATAM
```

tidak menjadi duplicate tag jika policy mengharuskan case-insensitive tags.

---

# 174. CATEGORY FILTER

Category harus menggunakan canonical category ID, bukan hanya text.

---

# 175. PRODUCT DISCOVERY

Public product discovery dapat mendukung:

```text
Destination
Category
Duration
Price
Availability
```

---

# 176. ARTICLE DISCOVERY

Article discovery dapat mendukung:

```text
Category
Tag
Topic
Author
Published date
```

---

# 177. RELATED CONTENT

Article detail dapat menampilkan related articles berdasarkan:

```text
Category
Tag
Semantic similarity
Popularity
```

---

# 178. RELATED PRODUCT

Article dapat menampilkan product terkait.

Contoh:

```text
Article
↓
Related Product
```

---

# 179. PRODUCT IN ARTICLE

CMS harus memungkinkan article mencantumkan product references.

---

# 180. PRODUCT REFERENCE SEARCH

Editor dapat mencari product dari article editor.

---

# 181. PRODUCT EMBED

Article dapat menampilkan product card dari canonical product entity.

Article tidak boleh menggandakan seluruh product master data.

---

# 182. PRODUCT CARD DATA

Product card dapat mengambil:

```text
Product name
Image
Short description
Price
CTA
```

dari product source of truth.

---

# 183. PRODUCT CARD UPDATE

Jika harga/product data berubah, embedded product card harus mengikuti canonical data sesuai caching policy.

---

# 184. DELETED PRODUCT IN ARTICLE

Jika referenced product dihapus/unpublished:

```text
Article
↓
Broken reference detection
```

harus tersedia.

---

# 185. PRODUCT DISCOVERY FROM ARTICLE

User dapat berpindah:

```text
Article
↓
Product
↓
Booking / Inquiry
```

---

# 186. SEARCH CONVERSION TRACKING

Public search dapat menjadi attribution source untuk:

```text
Product view
Lead
Booking
```

---

# 187. SEARCH EVENT

Event minimum:

```text
SEARCH_PERFORMED
SEARCH_RESULT_CLICKED
SEARCH_ZERO_RESULT
SEARCH_FILTER_USED
SEARCH_SORT_USED
```

---

# 188. EVENT DATA

Event dapat menyimpan:

```text
query
domain
result_count
selected_result
timestamp
session/context
```

dengan privacy controls.

---

# 189. SEARCH ANALYTICS DASHBOARD

Dashboard dapat menampilkan:

```text
Top queries
Zero-result queries
Search volume
CTR
Conversion
Popular filters
```

---

# 190. INTERNAL SEARCH ANALYTICS

Internal analytics dapat mengukur:

```text
Most searched customers
Most searched bookings
Zero-result queries
Search latency
```

tetap dengan privacy/access controls.

---

# 191. SEARCH PERFORMANCE

Target baseline:

```text
Autocomplete: < 300 ms target
Normal search: < 1 second target
Complex search: < 2 seconds target
```

Actual SLA mengikuti infrastructure capacity.

---

# 192. SEARCH P95

Performance monitoring menggunakan P50/P95/P99.

---

# 193. SEARCH LATENCY ALERT

Alert jika latency melewati threshold berulang.

---

# 194. SEARCH AVAILABILITY

Search service harus memiliki monitoring availability.

---

# 195. SEARCH METRICS

Minimum:

```text
search_requests_total
search_errors_total
search_latency
search_zero_results
autocomplete_requests
indexing_events
indexing_failures
index_lag
```

---

# 196. INDEX METRICS

Monitor:

```text
Documents
Index size
Indexing throughput
Queue depth
Failed events
Lag
```

---

# 197. SEARCH LOGGING

Log:

```text
Request ID
Domain
Latency
Result count
Error category
```

---

# 198. QUERY LOG PRIVACY

Search query dapat mengandung personal information.

Logging harus mengikuti privacy policy dan retention policy.

---

# 199. SENSITIVE QUERY

Sensitive query tidak boleh ditulis ke log secara unrestricted.

---

# 200. SEARCH DATA RETENTION

Search analytics retention harus ditentukan secara terpisah dari business entity retention.

---

# 201. SEARCH DISASTER RECOVERY

Search index bukan source of truth.

Jika index hilang:

```text
Database
↓
Rebuild Index
```

---

# 202. SEARCH BACKUP

Index backup optional jika rebuild dapat dilakukan dengan cepat.

---

# 203. REINDEX AFTER DISASTER

System harus memiliki documented reindex procedure.

---

# 204. SEARCH SECURITY TEST

Test:

```text
Unauthorized result
IDOR
Query injection
XSS
Enumeration
Rate-limit bypass
```

---

# 205. SEARCH FUNCTIONAL TEST

Test:

```text
Exact match
Partial match
Typo
Filter
Sort
Pagination
Autocomplete
Zero result
```

---

# 206. INDEX CONSISTENCY TEST

Test:

```text
Create
Update
Publish
Unpublish
Delete
Restore
```

terhadap search index.

---

# 207. PERMISSION TEST

Test matrix:

```text
Admin
Sales
Finance
Operations
Customer
Public
```

---

# 208. CUSTOMER ISOLATION TEST

Customer A tidak boleh menemukan:

```text
Customer B
Booking B
Invoice B
Payment B
```

melalui search.

---

# 209. SALES SCOPE TEST

Sales hanya dapat menemukan customer/booking sesuai scope business rule.

---

# 210. FINANCE SCOPE TEST

Finance dapat mencari financial records sesuai finance permission.

---

# 211. PUBLIC ISOLATION TEST

Anonymous user hanya mendapatkan public indexed content.

---

# 212. SEARCH ENUMERATION PROTECTION

Repeated identifier probing tidak boleh menjadi cara untuk mengetahui private resource existence.

---

# 213. SEARCH ABUSE RATE LIMIT

Public:

```text
Per IP
Per session
Per endpoint
```

dapat digunakan sesuai security architecture.

---

# 214. INTERNAL RATE LIMIT

Internal search juga dapat memiliki reasonable rate limit untuk melindungi infrastructure.

---

# 215. SEARCH EXPORT

Jika search result dapat diexport:

```text
Authorization
Field filtering
Audit
Rate limit
```

wajib diterapkan.

---

# 216. SEARCH RESULT EXPORT

Export hanya memasukkan fields yang boleh diexport oleh role.

---

# 217. SEARCH INDEX REBUILD PERMISSION

Full reindex hanya untuk authorized operations/admin.

---

# 218. SEARCH CONFIGURATION

Search configuration dapat mengatur:

```text
Field weights
Synonyms
Stopwords
Result limits
Indexable entities
```

---

# 219. SYNONYMS

Public search dapat mendukung synonyms.

Contoh:

```text
wisata = tour
hotel = accommodation
```

hanya jika business requirement mengizinkan.

---

# 220. SYNONYM GOVERNANCE

Synonym tidak boleh menghasilkan misleading result.

---

# 221. SPELLING DICTIONARY

Business-specific dictionary dapat digunakan.

Contoh:

```text
Batam
Nongsa
Bintan
Barelang
```

---

# 222. SEARCH RELEVANCE TUNING

Relevance dapat dituning berdasarkan:

```text
Search analytics
CTR
Zero result
Business priority
```

---

# 223. MANUAL BOOST

Admin dapat memberikan controlled boost terhadap content tertentu jika CMS membutuhkan.

---

# 224. BOOST GOVERNANCE

Manual boost harus:

```text
Audited
Limited
Reversible
```

---

# 225. SEARCH RESULT DUPLICATE

Search harus menghindari duplicate result untuk entity yang sama.

---

# 226. CANONICAL RESULT

Jika beberapa index document merepresentasikan satu entity, response harus mengembalikan canonical entity.

---

# 227. SEARCH INDEX DOCUMENT ID

Recommended:

```text
{entity_type}:{entity_id}
```

---

# 228. INDEX FIELD VERSIONING

Jika index schema berubah, gunakan versioned mapping/index.

---

# 229. SEARCH SCHEMA MIGRATION

Migration harus mendukung:

```text
Create new index
Backfill
Validate
Switch
Retire old index
```

---

# 230. SEARCH ENGINE PROVIDER

Search engine provider tidak dikunci dalam business layer.

---

# 231. SEARCH ADAPTER

Architecture:

```text
Application
↓
Search Service
↓
Search Adapter
↓
Search Provider
```

---

# 232. DATABASE FALLBACK

Critical exact lookup dapat fallback ke relational database.

---

# 233. SEARCH SERVICE BOUNDARY

Business modules tidak boleh melakukan direct provider-specific search calls secara tersebar.

---

# 234. SEARCH API RESPONSE

Logical response:

```json
{
  "query": "batam",
  "results": [],
  "total": 0,
  "page": 1,
  "page_size": 20
}
```

Actual API schema mengikuti Document 10.

---

# 235. SEARCH RESULT CONTRACT

Result minimal:

```text
id
type
title
url/detail_reference
score/relevance if applicable
display metadata
```

---

# 236. INTERNAL RESULT CONTRACT

Internal result dapat menambahkan:

```text
status
owner
code
date
```

sesuai permission.

---

# 237. PUBLIC RESULT CONTRACT

Public result hanya mengandung public-safe fields.

---

# 238. SEARCH ERROR CONTRACT

Error:

```text
INVALID_QUERY
RATE_LIMITED
SEARCH_UNAVAILABLE
TIMEOUT
```

---

# 239. NO INTERNAL ERROR LEAK

Search engine stack trace tidak boleh dikirim ke client.

---

# 240. SEARCH FEATURE FLAGS

Search features dapat dikontrol dengan feature flags:

```text
Fuzzy Search
Semantic Search
Related Content
Popular Search
Search Analytics
```

---

# 241. SEMANTIC SEARCH

Semantic/vector search dapat menjadi future capability.

Tidak wajib untuk initial production baseline.

---

# 242. HYBRID SEARCH

Jika semantic search digunakan:

```text
Keyword relevance
+
Semantic relevance
```

dapat digabungkan.

---

# 243. SEMANTIC SEARCH SECURITY

Vector index juga harus mengikuti access control.

---

# 244. EMBEDDING DATA

Embedding tidak boleh dianggap public jika source content private.

---

# 245. SEARCH AI

AI-generated search summary jika digunakan harus:

```text
Authorization-aware
Source-grounded
Auditable
```

---

# 246. AI SEARCH NOT SOURCE OF TRUTH

AI search tidak boleh mengubah business data tanpa authorized workflow.

---

# 247. SEARCH DISCOVERY UX

Public website harus menyediakan discovery melalui:

```text
Search
Categories
Tags
Related content
Related products
Popular content
```

---

# 248. SEARCH + ARTICLE

Article dapat menjadi entry point ke:

```text
Related products
Related articles
Booking
Inquiry
```

---

# 249. SEARCH + PRODUCT

Product search harus dapat mengarah ke:

```text
Product detail
Booking
Inquiry
```

---

# 250. SEARCH + CMS

CMS editor dapat mencari:

```text
Product
Article
Media
```

langsung dari editor.

---

# 251. SEARCH + MEDIA

Media picker harus mendukung:

```text
Search
Filter
Preview
Select
Upload
```

---

# 252. MEDIA PICKER SECURITY

Editor hanya dapat memilih media yang accessible dan compatible dengan context.

---

# 253. SEARCH + FILE

File search mengikuti permission File Management Document 21.

---

# 254. SEARCH + NOTIFICATION

Search result dapat menjadi deep-link pada notification.

---

# 255. SEARCH + REPORTING

Search analytics masuk ke reporting layer.

---

# 256. SEARCH + AUDIT

Administrative search configuration changes harus diaudit.

---

# 257. SEARCH + OBSERVABILITY

Operational metrics masuk ke observability system.

---

# 258. SEARCH + BACKUP

Source database menjadi recovery source untuk rebuilding search index.

---

# 259. SEARCH + TESTING

Search harus menjadi bagian dari automated regression test.

---

# 260. PRODUCTION READINESS CHECKLIST

```text
[ ] Global search tersedia
[ ] Entity search tersedia
[ ] Public search tersedia
[ ] CMS search tersedia
[ ] Media search tersedia
[ ] Product search tersedia
[ ] Article search tersedia
[ ] Exact identifier search tersedia
[ ] Prefix search tersedia
[ ] Partial search tersedia
[ ] Fuzzy search tested jika enabled
[ ] Search authorization tersedia
[ ] Customer isolation tested
[ ] Role-based search tested
[ ] Public/private separation tested
[ ] Pagination tersedia
[ ] Filtering tersedia
[ ] Sorting tersedia
[ ] Autocomplete tersedia
[ ] Typo tolerance tested
[ ] Search relevance tested
[ ] Search indexing tersedia
[ ] Index retry tersedia
[ ] Index rebuild tersedia
[ ] Index versioning tersedia
[ ] Index lag monitoring tersedia
[ ] Search rate limiting tersedia
[ ] Query length limit tersedia
[ ] Injection protection tested
[ ] XSS protection tested
[ ] Search analytics tersedia
[ ] Zero-result tracking tersedia
[ ] Search conversion tracking tersedia
[ ] Search metrics tersedia
[ ] Search logs tersedia
[ ] Privacy controls tersedia
[ ] Public SEO behavior defined
[ ] Article search tested
[ ] Product search tested
[ ] Landing page search tested
[ ] Product-in-article discovery tested
[ ] Media picker tested
[ ] Search fallback tested
[ ] Disaster reindex tested
[ ] Performance test passed
[ ] Security test passed
```

---

# 261. ACCEPTANCE CRITERIA

Implementation dianggap memenuhi specification apabila:

### Global Search

```text
User dapat menemukan entity yang memang boleh ia akses.
```

### Public Search

```text
Anonymous user hanya dapat menemukan published public content.
```

### Authorization

```text
Search tidak dapat digunakan untuk bypass permission.
```

### Exact Lookup

```text
Booking, invoice, quotation, dan payment reference dapat ditemukan dengan identifier yang benar.
```

### CMS

```text
Editor dapat mencari product, article, dan media untuk kebutuhan content creation.
```

### Product Discovery

```text
User dapat menemukan product dari search dan berpindah ke product detail.
```

### Article Discovery

```text
User dapat menemukan article berdasarkan title, keyword, category, dan tag.
```

### Product in Article

```text
Article dapat menghubungkan canonical product tanpa menduplikasi product master data.
```

### Performance

```text
Search memenuhi target latency production yang ditetapkan.
```

### Security

```text
Unauthorized resource tidak muncul dalam search result maupun result count.
```

### Recovery

```text
Search index dapat dibangun ulang dari source database.
```

---

# 262. FINAL SEARCH ARCHITECTURE

```text
                         ┌────────────────────┐
                         │      CLIENTS       │
                         ├────────────────────┤
                         │ ERP │ Portal │ Web │
                         │ CMS │ Mobile │ API │
                         └─────────┬──────────┘
                                   │
                                   ▼
                         ┌────────────────────┐
                         │   SEARCH SERVICE   │
                         └─────────┬──────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    ▼              ▼              ▼
             Authorization    Query Parser    Ranking
                    │              │              │
                    └──────────────┼──────────────┘
                                   ▼
                         ┌────────────────────┐
                         │   SEARCH INDEX     │
                         └─────────┬──────────┘
                                   │
                                   ▼
                         ┌────────────────────┐
                         │   SEARCH RESULTS   │
                         └────────────────────┘

Source of Truth:

Database
   │
   ├── Customer
   ├── Booking
   ├── Payment
   ├── Invoice
   ├── Quotation
   ├── Product
   ├── Article
   ├── Landing Page
   └── Media
```

---

# 263. FINAL PUBLIC DISCOVERY FLOW

```text
Visitor
   ↓
Search
   ↓
Normalize Query
   ↓
Search Published Public Index
   ↓
Rank
   ↓
Filter
   ↓
Product / Article / Landing Page
   ↓
Detail
   ↓
Related Product / Related Article
   ↓
Inquiry / Booking
```

---

# 264. FINAL INTERNAL SEARCH FLOW

```text
ERP User
   ↓
Global Search
   ↓
Authenticate
   ↓
Determine Role + Scope
   ↓
Search Candidate Records
   ↓
Apply Authorization
   ↓
Rank
   ↓
Display
   ↓
Open Entity Detail
   ↓
Entity-level Authorization
```

---

# 265. FINAL CMS DISCOVERY FLOW

```text
Editor
   ↓
Article / Landing Page Editor
   ↓
Search Product / Article / Media
   ↓
Select Canonical Entity
   ↓
Insert Reference
   ↓
Save
   ↓
Preview
   ↓
Publish
   ↓
Public Search Index Update
```

---

# 266. FINAL DESIGN RULES

Search implementation wajib mengikuti aturan berikut:

```text
1. Search is not authorization.
2. Database is source of truth.
3. Search index is derived data.
4. Private data must remain permission-aware.
5. Public search only indexes public content.
6. Exact business identifiers receive highest priority.
7. Search must support pagination and filtering.
8. Autocomplete must be lightweight.
9. Search must be rate-limited.
10. Search queries must be safely processed.
11. Search analytics must respect privacy.
12. Index must be rebuildable.
13. Index changes must be observable.
14. CMS product references must use canonical product entities.
15. Deleted/unpublished content must leave public search.
16. Search failure must not compromise business data.
17. Critical exact lookup should have a reliable fallback.
18. Search configuration changes must be auditable.
19. Semantic/AI search is optional and must remain authorization-aware.
20. Search must never expose information simply because it exists in the index.
```

---

# 267. DOCUMENT DEPENDENCIES

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
```

---

# 268. NEXT DOCUMENT

Dokumen berikutnya:

```text
23_BUSINESS_WORKFLOW_AND_AUTOMATION_SPECIFICATION.md
```

Fokus utama:

```text
Workflow engine
State machine
Approval workflow
Booking workflow
Payment workflow
Quotation workflow
Invoice workflow
CRM workflow
Customer lifecycle
Sales workflow
Operations workflow
Task automation
Scheduled automation
Event-driven automation
Rule engine
Triggers
Conditions
Actions
Escalation
SLA
Retry
Idempotency
Human approval
Audit trail
Workflow monitoring
```

---

# END OF DOCUMENT