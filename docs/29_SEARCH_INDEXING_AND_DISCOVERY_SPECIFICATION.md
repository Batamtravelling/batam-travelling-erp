# 29_SEARCH_INDEXING_AND_DISCOVERY_SPECIFICATION.md

**Project:** Batam Travelling ERP  
**Document:** 29 — Search, Indexing and Discovery Specification  
**Version:** 1.0  
**Status:** FINAL / PRODUCTION BASELINE  
**Date:** 2026-08-09

---

## 1. PURPOSE

Dokumen ini mendefinisikan arsitektur dan behavior untuk search, indexing, filtering, sorting, autocomplete, discovery, relevance, indexing lifecycle, dan search observability.

Search harus mendukung kebutuhan:

- pencarian global;
- pencarian tenant;
- artikel;
- landing page;
- product;
- category;
- destination;
- business/service;
- media;
- user/resource administratif;
- discovery berbasis metadata.

Search bukan source of truth. Database/domain service tetap menjadi source of truth.

---

# 2. DESIGN PRINCIPLES

1. Search index adalah derived data.
2. Database/domain service adalah authoritative source.
3. Search harus tenant-aware.
4. Cross-tenant leakage wajib dicegah.
5. Indexing harus idempotent.
6. Eventual consistency harus ditangani secara eksplisit.
7. Delete harus menghapus document dari index.
8. Permission harus diterapkan saat query.
9. Reindex harus dapat dilakukan tanpa downtime.
10. Search relevance harus dapat diobservasi dan diperbaiki.
11. Query harus aman dari injection dan abuse.
12. Search failure tidak boleh merusak source data.

---

# 3. SEARCH SCOPE

Search domain minimum:

```text
Articles
Landing Pages
Products
Categories
Destinations
Businesses
Services
Media
Users
Tenants
Bookings
Orders
Invoices
```

Tidak semua entity wajib searchable pada public search.

---

# 4. SEARCH CHANNELS

Search dibagi menjadi:

```text
Public Search
Tenant Search
Admin Search
Internal Operational Search
```

Setiap channel memiliki authorization dan ranking policy sendiri.

---

# 5. PUBLIC SEARCH

Public search hanya menampilkan content/resource yang:

```text
Published
Public
Active
Searchable
```

Draft, archived, private, dan restricted content tidak boleh muncul.

---

# 6. TENANT SEARCH

Tenant user hanya dapat mencari resource yang:

```text
Owned by tenant
Shared with tenant
Explicitly authorized
```

---

# 7. ADMIN SEARCH

Admin search dapat memiliki wider scope sesuai role.

Namun admin search tetap wajib menggunakan object-level authorization.

---

# 8. SEARCH SOURCE OF TRUTH

| Data | Source of Truth |
|---|---|
| Article | Content database |
| Landing Page | Content database |
| Product | Product/Catalog service |
| User | Identity/User service |
| Tenant | Tenant service |
| Invoice | Billing service |
| Booking | Booking service |

Search index hanya projection.

---

# 9. SEARCH INDEX

Search index minimum menyimpan:

```text
document_id
entity_type
entity_id
tenant_id
visibility
status
title
description
content
keywords
category_ids
tags
language
locale
published_at
updated_at
created_at
url/reference
searchable metadata
```

---

# 10. DOCUMENT ID

Recommended:

```text
{entity_type}:{entity_id}
```

Contoh:

```text
article:abc123
product:p456
landing_page:l789
```

Document ID harus deterministic.

---

# 11. TENANT FIELD

Tenant-scoped document wajib memiliki:

```text
tenant_id
```

Global public content dapat memiliki explicit global scope.

---

# 12. VISIBILITY

Minimum:

```text
PUBLIC
TENANT
PRIVATE
ADMIN
```

---

# 13. INDEXABLE STATUS

Entity hanya di-index jika memenuhi policy.

Contoh article:

```text
PUBLISHED + SEARCHABLE = INDEX
DRAFT = REMOVE
ARCHIVED = REMOVE
```

---

# 14. SEARCHABLE FLAG

Entity dapat memiliki:

```text
searchable = true/false
```

Jika false, document harus tidak muncul pada search.

---

# 15. INDEXING PIPELINE

```text
Domain Change
     ↓
Domain Event
     ↓
Indexing Queue
     ↓
Indexer
     ↓
Transform
     ↓
Upsert/Delete
     ↓
Search Index
```

---

# 16. EVENT-DRIVEN INDEXING

Recommended events:

```text
article.created
article.updated
article.published
article.unpublished
article.deleted

product.created
product.updated
product.archived

landing_page.published
landing_page.updated
landing_page.archived
```

---

# 17. INDEXING IDEMPOTENCY

Repeated event tidak boleh menghasilkan duplicate document.

Indexer menggunakan deterministic document ID.

---

# 18. EVENT ORDERING

Event dapat datang tidak berurutan.

Indexer harus dapat menangani:

```text
update
→ publish
→ update
→ unpublish
```

tanpa menghasilkan stale published document.

---

# 19. VERSION CHECK

Domain event dapat membawa:

```text
entity_version
updated_at
```

Indexer dapat menolak stale event jika version lebih rendah dari indexed version.

---

# 20. DELETE INDEXING

Delete event harus menghapus document.

Jika source record dihapus sebelum event diproses, indexer harus tetap dapat remove berdasarkan document ID.

---

# 21. INDEXING RETRY

Indexer harus memiliki:

```text
Retry
Backoff
Dead-letter queue
Failure logging
Manual replay
```

---

# 22. DEAD LETTER

Failed indexing event masuk DLQ setelah retry threshold.

Admin dapat:

```text
Inspect
Retry
Discard
```

sesuai permission.

---

# 23. FULL REINDEX

System wajib mendukung full reindex.

Full reindex digunakan untuk:

```text
Schema change
Mapping change
Ranking change
Data repair
Migration
Index corruption
```

---

# 24. ZERO-DOWNTIME REINDEX

Recommended strategy:

```text
Create new index
→ Build
→ Validate
→ Warm
→ Switch alias
→ Retire old index
```

---

# 25. INDEX ALIAS

Application sebaiknya query alias:

```text
search_current
```

bukan direct index version.

---

# 26. INDEX VERSION

Index version dapat:

```text
search_v1
search_v2
search_v3
```

Alias menentukan active version.

---

# 27. INDEX VALIDATION

Sebelum alias switch, validasi:

```text
Document count
Sample documents
Tenant distribution
Visibility
Required fields
Search quality
Query latency
```

---

# 28. REINDEX PROGRESS

Backoffice harus dapat melihat:

```text
Total
Processed
Succeeded
Failed
Remaining
Rate
ETA
```

---

# 29. SEARCH QUERY

Search query dapat terdiri dari:

```text
query text
filters
sort
pagination
facets
locale
tenant scope
```

---

# 30. EMPTY QUERY

Empty query behavior harus explicit.

Possible:

```text
Show popular
Show recent
Show featured
Reject
```

Public discovery dapat menggunakan empty-query browsing.

---

# 31. TOKENIZATION

Search engine harus mendukung tokenization sesuai bahasa.

---

# 32. NORMALIZATION

Normalize:

```text
Case
Whitespace
Unicode
Punctuation
```

tanpa menghilangkan informasi penting.

---

# 33. TYPO TOLERANCE

Search dapat mendukung typo tolerance untuk user-facing search.

Contoh:

```text
batam
→ batem
```

Namun typo tolerance tidak boleh mengalahkan exact match secara default.

---

# 34. EXACT MATCH

Exact match mendapatkan ranking priority lebih tinggi daripada fuzzy match.

---

# 35. PREFIX SEARCH

Autocomplete menggunakan prefix matching.

---

# 36. AUTOCOMPLETE

Autocomplete harus cepat dan lightweight.

Response dapat berisi:

```text
Suggested query
Entity
Title
Type
Thumbnail
URL/reference
```

---

# 37. AUTOCOMPLETE LIMIT

Default suggestion count harus dibatasi.

Contoh:

```text
5–10 suggestions
```

---

# 38. SEARCH DEBOUNCE

Frontend autocomplete menggunakan debounce untuk mengurangi request.

---

# 39. MINIMUM QUERY LENGTH

Autocomplete dapat memerlukan minimum character count.

Contoh:

```text
2 atau 3 characters
```

---

# 40. STOP WORDS

Stop-word handling harus disesuaikan bahasa.

Jangan menghapus stop words jika menyebabkan false negative pada exact phrase.

---

# 41. SYNONYMS

Search dapat memiliki synonym dictionary:

```text
hotel = penginapan
travel = wisata
tour = tur
```

Dictionary harus versioned.

---

# 42. SYNONYM GOVERNANCE

Synonym change harus:

```text
Audited
Versioned
Tested
Rollbackable
```

---

# 43. LANGUAGE

Search harus mendukung multilingual content jika platform menggunakannya.

Field:

```text
language
locale
```

---

# 44. LANGUAGE DETECTION

Language dapat berasal dari:

```text
Explicit content metadata
Application locale
Language detection
```

Explicit metadata diprioritaskan.

---

# 45. LOCALE FILTER

User dapat menerima result sesuai locale.

Fallback dapat:

```text
Requested locale
→ default locale
→ language-compatible content
```

---

# 46. INDONESIAN SEARCH

Untuk Bahasa Indonesia, search dapat mempertimbangkan:

```text
stemming
normalization
common variants
```

Testing harus menggunakan actual domain vocabulary.

---

# 47. CONTENT INDEXING

Article index dapat mencakup:

```text
title
excerpt
body
category
tags
author
destination
product references
published_at
SEO metadata
```

---

# 48. ARTICLE SEARCH

Ranking article dapat mempertimbangkan:

```text
Title
Heading
Exact phrase
Tags
Category
Body
Freshness
Popularity
```

---

# 49. LANDING PAGE INDEXING

Landing page index dapat mencakup:

```text
title
headline
description
SEO title
SEO description
keywords
destination
products
```

---

# 50. PRODUCT INDEXING

Product index dapat mencakup:

```text
name
description
category
tags
SKU
brand
destination
attributes
price metadata
availability
```

Sensitive internal fields tidak boleh masuk public index.

---

# 51. PRODUCT IN ARTICLE

Article product reference dapat memperkaya discovery.

Search index article dapat menyimpan:

```text
product_ids
product_names
product_categories
```

tetapi canonical product data tetap berasal dari Product service.

---

# 52. DESTINATION INDEXING

Destination dapat menjadi search dimension:

```text
Batam
Bintan
Tanjungpinang
Kepulauan Riau
```

Destination taxonomy harus controlled.

---

# 53. CATEGORY INDEXING

Category memiliki:

```text
category_id
name
slug
parent_id
status
```

---

# 54. HIERARCHICAL CATEGORY

Search filter harus dapat mempertimbangkan parent-child relationship.

---

# 55. TAGS

Tags dapat digunakan sebagai:

```text
Filter
Ranking signal
Related content
```

---

# 56. FACETS

Search dapat menyediakan facets:

```text
Category
Destination
Content type
Price range
Rating
Language
Date
Availability
```

---

# 57. FACET SECURITY

Facet count harus tetap mengikuti visibility dan authorization filter.

---

# 58. FILTERS

Supported filter examples:

```text
type=article
category=travel
destination=batam
status=published
language=id
```

---

# 59. RANGE FILTER

Untuk numeric/date fields:

```text
price
rating
date
duration
```

gunakan range filtering.

---

# 60. SORTING

Possible sort:

```text
Relevance
Newest
Oldest
Price ascending
Price descending
Popularity
Rating
```

---

# 61. DEFAULT SORT

Default public search:

```text
Relevance
```

Default admin search dapat menggunakan:

```text
Updated desc
```

---

# 62. RELEVANCE

Relevance dapat mempertimbangkan:

```text
Exact match
Phrase match
Field weight
Token match
Popularity
Freshness
Business priority
```

---

# 63. FIELD WEIGHT

Typical priority:

```text
Title > Heading > Tags > Category > Description > Body
```

Exact weights harus dituning menggunakan search analytics.

---

# 64. FRESHNESS

Freshness dapat digunakan untuk content discovery.

Freshness tidak boleh secara otomatis mengalahkan strong exact match.

---

# 65. POPULARITY

Popularity signal dapat menggunakan:

```text
Views
Clicks
Conversions
Bookings
Shares
```

Metrics harus anti-abuse.

---

# 66. BUSINESS PRIORITY

Business-priority boost dapat digunakan untuk:

```text
Featured product
Featured article
Sponsored placement
Strategic content
```

Jika digunakan, harus explicit dan auditable.

---

# 67. SEARCH RESULT

Result minimum:

```text
id
type
title
description/excerpt
url/reference
thumbnail
highlight
metadata
```

---

# 68. HIGHLIGHTING

Search result dapat menampilkan matching fragments.

Highlight tidak boleh merender raw HTML yang tidak disanitasi.

---

# 69. RESULT DEDUPLICATION

Search harus menghindari duplicate result yang identik.

---

# 70. RELATED CONTENT

Discovery dapat menyediakan:

```text
Related articles
Related products
Related landing pages
Related destinations
```

---

# 71. RELATED CONTENT SIGNALS

Relatedness dapat menggunakan:

```text
Category
Tags
Destination
Product references
Text similarity
User interaction
```

---

# 72. TRENDING

Trending content dapat dihitung dari:

```text
Views
Search clicks
Engagement
Conversions
Time window
```

---

# 73. TRENDING ANTI-ABUSE

Automated traffic dan suspicious activity harus dapat dikeluarkan dari popularity calculation.

---

# 74. RECENT SEARCH

Recent search dapat disimpan client-side atau server-side sesuai privacy requirement.

Jika server-side, harus tenant/user scoped.

---

# 75. SEARCH HISTORY

User search history harus memiliki:

```text
Retention policy
Delete mechanism
Privacy controls
```

---

# 76. QUERY SUGGESTIONS

Suggestion source:

```text
Popular queries
Historical successful queries
Entity names
Categories
Destinations
```

---

# 77. SEARCH ANALYTICS

Record event minimum:

```text
search_performed
search_result_clicked
search_no_result
autocomplete_selected
filter_applied
sort_changed
```

---

# 78. SEARCH ANALYTICS PRIVACY

Analytics tidak boleh menyimpan sensitive query tanpa policy.

Sensitive query fields dapat:

```text
Redacted
Hashed
Excluded
```

---

# 79. ZERO-RESULT ANALYTICS

Track:

```text
query
locale
timestamp
result_count
```

dengan privacy controls.

---

# 80. SEARCH QUALITY

Quality metrics:

```text
Zero-result rate
Click-through rate
Search success rate
Top query CTR
Autocomplete selection rate
Latency
```

---

# 81. SEARCH SUCCESS

Search success dapat didefinisikan sebagai:

```text
Search
→ Result click
```

atau domain-specific conversion.

Definition harus konsisten dalam reporting.

---

# 82. SEARCH LATENCY

Target harus ditentukan per channel.

Contoh target:

```text
Autocomplete: very low latency
Interactive search: low latency
Admin search: moderate latency
Bulk/report query: asynchronous
```

Actual SLO mengikuti infrastructure capacity.

---

# 83. TIMEOUT

Search request memiliki timeout.

Jika search engine unavailable:

```text
Return controlled error
Fallback where safe
```

---

# 84. FALLBACK

Public content search dapat fallback ke database hanya untuk controlled low-volume cases.

Do not allow unrestricted full-table fallback.

---

# 85. SEARCH ENGINE OUTAGE

Search outage tidak boleh menyebabkan source database corruption.

---

# 86. INDEX CONSISTENCY

System harus memonitor:

```text
Source count
Indexed count
Lag
Failed events
```

---

# 87. INDEX LAG

Track:

```text
event_time
processed_time
lag_duration
```

Alert jika melebihi SLO.

---

# 88. SEARCH SECURITY

Wajib:

```text
Input validation
Query limits
Rate limiting
Authorization
Tenant filtering
Output sanitization
Abuse detection
```

---

# 89. QUERY ABUSE

Protect against:

```text
Very long queries
Huge filter combinations
Wildcard abuse
Regex abuse
Deep pagination
High-frequency autocomplete
```

---

# 90. DEEP PAGINATION

Search engine deep pagination harus dibatasi.

Gunakan cursor/search-after bila diperlukan.

---

# 91. PAGINATION

Public search dapat menggunakan:

```text
page + limit
```

untuk small depth.

Untuk deep result:

```text
cursor
```

---

# 92. MAX RESULT SIZE

API harus memiliki maximum page size.

---

# 93. TENANT FILTER ENFORCEMENT

Tenant filter tidak boleh hanya berasal dari frontend request.

Backend harus inject scope dari authenticated identity.

---

# 94. ADMIN FILTER ENFORCEMENT

Admin role menentukan maximum searchable scope.

---

# 95. DOCUMENT ACL

Untuk private documents, index dapat menyimpan ACL metadata.

Query harus enforce ACL.

---

# 96. ACL CHANGE

Jika permission berubah, index permission metadata harus diperbarui atau query-time ACL harus memastikan consistency.

---

# 97. CACHE

Search result cache dapat digunakan.

Cache key wajib memasukkan:

```text
tenant scope
user scope where necessary
query
filters
locale
```

---

# 98. CACHE INVALIDATION

Content changes harus invalidasi cache yang relevan.

---

# 99. CACHE PRIVACY

Jangan cache private result menggunakan shared key yang dapat bocor antar-user/tenant.

---

# 100. SEARCH API

Minimum public endpoints:

```text
GET /search
GET /search/suggestions
GET /search/related
GET /search/trending
```

---

# 101. TENANT SEARCH API

```text
GET /tenant/search
GET /tenant/search/suggestions
```

Endpoint final mengikuti API conventions pada Document 10.

---

# 102. ADMIN SEARCH API

```text
GET /admin/search
GET /admin/search/suggestions
GET /admin/search/index-status
GET /admin/search/reindex
GET /admin/search/index-failures
```

Reindex operation harus menggunakan controlled mutation endpoint.

---

# 103. SEARCH REQUEST

Example:

```json
{
  "q": "wisata batam",
  "types": ["article", "product"],
  "filters": {
    "language": "id",
    "status": "published"
  },
  "sort": "relevance",
  "limit": 20
}
```

---

# 104. SEARCH RESPONSE

Example:

```json
{
  "query": "wisata batam",
  "total": 42,
  "results": [],
  "facets": {},
  "next_cursor": "..."
}
```

---

# 105. API ERROR MODEL

Minimum:

```text
INVALID_QUERY
QUERY_TOO_LONG
FILTER_NOT_SUPPORTED
RATE_LIMITED
SEARCH_UNAVAILABLE
UNAUTHORIZED
FORBIDDEN
```

---

# 106. INDEX MAPPING GOVERNANCE

Mapping changes harus:

```text
Reviewed
Versioned
Tested
Reindexed
Validated
```

---

# 107. SCHEMA COMPATIBILITY

Application harus mampu membaca active index version selama deployment transition.

---

# 108. INDEX DEPLOYMENT

Recommended:

```text
Build
→ Validate
→ Shadow test
→ Switch
→ Monitor
→ Rollback if required
```

---

# 109. SHADOW TEST

New search ranking/index dapat diuji secara shadow tanpa mempengaruhi user.

Compare:

```text
Old result
New result
Latency
Zero-result rate
```

---

# 110. RANKING EXPERIMENT

Ranking experiment dapat menggunakan:

```text
A/B testing
Feature flag
Tenant rollout
Percentage rollout
```

---

# 111. SEARCH RANKING CONFIGURATION

Ranking parameters harus versioned.

---

# 112. RANKING ROLLBACK

Ranking regression harus dapat dikembalikan dengan cepat.

---

# 113. SEARCH SYNONYM ADMIN

Admin authorized dapat:

```text
Add synonym
Update synonym
Disable synonym
Test synonym
```

---

# 114. SEARCH PREVIEW

Backoffice harus menyediakan preview query untuk melihat:

```text
Top results
Applied filters
Ranking explanation
Index version
```

---

# 115. SEARCH DEBUGGING

Privileged admin dapat melihat diagnostic metadata:

```text
Index
Query parser
Applied filters
Ranking signals
Document ID
```

Sensitive data harus tetap protected.

---

# 116. SEARCH REINDEX CONTROL

Reindex operation harus memiliki:

```text
Scope
Index version
Requested by
Start time
Status
Result
```

---

# 117. PARTIAL REINDEX

Supported scopes:

```text
Single entity
Tenant
Entity type
Date range
Full index
```

---

# 118. REINDEX RATE LIMIT

Reindex tidak boleh membebani production database.

Gunakan:

```text
Batching
Throttling
Read replicas where appropriate
Queue
Backoff
```

---

# 119. SOURCE READ PROTECTION

Indexer tidak boleh melakukan uncontrolled full-table reads terhadap primary database.

---

# 120. INDEX STORAGE

Search infrastructure harus memiliki:

```text
Capacity planning
Replica strategy
Backup/snapshot where supported
Disk monitoring
Memory monitoring
```

---

# 121. SEARCH AVAILABILITY

Search cluster/service harus memiliki appropriate redundancy sesuai environment tier.

---

# 122. OBSERVABILITY

Metrics minimum:

```text
search_requests_total
search_errors_total
search_latency
search_zero_results_total
search_click_total
autocomplete_requests_total
autocomplete_errors_total
index_events_total
index_failures_total
index_lag
reindex_progress
```

---

# 123. ALERTS

Alert minimum:

```text
Search error spike
Latency degradation
Zero-result spike
Index lag spike
Index failure spike
Reindex failure
Search cluster unhealthy
Cross-tenant authorization anomaly
```

---

# 124. LOGGING

Search log dapat mencatat:

```text
request_id
query metadata
result count
latency
index version
tenant scope
error
```

Raw sensitive query harus mengikuti privacy policy.

---

# 125. TRACE

Distributed tracing dapat mengikuti:

```text
API
→ Search service
→ Search engine
→ Result transformation
```

---

# 126. DATA RETENTION

Search analytics dan query history memiliki retention terpisah dari index content.

---

# 127. PRIVACY

Search system harus memperhatikan:

```text
PII
Sensitive queries
Private content
Tenant data
User behavior
```

---

# 128. DELETION PROPAGATION

Jika user/content dihapus sesuai legal/privacy policy:

```text
Source deletion
→ Event
→ Index deletion
→ Cache invalidation
→ Analytics treatment
```

---

# 129. RIGHT-TO-DELETE

Jika berlaku, deletion request harus dapat ditelusuri sampai search index dan cache.

---

# 130. CONTENT MODERATION

Content yang di-hide/removed karena moderation harus segera tidak searchable sesuai consistency requirement.

---

# 131. PUBLISHED CONTENT GUARANTEE

Published content harus masuk index dalam defined indexing SLO.

---

# 132. UNPUBLISHED CONTENT GUARANTEE

Unpublished content harus dihapus dari public search dalam defined removal SLO.

---

# 133. SEARCH RESULT CANONICAL URL

Result harus mengarah ke canonical URL/reference.

---

# 134. SEO RELATIONSHIP

Search index tidak menggantikan SEO index.

Public search dan sitemap/SEO publishing pipeline dapat berbagi content metadata tetapi memiliki purpose berbeda.

---

# 135. SITEMAP

Searchable public content dapat menjadi input sitemap berdasarkan publication policy.

---

# 136. DISCOVERY MODULES

Discovery dapat mencakup:

```text
Featured
Popular
Trending
Latest
Recommended
Related
Nearby
```

---

# 137. RECOMMENDATION BOUNDARY

Recommendation engine tidak boleh dianggap sama dengan search relevance.

Search menjawab intent query.

Recommendation membantu discovery tanpa explicit query.

---

# 138. RELATED PRODUCT DISCOVERY

Article dapat menampilkan related products berdasarkan:

```text
Explicit article-product relation
Category
Destination
Tags
Similarity
Availability
```

---

# 139. RELATED ARTICLE DISCOVERY

Product/landing page dapat menampilkan related articles berdasarkan:

```text
Product reference
Category
Destination
Tags
Text relevance
```

---

# 140. DISCOVERY FALLBACK

Jika personalization tidak tersedia:

```text
Contextual relevance
Popularity
Freshness
Featured
```

---

# 141. PERSONALIZATION

Jika personalization diterapkan:

```text
User
Tenant
Locale
History
Context
```

harus diperhatikan privacy dan authorization.

---

# 142. DISCOVERY CACHE

Discovery lists dapat dicache dengan explicit TTL.

---

# 143. SEARCH QUALITY REVIEW

Secara berkala review:

```text
Top queries
Zero-result queries
Low CTR queries
Unexpected ranking
Abuse queries
```

---

# 144. SEARCH QUALITY TEST SET

Maintain curated query set:

```text
Exact query
Typo
Synonym
Multi-word
Language
Destination
Product
Article
No result
Ambiguous query
```

---

# 145. REGRESSION TEST

Setiap ranking/index change harus menjalankan search quality regression suite.

---

# 146. ACCEPTANCE CRITERIA

Search dianggap production-ready jika:

- indexing event-driven;
- full reindex tersedia;
- zero-downtime index switching tersedia;
- tenant isolation tervalidasi;
- public visibility enforced;
- autocomplete tersedia;
- filtering dan sorting tersedia;
- search analytics tersedia;
- indexing lag dapat dimonitor;
- search failure terkontrol;
- ranking dapat dituning;
- index rollback tersedia;
- privacy controls tersedia.

---

# 147. TESTING

Minimum:

```text
Index creation
Index update
Index delete
Duplicate event
Out-of-order event
Full reindex
Partial reindex
Alias switch
Rollback
Search exact match
Fuzzy match
Autocomplete
Filtering
Sorting
Pagination
Facet
Tenant isolation
ACL
Private content
Content unpublish
Product archive
Cross-tenant access
Rate limit
Query abuse
Search outage
Cache isolation
```

---

# 148. CROSS-TENANT SECURITY TEST

Test minimum:

```text
Tenant A query cannot return Tenant B document.
Tenant A autocomplete cannot reveal Tenant B entity.
Tenant A facet cannot expose Tenant B counts.
Tenant A related-content query cannot expose Tenant B private data.
Admin tenant-limited scope cannot search global restricted data.
```

---

# 149. CRITICAL INVARIANTS

```text
1. Search index is never the authoritative business database.
2. Every tenant-scoped document has tenant ownership.
3. Private documents never appear in public search.
4. Deleted/unpublished documents are removed within defined SLO.
5. Duplicate events do not duplicate documents.
6. Stale events cannot overwrite newer document state.
7. Reindex can be performed without destructive source-data changes.
8. Search cache cannot leak tenant/user-private results.
9. Search queries cannot bypass authorization.
10. Search failures do not corrupt source data.
11. Ranking changes are versioned and reversible.
12. Search analytics follows privacy policy.
```

---

# 150. DEFINITION OF DONE

```text
[ ] Search architecture defined
[ ] Search domains defined
[ ] Index schema defined
[ ] Tenant isolation implemented
[ ] Visibility rules implemented
[ ] Event-driven indexing implemented
[ ] Idempotency implemented
[ ] Retry/DLQ implemented
[ ] Full reindex implemented
[ ] Partial reindex implemented
[ ] Alias switching implemented
[ ] Autocomplete implemented
[ ] Typo tolerance implemented
[ ] Filters implemented
[ ] Facets implemented
[ ] Sorting implemented
[ ] Ranking configuration implemented
[ ] Search analytics implemented
[ ] Query privacy implemented
[ ] Cache isolation implemented
[ ] Search monitoring implemented
[ ] Search alerts implemented
[ ] Security tests passed
[ ] Search quality tests passed
[ ] Cross-tenant tests passed
[ ] Recovery/rollback tested
```

---

# 151. REFERENCE ARCHITECTURE

```text
                    ┌──────────────────────┐
                    │       Frontend       │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │      Search API       │
                    └──────────┬───────────┘
                               │
                  ┌────────────▼────────────┐
                  │ Search / Discovery      │
                  │ Query & Ranking Layer   │
                  └────────────┬────────────┘
                               │
                       ┌───────▼────────┐
                       │ Search Engine  │
                       │ Active Alias   │
                       └───────▲────────┘
                               │
                    ┌──────────┴───────────┐
                    │      Indexer         │
                    └──────────▲───────────┘
                               │
                    ┌──────────┴───────────┐
                    │ Queue / Event Bus     │
                    └──────────▲───────────┘
                               │
      ┌────────────────────────┼─────────────────────────┐
      │                        │                         │
┌─────▼──────┐          ┌──────▼──────┐          ┌──────▼──────┐
│ Content DB │          │ Product DB  │          │ Tenant DB   │
└────────────┘          └─────────────┘          └─────────────┘
```

---

# 152. SOURCE-TO-INDEX FLOW

```text
Create/Update/Publish
        ↓
Transaction committed
        ↓
Domain event
        ↓
Event queue
        ↓
Indexer
        ↓
Transform + authorization metadata
        ↓
Upsert search document
        ↓
Invalidate cache
        ↓
Search available
```

---

# 153. REMOVE FLOW

```text
Unpublish/Delete/Archive
        ↓
Domain event
        ↓
Indexer
        ↓
Delete document
        ↓
Invalidate cache
        ↓
Verify removal
```

---

# 154. REINDEX FLOW

```text
Create new index
        ↓
Read authoritative source
        ↓
Batch transform
        ↓
Bulk index
        ↓
Validate
        ↓
Quality test
        ↓
Alias switch
        ↓
Monitor
        ↓
Retire old index
```

---

# 155. FINAL STATUS

**Status:** FINAL  
**Priority:** HIGH / DISCOVERY-CRITICAL  
**Dependencies:** Documents 04, 09, 10, 11, 13, 14, 15, 17, 19, 21, 26, 28  
**Next logical document:** `30_LOCALIZATION_I18N_AND_MULTILINGUAL_CONTENT_SPECIFICATION.md`
