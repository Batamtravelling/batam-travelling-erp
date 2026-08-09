# 30_LOCALIZATION_I18N_AND_MULTILINGUAL_CONTENT_SPECIFICATION.md

**Project:** Batam Travelling ERP  
**Document:** 30 — Localization, Internationalization and Multilingual Content Specification  
**Version:** 1.0  
**Status:** FINAL / PRODUCTION BASELINE  
**Date:** 2026-08-09

---

## 1. PURPOSE

Dokumen ini mendefinisikan arsitektur final untuk internationalization (i18n), localization (l10n), multilingual content, locale-aware formatting, translation workflow, multilingual SEO, search behavior, dan theme support termasuk **Dark Mode**.

Platform harus dapat berkembang dari Bahasa Indonesia sebagai bahasa utama menuju bahasa tambahan tanpa mengubah struktur data inti.

---

# 2. DESIGN PRINCIPLES

1. Content tidak boleh hard-coded ke satu bahasa.
2. UI translation dan business content dipisahkan.
3. Locale ditentukan secara eksplisit.
4. Fallback harus deterministic.
5. Translation memiliki lifecycle dan versioning.
6. URL/slug multilingual harus SEO-safe.
7. Search harus memahami language/locale.
8. Currency, number, date, dan timezone harus locale-aware.
9. Theme harus mendukung Light, Dark, dan System preference.
10. Dark mode tidak boleh bergantung pada hard-coded colors.
11. Accessibility wajib dipertahankan pada semua theme.
12. Tenant dapat memiliki localization configuration sendiri sesuai permission.

---

# 3. INITIAL LANGUAGE SUPPORT

Minimum production languages:

```text
id-ID
en-US
```

Architecture harus siap untuk:

```text
ms-MY
zh-CN
ja-JP
ko-KR
ar
```

tanpa perubahan fundamental pada model.

---

# 4. LOCALE MODEL

Locale terdiri dari:

```text
language
region
script (optional)
```

Contoh:

```text
id-ID
en-US
en-GB
zh-CN
```

---

# 5. DEFAULT LOCALE

Platform default:

```text
id-ID
```

Tenant dapat memiliki default locale sendiri jika feature tersebut tersedia.

---

# 6. USER LOCALE

User profile dapat menyimpan:

```text
locale
timezone
preferred_currency
theme_preference
```

---

# 7. LOCALE RESOLUTION

Recommended precedence:

```text
Explicit user preference
→ Tenant preference
→ Browser/device locale
→ Platform default
```

Untuk public pages, tenant/site configuration dapat memiliki precedence di atas browser untuk canonical content.

---

# 8. FALLBACK

Example:

```text
id-ID
→ id
→ platform default
```

Untuk content:

```text
Requested locale
→ configured fallback locale
→ default source language
```

Fallback harus konsisten antara frontend, API, search, dan SEO.

---

# 9. TRANSLATION STATES

Minimum:

```text
DRAFT
IN_TRANSLATION
IN_REVIEW
APPROVED
PUBLISHED
STALE
ARCHIVED
```

---

# 10. TRANSLATION MODEL

Translation sebaiknya menggunakan model:

```text
Content
ContentTranslation
```

Contoh:

```text
Article
 ├── ArticleTranslation(id-ID)
 └── ArticleTranslation(en-US)
```

---

# 11. TRANSLATION IDENTITY

Translation minimum memiliki:

```text
translation_id
content_id
locale
status
version
created_at
updated_at
published_at
```

---

# 12. UNIQUE CONSTRAINT

Satu content tidak boleh memiliki duplicate translation untuk locale/version state yang sama.

Recommended:

```text
UNIQUE(content_id, locale)
```

Jika versioning dilakukan sebagai separate revision table, uniqueness diterapkan sesuai revision model.

---

# 13. ARTICLE MULTILINGUAL

Article translation dapat mencakup:

```text
title
slug
excerpt
body
SEO title
SEO description
keywords
```

---

# 14. LANDING PAGE MULTILINGUAL

Landing page translation dapat mencakup:

```text
headline
subheadline
sections
CTA
SEO metadata
slug
```

---

# 15. PRODUCT MULTILINGUAL

Product translation dapat mencakup:

```text
name
short_description
description
features
SEO metadata
```

SKU dan internal identifiers tidak diterjemahkan.

---

# 16. CATEGORY MULTILINGUAL

Category translation:

```text
name
description
slug
SEO metadata
```

---

# 17. DESTINATION MULTILINGUAL

Destination translation:

```text
name
description
SEO metadata
slug
```

Canonical geographic identifier tetap language-independent.

---

# 18. TRANSLATION SOURCE

Setiap translation memiliki source reference:

```text
source_locale
source_version
```

---

# 19. STALE TRANSLATION

Jika source content berubah setelah translation dibuat:

```text
Translation status = STALE
```

sampai diperbarui/review.

---

# 20. TRANSLATION VERSIONING

Translation revision harus menyimpan:

```text
version
author
source_version
change_summary
created_at
```

---

# 21. TRANSLATION WORKFLOW

Recommended:

```text
Source Draft
→ Source Approved
→ Translation
→ Translation Review
→ Translation Approved
→ Published
```

---

# 22. MACHINE TRANSLATION

Jika menggunakan machine translation:

```text
Machine translated
→ Human review
→ Approved
→ Published
```

Machine output tidak otomatis dianggap final untuk critical public content.

---

# 23. TRANSLATION MEMORY

Optional translation memory dapat menyimpan approved phrases untuk konsistensi.

---

# 24. GLOSSARY

Platform dapat memiliki glossary:

```text
source_term
target_term
locale
context
status
```

Contoh istilah produk/brand harus konsisten.

---

# 25. NON-TRANSLATABLE TERMS

Mark:

```text
brand names
SKU
product codes
URLs
API fields
technical identifiers
```

sebagai non-translatable jika diperlukan.

---

# 26. PLACEHOLDER SAFETY

Translation tidak boleh merusak placeholder:

```text
{{name}}
{{price}}
{{date}}
```

Validator harus memastikan placeholder source dan target kompatibel.

---

# 27. PLURALIZATION

UI translation harus mendukung plural rules per locale.

Jangan menggunakan string seperti:

```text
1 item
2 item
```

secara hard-coded.

---

# 28. GENDER

Jika suatu bahasa membutuhkan grammatical gender, translation system harus mendukung message variants bila diperlukan.

---

# 29. DATE FORMAT

Tanggal menggunakan locale-aware formatter.

Contoh:

```text
id-ID → 9 Agustus 2026
en-US → August 9, 2026
```

Format final harus mengikuti platform formatter.

---

# 30. TIME FORMAT

User dapat memiliki preference:

```text
12-hour
24-hour
```

Locale default dapat digunakan sebagai fallback.

---

# 31. TIMEZONE

Timezone disimpan sebagai IANA timezone identifier.

Contoh:

```text
Asia/Jakarta
Asia/Makassar
Asia/Jayapura
```

---

# 32. UTC STORAGE

Timestamp database disimpan dalam UTC bila arsitektur menggunakan UTC canonical storage.

Presentation dikonversi ke user/site timezone.

---

# 33. CURRENCY

Currency tidak boleh ditentukan hanya berdasarkan language.

Contoh:

```text
id-ID + IDR
en-US + USD
```

Currency adalah configuration terpisah.

---

# 34. MONEY FORMAT

Gunakan locale-aware currency formatter.

Jangan membangun format uang dengan string concatenation.

---

# 35. NUMBER FORMAT

Support:

```text
decimal separator
thousand separator
percentage
currency
unit
```

---

# 36. UNIT FORMAT

Jika platform memiliki measurement:

```text
km
m
kg
hour
day
```

format dapat dilokalkan.

---

# 37. RTL READINESS

UI harus architecture-ready untuk RTL.

Minimum:

```text
logical CSS properties
direction-aware layout
icon mirroring rules
text alignment handling
```

---

# 38. RTL TESTING

Jika Arabic ditambahkan, test:

```text
Navigation
Tables
Forms
Cards
Modal
Dashboard
Charts
```

---

# 39. UI TRANSLATION FILES

UI strings dapat disimpan sebagai structured resource:

```text
locales/id-ID.json
locales/en-US.json
```

atau equivalent translation service.

---

# 40. TRANSLATION KEY

Key harus semantic:

```text
auth.login.title
article.publish.success
billing.invoice.status.paid
```

Hindari key berbasis actual sentence.

---

# 41. MISSING TRANSLATION

Jika translation missing:

```text
Use fallback locale
```

dan optionally log missing key.

Production UI tidak boleh menampilkan raw translation key kepada user kecuali debugging environment.

---

# 42. TRANSLATION VALIDATION

CI harus mendeteksi:

```text
Missing keys
Extra keys
Invalid placeholders
Malformed JSON/resource
Duplicate keys
```

---

# 43. UI COPY

UI copy harus dikelola melalui translation system, termasuk:

```text
Buttons
Labels
Validation errors
Toast
Modal
Empty states
Navigation
Dashboard
Notifications
```

---

# 44. ERROR TRANSLATION

Backend error codes harus language-neutral.

Frontend memetakan error code ke localized message.

Contoh:

```text
PAYMENT_FAILED
→ billing.payment_failed
```

---

# 45. API LANGUAGE

API dapat menerima:

```http
Accept-Language
```

dan/atau explicit locale parameter.

Server harus mengikuti documented precedence.

---

# 46. API RESPONSE

API sebaiknya mengembalikan language-neutral identifiers dan localized fields hanya jika endpoint memang mendukung localization.

---

# 47. CONTENT API

Content endpoint dapat menerima:

```text
?locale=id-ID
```

dan response menunjukkan:

```text
requested_locale
resolved_locale
fallback_used
```

jika dibutuhkan untuk debugging/client behavior.

---

# 48. SEO URL

Multilingual content dapat menggunakan localized slug:

```text
/id/panduan-wisata-batam
/en/batam-travel-guide
```

Exact URL strategy harus konsisten.

---

# 49. CANONICAL URL

Setiap localized page harus memiliki canonical URL yang benar.

---

# 50. HREFLANG

Public multilingual pages harus dapat menghasilkan:

```html
<link rel="alternate" hreflang="id-ID" ...>
<link rel="alternate" hreflang="en-US" ...>
```

dan appropriate default.

---

# 51. SITEMAP MULTILINGUAL

Sitemap harus mendukung multilingual URL strategy.

---

# 52. SEO METADATA

Setiap translation dapat memiliki:

```text
SEO title
SEO description
Open Graph title
Open Graph description
```

---

# 53. SOCIAL METADATA

Social metadata dapat diterjemahkan per locale.

---

# 54. SEARCH MULTILINGUAL

Search index menyimpan:

```text
language
locale
translated title
translated description
translated body
```

---

# 55. SEARCH FALLBACK

Jika query locale tidak tersedia:

```text
Requested locale
→ language-level match
→ default locale
```

berdasarkan search policy.

---

# 56. SEARCH RANKING

Exact language match dapat diberi boost dibanding fallback language.

---

# 57. AUTOCOMPLETE

Autocomplete harus mempertimbangkan locale user.

---

# 58. RELATED CONTENT

Related content harus sebisa mungkin mengutamakan language yang sedang digunakan.

---

# 59. TRANSLATED PRODUCT IN ARTICLE

Article translation dapat reference product yang sama.

Product title ditampilkan berdasarkan resolved locale.

---

# 60. CROSS-LANGUAGE PRODUCT IDENTITY

Semua translation product menggunakan canonical:

```text
product_id
```

bukan duplicate product record.

---

# 61. CONTENT RELATIONSHIP

Example:

```text
Article
  └── ArticleTranslation(id-ID)
  └── ArticleTranslation(en-US)

ArticleProduct
  └── product_id

Product
  └── ProductTranslation(id-ID)
  └── ProductTranslation(en-US)
```

---

# 62. ADMIN TRANSLATION UI

Backoffice harus menyediakan:

```text
Source language
Target language
Translation status
Missing translations
Stale translations
Review
Publish
History
```

---

# 63. TRANSLATION COMPARISON

Reviewer dapat membandingkan:

```text
Source
Target
Previous target version
```

---

# 64. TRANSLATION APPROVAL

Reviewer dapat:

```text
Approve
Reject
Request changes
```

---

# 65. TRANSLATION AUDIT

Audit:

```text
Created
Edited
Reviewed
Approved
Published
Unpublished
Restored
```

---

# 66. BULK TRANSLATION

Bulk translation harus:

```text
Scoped
Previewable
Queued
Audited
Retryable
```

---

# 67. TRANSLATION JOBS

Translation job status:

```text
QUEUED
RUNNING
COMPLETED
FAILED
CANCELED
```

---

# 68. TRANSLATION RETRY

Retry tidak boleh membuat duplicate translation.

---

# 69. LOCALE CONFIGURATION

Tenant/site dapat menentukan:

```text
enabled_locales
default_locale
fallback_locale
```

---

# 70. ENABLED LOCALE

Locale yang disabled tidak boleh tersedia pada public language selector.

Existing historical content tetap dapat dipertahankan.

---

# 71. LANGUAGE SWITCHER

Frontend language switcher harus:

- jelas;
- keyboard accessible;
- mempertahankan current route bila translation tersedia;
- fallback ke equivalent page bila route tidak tersedia.

---

# 72. LANGUAGE SWITCH BEHAVIOR

Jika current content tidak memiliki translation:

```text
Navigate to fallback/default version
```

dan jangan menghasilkan broken page.

---

# 73. DARK MODE

Platform wajib mendukung tiga theme preference:

```text
LIGHT
DARK
SYSTEM
```

Default:

```text
SYSTEM
```

---

# 74. DARK MODE SCOPE

Dark mode berlaku pada:

```text
Public website
Landing page
Blog/article
Product/catalog UI
Tenant application
Admin backoffice
Authentication pages
Dialogs
Forms
Tables
Notifications
```

Komponen yang tidak mendukung dark mode harus dianggap defect kecuali secara eksplisit dikecualikan.

---

# 75. THEME RESOLUTION

Recommended:

```text
Explicit user preference
→ System preference if SYSTEM
→ platform default
```

---

# 76. THEME STORAGE

User preference:

```text
theme_preference = LIGHT | DARK | SYSTEM
```

Guest preference dapat disimpan client-side.

Authenticated preference disimpan server-side dan dapat dicache client-side.

---

# 77. SYSTEM PREFERENCE

Browser preference dibaca dari:

```text
prefers-color-scheme
```

---

# 78. THEME TOKENS

UI harus menggunakan semantic design tokens:

```text
--color-background
--color-surface
--color-surface-elevated
--color-text-primary
--color-text-secondary
--color-border
--color-primary
--color-success
--color-warning
--color-danger
--color-focus
```

Tidak boleh menggunakan hard-coded color values di component logic sebagai default architecture.

---

# 79. LIGHT THEME

Light theme memiliki token set yang memenuhi contrast requirements.

---

# 80. DARK THEME

Dark theme memiliki token set khusus.

Jangan sekadar melakukan:

```text
filter: invert(...)
```

untuk seluruh UI.

---

# 81. CONTRAST

Text dan interactive controls harus memenuhi WCAG target yang ditetapkan project, minimal mempertahankan AA-level contrast untuk normal text dan UI components.

---

# 82. FOCUS STATE

Dark mode tetap harus memiliki visible focus indicator.

Focus indicator tidak boleh hilang karena background gelap.

---

# 83. STATUS COLORS

Status colors tidak boleh menjadi satu-satunya indicator.

Contoh:

```text
Success + icon/text
Error + icon/text
Warning + icon/text
```

---

# 84. IMAGE HANDLING

Images tidak otomatis di-invert.

Asset dapat memiliki:

```text
light asset
dark asset
neutral asset
```

---

# 85. LOGO

Brand logo harus memiliki theme-safe variant jika diperlukan:

```text
logo-light
logo-dark
```

---

# 86. SVG

SVG icons harus menggunakan theme-aware current color bila memungkinkan.

---

# 87. CHARTS

Charts harus memiliki theme-aware:

```text
grid
axis
labels
tooltip
legend
data series
```

dan tetap readable pada Light/Dark.

---

# 88. CODE/TECHNICAL BLOCKS

Jika terdapat code block atau technical content, background/text harus memiliki theme-specific tokens.

---

# 89. RICH TEXT

Article rich-text rendering harus memiliki semantic styles untuk:

```text
headings
paragraph
blockquote
links
lists
tables
code
images
captions
```

di kedua theme.

---

# 90. DARK MODE IN EDITOR

Content editor preview harus dapat toggle:

```text
Light
Dark
```

untuk memastikan content readability.

---

# 91. EMAIL THEME

Email theme tidak otomatis mengikuti web theme.

Email templates memiliki explicit styling dan client compatibility policy.

---

# 92. PRINT

Print stylesheet harus menggunakan print-safe styling dan tidak mengikuti dark background secara membabi buta.

---

# 93. THEME PERSISTENCE

Theme preference harus dipertahankan saat:

```text
Navigation
Refresh
Login
Logout
```

sesuai privacy/session policy.

---

# 94. FLASH PREVENTION

Frontend harus mencegah visible light/dark flash saat initial load jika theme sudah diketahui.

---

# 95. THEME HYDRATION

SSR/hydration implementation harus menghindari mismatch akibat theme detection.

---

# 96. ACCESSIBILITY

Localization dan theme harus mendukung:

```text
Keyboard
Screen reader
Contrast
Focus
Zoom
Reduced motion
```

---

# 97. REDUCED MOTION

Theme transition tidak boleh memaksa animation.

Respect:

```text
prefers-reduced-motion
```

---

# 98. TRANSLATION + DARK MODE TEST

Setiap supported locale harus diuji pada:

```text
Light
Dark
System
```

---

# 99. LONG TEXT

German/English/Indonesian dan future languages dapat menghasilkan text length berbeda.

UI harus menangani:

```text
Long button labels
Long headings
Wrapping
Overflow
Truncation
```

---

# 100. TEXT EXPANSION

Layout tidak boleh bergantung pada fixed width yang mengasumsikan panjang Bahasa Indonesia.

---

# 101. FONT

Font stack harus mendukung semua supported scripts.

Jika menambah CJK/Arabic, gunakan font fallback yang sesuai.

---

# 102. FONT LOADING

Font loading tidak boleh menyebabkan layout unusable.

---

# 103. DATE/TIME TESTING

Test locale:

```text
id-ID
en-US
```

dan timezone utama.

---

# 104. CURRENCY TESTING

Test:

```text
IDR
USD
```

dan future currency support.

---

# 105. PLURAL TESTING

Test minimum:

```text
0
1
2
large number
```

untuk setiap localized message yang menggunakan pluralization.

---

# 106. TRANSLATION SECURITY

Translation content tetap dianggap untrusted content.

Sanitize:

```text
HTML
URLs
attributes
embedded content
```

---

# 107. XSS PROTECTION

Localized rich text tidak boleh bypass sanitization karena berasal dari translator/admin.

---

# 108. TRANSLATION IMPORT

Import translation harus memvalidasi:

```text
Locale
Keys
Placeholders
HTML structure
Length constraints
```

---

# 109. TRANSLATION EXPORT

Export harus:

```text
Permission controlled
Audited
Versioned
```

---

# 110. CACHE

Localized content cache key wajib memasukkan locale.

Contoh:

```text
article:{id}:id-ID
article:{id}:en-US
```

---

# 111. THEME CACHE

Theme preference tidak boleh menyebabkan shared page cache menghasilkan theme yang salah.

Theme-dependent rendering harus dilakukan client-side atau cache-aware.

---

# 112. CDN

Public localized content dapat dicache di CDN dengan locale-aware cache strategy.

---

# 113. CACHE KEY

Cache key dapat mempertimbangkan:

```text
locale
tenant
content version
theme where truly server-rendered
```

---

# 114. LOCALIZED ERROR PAGES

404/500/error pages harus memiliki localized variant bila public application mendukung localization.

---

# 115. NOTIFICATIONS

Notification templates harus mendukung locale:

```text
email
push
in-app
SMS if applicable
```

---

# 116. NOTIFICATION LOCALE

Locale resolution:

```text
User preference
→ Tenant preference
→ Default locale
```

---

# 117. BILLING DOCUMENTS

Invoice/receipt localization dapat meliputi:

```text
language
date format
number format
currency
labels
```

Legal/financial requirements tetap menjadi authoritative constraint.

---

# 118. REPORTS

Reports harus menggunakan:

```text
locale
timezone
currency
number format
```

---

# 119. EXPORT FILES

CSV/Excel/PDF export harus memiliki documented localization behavior.

---

# 120. API FILTERING

API content filtering dapat menggunakan:

```text
locale
language
```

dengan server-side validation.

---

# 121. DATABASE INDEXING

Database index untuk translations harus mendukung:

```text
content_id
locale
status
```

dan query patterns utama.

---

# 122. SEARCH INDEXING

Search document dapat menyimpan localized fields:

```text
title_id
title_en
body_id
body_en
```

atau separate language-aware documents sesuai search engine architecture.

---

# 123. SEARCH DOCUMENT STRATEGY

Preferred architecture:

```text
One canonical entity
+
language-aware searchable representation
```

Exact implementation mengikuti Document 29.

---

# 124. LOCALE OBSERVABILITY

Metrics:

```text
locale_requests_total
fallback_locale_total
missing_translation_total
translation_publish_total
translation_failure_total
```

---

# 125. THEME OBSERVABILITY

Optional product analytics:

```text
theme_light_selected
theme_dark_selected
theme_system_selected
```

Analytics harus mengikuti privacy policy.

---

# 126. MISSING TRANSLATION ALERT

Alert dapat dibuat jika:

```text
Published content has missing required translation
```

untuk locale yang diwajibkan.

---

# 127. STALE TRANSLATION ALERT

Alert dapat dibuat jika published source berubah tetapi translation tetap STALE melebihi threshold.

---

# 128. ADMIN LOCALIZATION DASHBOARD

Dashboard dapat menampilkan:

```text
Translation coverage
Missing translations
Stale translations
Pending review
Published by locale
```

---

# 129. CONTENT COVERAGE

Coverage dapat dihitung:

```text
translated published content / required published content
```

---

# 130. LANGUAGE ENABLEMENT

Menambahkan locale baru harus melalui:

```text
Locale configuration
UI translations
Content policy
SEO setup
Search setup
QA
Enablement
```

---

# 131. NEW LANGUAGE CHECKLIST

```text
[ ] Locale registered
[ ] UI strings translated
[ ] Date/number formatting verified
[ ] Currency behavior verified
[ ] Content fallback configured
[ ] Search configured
[ ] SEO configured
[ ] Sitemap configured
[ ] Notification templates translated
[ ] Error pages translated
[ ] Accessibility tested
[ ] Light mode tested
[ ] Dark mode tested
```

---

# 132. ACCEPTANCE CRITERIA

Localization system dianggap production-ready jika:

- id-ID dan en-US tersedia;
- locale resolution deterministic;
- fallback bekerja;
- content translation versioned;
- stale translation terdeteksi;
- article/landing/product multilingual;
- multilingual SEO tersedia;
- search locale-aware;
- date/time/number/currency localized;
- API mendukung locale;
- translation workflow tersedia;
- dark mode tersedia;
- Light/Dark/System preference tersedia;
- contrast/accessibility terpenuhi;
- cache tidak mencampur locale atau private scope.

---

# 133. TESTING

Minimum test:

```text
Locale resolution
Locale fallback
Missing translation
Stale translation
Translation versioning
Translation approval
Article translation
Landing page translation
Product translation
Localized slug
Canonical URL
Hreflang
Sitemap
Search locale
Autocomplete locale
Date formatting
Number formatting
Currency formatting
Timezone
Pluralization
Placeholder validation
RTL readiness
Light theme
Dark theme
System theme
Theme persistence
SSR theme hydration
Theme contrast
Long translation text
Cache locale isolation
XSS in translated content
```

---

# 134. CRITICAL INVARIANTS

```text
1. Content identity is language-independent.
2. Translation identity is locale-specific.
3. Missing translation never corrupts source content.
4. Stale translation is detectable.
5. Published content follows defined translation policy.
6. Locale is never inferred inconsistently between services.
7. Currency and locale are separate concepts.
8. UTC timestamps remain canonical where required.
9. Localized content cannot bypass security sanitization.
10. Search cannot expose content outside authorization scope.
11. Light and Dark themes use semantic design tokens.
12. Theme preference cannot leak between users through shared cache.
13. Dark mode must preserve accessibility.
14. Theme selection is independent from language selection.
```

---

# 135. DEFINITION OF DONE

```text
[ ] i18n architecture implemented
[ ] l10n architecture implemented
[ ] id-ID implemented
[ ] en-US implemented
[ ] Locale resolution implemented
[ ] Fallback implemented
[ ] Translation model implemented
[ ] Translation workflow implemented
[ ] Translation versioning implemented
[ ] Article multilingual support implemented
[ ] Landing page multilingual support implemented
[ ] Product multilingual support implemented
[ ] Category/destination localization implemented
[ ] Multilingual SEO implemented
[ ] Hreflang implemented
[ ] Search localization integrated
[ ] Localized notifications implemented
[ ] Localized billing/report formatting implemented
[ ] Translation validation implemented
[ ] Translation audit implemented
[ ] Light mode implemented
[ ] Dark mode implemented
[ ] System theme implemented
[ ] Theme persistence implemented
[ ] Theme tokens implemented
[ ] Accessibility tested
[ ] Localization tests passed
[ ] Dark mode tests passed
[ ] Cache isolation validated
```

---

# 136. REFERENCE ARCHITECTURE

```text
                         ┌─────────────────────┐
                         │      Frontend       │
                         └──────────┬──────────┘
                                    │
                 ┌──────────────────┼──────────────────┐
                 │                  │                  │
          ┌──────▼──────┐   ┌──────▼──────┐   ┌──────▼──────┐
          │ Locale      │   │ Theme       │   │ Content     │
          │ Resolver    │   │ Resolver    │   │ Resolver    │
          └──────┬──────┘   └─────────────┘   └──────┬──────┘
                 │                                    │
          ┌──────▼────────────────────────────────────▼──────┐
          │              Localization Layer                  │
          │ UI i18n + Content Translation + Formatting       │
          └──────────────────────┬───────────────────────────┘
                                 │
       ┌─────────────────────────┼─────────────────────────────┐
       │                         │                             │
┌──────▼───────┐         ┌───────▼───────┐            ┌──────▼──────┐
│ Translation  │         │ Content       │            │ Search      │
│ Service      │         │ Service       │            │ Index       │
└──────────────┘         └───────────────┘            └─────────────┘
       │                         │
       └─────────────────────────┼─────────────────────────────┐
                                 │                             │
                         ┌───────▼────────┐            ┌───────▼──────┐
                         │ Notification   │            │ Billing /    │
                         │ Service        │            │ Reporting    │
                         └────────────────┘            └──────────────┘
```

---

# 137. FINAL STATUS

**Status:** FINAL  
**Priority:** HIGH / PLATFORM-WIDE  
**Dependencies:** Documents 04, 09, 10, 11, 14, 15, 17, 19, 20, 21, 28, 29  
**Next logical document:** `31_SEO_CONTENT_MARKETING_AND_PUBLIC_WEBSITE_SPECIFICATION.md`
