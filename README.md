# Batam Travelling ERP

> **Master README / Project Specification Index**  
> **Status:** FINAL  
> **Specification baseline:** recovered documents 01–42 (07 and 25 are intentionally unfilled)  
> **Primary language:** Bahasa Indonesia  
> **Architecture:** Practical, modular, integrated, production-oriented ERP  
> **AI:** Excluded from the initial core scope

---

## 1. PROJECT OVERVIEW

**Batam Travelling ERP** adalah platform ERP dan business platform untuk mengelola operasi bisnis travel/tourism secara terintegrasi, termasuk content, public website, landing page, blog/article, product, tenant, users, billing, reporting, communication, documents, search, localization, dan platform operations.

Prinsip utama:

- modular;
- scalable;
- secure;
- multi-tenant;
- API-first;
- auditable;
- observable;
- production-oriented;
- tidak mengunci business rule yang belum diputuskan;
- AI bukan dependency untuk core workflow initial scope.

---

## 2. DOCUMENT HIERARCHY

```text
Business Foundation
        ↓
Business Process / SOP
        ↓
Business Rules / Policy
        ↓
PRD / System Requirements
        ↓
UI/UX / Frontend
        ↓
API / Security
        ↓
Database / Infrastructure
        ↓
Operations / Backup / QA
        ↓
Analytics / Notification / Documents
        ↓
Multi-tenancy / Billing / Admin
        ↓
Search / Localization
        ↓
SEO / Public Website
```

Jika terjadi konflik:

```text
Approved Business Rule
        >
System Requirement
        >
Technical Specification
        >
Implementation Detail
```

Konflik harus diselesaikan melalui change control.

---

## 3. MASTER DOCUMENT INDEX

All numbered specifications now live in `docs/`. The root directory contains project-entry and governance files only.

### Foundation

| No. | File | Purpose |
|---:|---|---|
| 00 | `PROJECT_INSTRUCTIONS.md` | Project instructions, conventions, constraints |
| 01 | `docs/01_BUSINESS_FOUNDATION.md` | Business foundation dan domain baseline |
| 02 | `docs/02_BUSINESS_PROCESS_AND_SOP.md` | Business process dan SOP |
| 03 | `docs/03_BUSINESS_RULES_AND_POLICY.md` | Business rules, policies, governance |
| 04 | `docs/04_PRD_SYSTEM_REQUIREMENTS.md` | Product/system requirements |
| 07 | `docs/07_USER_ROLES_PERMISSIONS_MATRIX.md` | User roles, permissions, data scope, and approval authority |

### Product, UX, API & Security

| No. | File | Purpose |
|---:|---|---|
| 09 | `09_UI_UX_AND_FRONTEND_SPECIFICATION.md` | UI/UX, frontend, website, landing page, blog/article, product presentation |
| 10 | `10_API_AND_INTEGRATION_SPECIFICATION.md` | API contracts dan integrations |
| 11 | `11_SECURITY_AUTHENTICATION_AND_AUDIT_SPECIFICATION.md` | Authentication, authorization, security, audit |

### Infrastructure & Data

| No. | File | Purpose |
|---:|---|---|
| 13 | `13_DEPLOYMENT_DEVOPS_INFRASTRUCTURE_SPECIFICATION.md` | Deployment, DevOps, infrastructure |
| 14 | `14_DATABASE_ARCHITECTURE_AND_DATA_MODEL_SPECIFICATION.md` | Database architecture dan data model |
| 15 | `15_OBSERVABILITY_MONITORING_AND_OPERATIONS_SPECIFICATION.md` | Observability, monitoring, operations |
| 16 | `16_BACKUP_DISASTER_RECOVERY_AND_BUSINESS_CONTINUITY_SPECIFICATION.md` | Backup, disaster recovery, business continuity |
| 17 | `17_TESTING_QUALITY_ASSURANCE_AND_RELEASE_VALIDATION_SPECIFICATION.md` | QA, testing, release validation |

### Analytics, Communication & Documents

| No. | File | Purpose |
|---:|---|---|
| 19 | `19_REPORTING_ANALYTICS_AND_DASHBOARD_SPECIFICATION.md` | Reporting, analytics, dashboards |
| 20 | `20_NOTIFICATION_AND_COMMUNICATION_SPECIFICATION.md` | Notification dan communication |
| 21 | `21_FILE_AND_DOCUMENT_MANAGEMENT_SPECIFICATION.md` | File/document management |

### Platform & Commercial

| No. | File | Purpose |
|---:|---|---|
| 25 | `docs/25_PERFORMANCE_SCALABILITY_AND_CAPACITY_SPECIFICATION.md` | Performance, scalability, and capacity planning |
| 26 | `26_MULTI_TENANCY_CONFIGURATION_AND_TENANT_ISOLATION_SPECIFICATION.md` | Multi-tenancy, configuration, tenant isolation |
| 27 | `27_BILLING_SUBSCRIPTION_AND_USAGE_MANAGEMENT_SPECIFICATION.md` | Billing, subscription, usage |
| 28 | `28_ADMIN_BACKOFFICE_AND_PLATFORM_OPERATIONS_SPECIFICATION.md` | Admin backoffice dan platform operations |

### Discovery & Localization

| No. | File | Purpose |
|---:|---|---|
| 29 | `29_SEARCH_INDEXING_AND_DISCOVERY_SPECIFICATION.md` | Search, indexing, discovery, autocomplete, relevance |
| 30 | `30_LOCALIZATION_I18N_AND_MULTILINGUAL_CONTENT_SPECIFICATION.md` | i18n, l10n, multilingual content, SEO localization, Light/Dark/System theme |

### Development Execution

| No. | File | Purpose |
|---:|---|---|
| 31 | `31_SEO_CONTENT_MARKETING_AND_PUBLIC_WEBSITE_SPECIFICATION.md` | Public website, SEO, and content baseline |
| 32 | `32_TECHNOLOGY_AND_ARCHITECTURE_DECISIONS.md` | Mandatory architecture decision register |
| 33 | `33_MVP_RELEASE_PLAN_AND_PRODUCT_BACKLOG.md` | MVP sequence and release gates |
| 34 | `34_RBAC_PERMISSION_MATRIX.md` | Roles, permissions, and approval controls |
| 35 | `35_API_CONTRACT_AND_EVENT_CATALOG.md` | API and asynchronous-event contract rules |
| 36 | `36_DATABASE_MIGRATION_AND_MASTER_DATA_PLAN.md` | Migration, master-data, and cutover plan |
| 37 | `37_INTEGRATION_PROVIDER_ENVIRONMENT_AND_SECRETS_REGISTER.md` | Provider, environment, and secret register |
| 38 | `38_UX_SCREEN_INVENTORY_AND_PROTOTYPE_BRIEF.md` | MVP screen/prototype delivery plan |
| 39 | `39_TEST_CASE_UAT_AND_TRACEABILITY_PLAN.md` | Test, UAT, and release evidence |
| 40 | `40_PRIVACY_COMPLIANCE_AND_DATA_RETENTION_REGISTER.md` | Privacy/compliance decisions and retention register |
| 41 | `41_OPERATIONS_RUNBOOK_AND_SUPPORT_MODEL.md` | Production support and incident operations |
| 42 | `42_ENGINEERING_BOOTSTRAP_AND_REPOSITORY_STANDARDS.md` | Repository, CI, and startup rules |

> Nomor yang belum tercantum tetap diperlakukan sebagai reserved/unreconciled sampai specification-nya ditetapkan. Jangan mengarang scope dokumen yang belum terkonfirmasi.

---

## 4. NUMBERING & STATUS

Format:

```text
NN_DESCRIPTIVE_NAME.md
```

Status:

```text
DRAFT
REVIEW
APPROVED
FINAL
SUPERSEDED
ARCHIVED
```

Rules:

1. Jangan mengganti nomor dokumen FINAL.
2. Dokumen baru memakai nomor berikutnya.
3. Rename file melalui change control.
4. README diperbarui ketika dokumen baru ditambahkan.
5. FINAL adalah implementation baseline sampai ada revision yang disetujui.

---

## 5. RECOMMENDED READING ORDER

```text
00
↓
01
↓
02
↓
03
↓
04
↓
09
↓
10
↓
11
↓
14
↓
13
↓
15
↓
16
↓
17
↓
19
↓
20
↓
21
↓
26
↓
27
↓
28
↓
29
↓
30
```

Developer yang hanya mengerjakan satu domain dapat membaca dependency chain yang relevan.

---

## 6. PUBLIC WEBSITE & CONTENT

Website adalah bagian aktif dari platform, bukan sekadar static corporate website.

Baseline capability:

```text
Public Website
├── Landing Pages
├── Blog / Articles
├── Categories
├── Destinations
├── Products
├── Product references inside articles
├── Search
├── Discovery
├── Localization
└── SEO
```

Article dapat mencantumkan product secara contextual.

Canonical product identity tetap berasal dari Product domain.

---

## 7. MULTI-TENANCY

Tenant-scoped resources wajib memiliki isolation boundary.

Minimum:

```text
tenant_id
authorization
object-level access control
tenant-aware cache
tenant-aware search
tenant-aware analytics
tenant-aware configuration
```

Cross-tenant data leakage adalah critical security defect.

---

## 8. SECURITY BASELINE

Security mencakup:

- authentication;
- authorization;
- RBAC;
- session management;
- MFA sesuai policy;
- tenant isolation;
- audit trail;
- rate limiting;
- input validation;
- output sanitization;
- encryption;
- secret management;
- security monitoring.

Security enforcement tidak boleh hanya berada di frontend.

---

## 9. DATA & API BASELINE

Database adalah authoritative storage untuk domain data.

Search index, cache, analytics projection, dan derived views bukan source of truth.

API baseline:

```text
Authentication
Authorization
Validation
Consistent response model
Consistent error model
Pagination
Filtering
Rate limiting
Request ID
Auditability where required
```

Breaking changes wajib mengikuti versioning/change-control strategy.

---

## 10. EVENT-DRIVEN INTEGRATION

Event dapat digunakan untuk:

```text
Content changes
Product changes
Billing changes
Notification triggers
Search indexing
Analytics
Audit
```

Consumer harus idempotent dan aman terhadap retry.

---

## 11. SEARCH BASELINE

Search merupakan derived system:

```text
Domain DB
  ↓
Domain Event
  ↓
Queue/Event Bus
  ↓
Indexer
  ↓
Search Index
```

Search mendukung:

```text
Exact match
Fuzzy/typo tolerance
Autocomplete
Filtering
Facets
Sorting
Relevance
Related content
Trending
Search analytics
```

Tenant dan visibility scope wajib diterapkan.

---

## 12. LOCALIZATION BASELINE

Initial locale:

```text
id-ID
en-US
```

Architecture siap untuk locale tambahan.

Localization mencakup:

```text
UI
Content
SEO
Search
Date
Time
Timezone
Number
Currency
Notification
Reports
```

---

## 13. THEME BASELINE

Frontend wajib mendukung:

```text
LIGHT
DARK
SYSTEM
```

Default:

```text
SYSTEM
```

Theme menggunakan semantic design tokens dan harus mempertahankan accessibility pada semua mode.

Dark mode mencakup:

- public website;
- landing page;
- blog/article;
- product/catalog;
- tenant application;
- admin backoffice;
- forms;
- tables;
- dialogs;
- notifications;
- charts;
- rich text.

Theme preference tidak boleh menyebabkan shared-cache leakage.

---

## 14. CONTENT MODEL

Core public content:

```text
Article
Landing Page
Product
Category
Destination
Media
```

Multilingual content menggunakan canonical entity + translation records.

Contoh:

```text
Article
 ├── ArticleTranslation(id-ID)
 └── ArticleTranslation(en-US)
```

---

## 15. PRODUCT-IN-ARTICLE

Article dapat memiliki relationship ke product:

```text
Article
 └── ArticleProduct
      └── product_id
```

Frontend dapat menampilkan product card, price, availability, dan CTA sesuai authorization serta product policy.

Article tidak menduplikasi canonical product record.

---

## 16. OBSERVABILITY

Production baseline:

```text
Logs
Metrics
Traces
Alerts
Audit
Operational dashboards
```

Minimal monitoring:

```text
API latency
API error rate
Database health
Queue health
Search health
Index lag
Worker health
Infrastructure health
Backup status
Security events
```

---

## 17. BACKUP & RECOVERY

Backup/recovery harus mencakup critical application data dan infrastructure configuration yang diperlukan untuk recovery.

Recovery harus diuji secara berkala.

Backup yang tidak pernah diuji restore tidak dianggap sufficient evidence of recoverability.

---

## 18. TESTING & RELEASE

Testing baseline:

```text
Unit
Integration
API
E2E
Security
Authorization
Tenant isolation
Performance
Regression
Release validation
Disaster recovery validation
```

Critical business rules harus memiliki automated coverage.

CI/CD baseline:

```text
Commit
 ↓
Lint
 ↓
Unit Test
 ↓
Integration Test
 ↓
Security Scan
 ↓
Build
 ↓
Deployment
 ↓
Smoke Test
 ↓
Release Validation
```

Production deployment harus memiliki rollback strategy.

---

## 19. ADMIN & PLATFORM OPERATIONS

Admin backoffice menangani, sesuai permission:

```text
Tenant
User
Role
Permission
Content
Product
Billing
Configuration
Feature Flags
Jobs
Integrations
Audit
Moderation
Support
Operations
```

Administrative action harus auditable.

---

## 20. BILLING BASELINE

Billing architecture mencakup:

```text
Subscription
Plan
Usage
Invoice
Payment state
Entitlement
Usage limits
Billing events
```

Financial records harus auditable dan tidak boleh dimodifikasi secara silent.

---

## 21. NOTIFICATION & DOCUMENTS

Notification dapat mencakup:

```text
In-app
Email
Push
SMS where applicable
```

Template mendukung localization.

File/document management mencakup:

```text
Upload
Metadata
Storage
Access control
Version
Preview
Download
Deletion
Retention
Audit
```

---

## 22. CHANGE CONTROL

Perubahan specification:

```text
Identify change
↓
Assess impact
↓
Update affected document(s)
↓
Review dependencies
↓
Approve
↓
Update implementation plan
↓
Update README/index
```

Jangan mengubah specification secara terisolasi jika dependency lain ikut terdampak.

---

## 23. NO SILENT ASSUMPTIONS

Jika requirement belum diputuskan:

```text
TBD
Configurable
Pending decision
```

harus digunakan sesuai konteks.

Jangan mengubah technical default menjadi business rule tanpa approval.

---

## 24. DOCUMENTATION RULE

Code changes yang mengubah externally observable behavior harus memicu documentation review.

Contoh:

```text
New API
→ API specification

New field
→ Database specification

New permission
→ Security/Admin specification

New tenant behavior
→ Multi-tenancy specification

New searchable entity
→ Search specification

New locale
→ Localization specification

New public page
→ SEO/Public Website specification
```

---

## 25. REPOSITORY CONVENTION

Recommended layout:

```text
/
├── README.md
├── docs/
│   ├── 00_PROJECT_INSTRUCTIONS.md
│   ├── 01_BUSINESS_FOUNDATION.md
│   ├── ...
│   └── 30_LOCALIZATION_I18N_AND_MULTILINGUAL_CONTENT_SPECIFICATION.md
├── apps/
├── packages/
├── infrastructure/
├── scripts/
└── tests/
```

Jika repository layout berbeda, numbering dan document governance tetap berlaku.

---

## 26. ENVIRONMENTS

Minimum:

```text
development
staging
production
```

Optional:

```text
preview
testing
```

Environment harus terisolasi.

Secrets tidak boleh disimpan langsung di repository.

---

## 27. IMPLEMENTATION PRINCIPLES

Specification menjelaskan **what** dan required behavior.

Implementation menentukan **how**, selama tidak melanggar specification.

Jika implementation membutuhkan perubahan business rule:

```text
STOP
→ Change request
→ Business review
→ Specification update
→ Implementation
```

---

## 28. PERFORMANCE PRINCIPLES

Prioritas:

```text
Correctness
Security
Reliability
Observability
Performance
```

Optimisasi harus berdasarkan measurement, bukan asumsi.

---

## 29. ACCESSIBILITY

Baseline:

```text
Keyboard navigation
Visible focus
Semantic HTML
Screen reader compatibility
Color contrast
Reduced motion
Accessible forms
Accessible errors
```

Localization dan Dark Mode wajib diuji bersama accessibility.

---

## 30. SEO BASELINE

Public website harus mendukung:

```text
Metadata
Canonical URL
Hreflang
Sitemap
Robots policy
Structured content where appropriate
Localized URL
Fast page delivery
```

Detail SEO/public website akan menjadi specification khusus.

---

## 31. CURRENT BASELINE

```text
Project: Batam Travelling ERP
README: FINAL
Established specification baseline: recovered documents 01–42
Known intentional numbering gaps: none in the recovered 01–42 sequence
Highest established document: 42
Implementation start point: 32, then 42 and 33
```

---

## 32. BUILD START ORDER

```text
1. docs/32_TECHNOLOGY_AND_ARCHITECTURE_DECISIONS.md
2. docs/42_ENGINEERING_BOOTSTRAP_AND_REPOSITORY_STANDARDS.md
3. docs/33_MVP_RELEASE_PLAN_AND_PRODUCT_BACKLOG.md
4. docs/34_RBAC_PERMISSION_MATRIX.md
5. docs/35_API_CONTRACT_AND_EVENT_CATALOG.md
6. docs/36_DATABASE_MIGRATION_AND_MASTER_DATA_PLAN.md
7. docs/38_UX_SCREEN_INVENTORY_AND_PROTOTYPE_BRIEF.md
8. docs/39_TEST_CASE_UAT_AND_TRACEABILITY_PLAN.md
```

Planned scope:

```text
SEO architecture
Content publishing
Public website
Landing pages
Blog/article
Product discovery
Metadata
Structured data
Canonical URL
Hreflang
Sitemap
Robots
Open Graph
Social sharing
Content lifecycle
Content-to-product relationships
Conversion / CTA
Public performance
SEO analytics
```

---

## 33. PROJECT COMPLETION DEFINITION

Specification baseline dianggap structurally complete ketika seluruh domain berikut telah memiliki specification:

```text
Business
Product
Content
Website
Frontend
API
Security
Database
Infrastructure
Operations
Backup
QA
Analytics
Notification
Documents
Multi-tenancy
Billing
Admin
Search
Localization
SEO
```

Specification completion tidak berarti implementation completion.

Implementation tetap membutuhkan:

```text
Architecture validation
Development
Testing
Security review
Deployment
Operational readiness
UAT
Production release
```

---

## 34. FINAL GOVERNANCE

Dokumen FINAL menjadi contract implementation sampai digantikan oleh revision yang disetujui.

Setiap perubahan besar harus menjaga:

```text
Backward compatibility
Data integrity
Tenant isolation
Security
Auditability
Observability
Recoverability
User experience
```

---

## 35. DEFINITION OF DONE — README

```text
[x] Project overview
[x] Core principles
[x] Document hierarchy
[x] Master document index
[x] Numbering rules
[x] Document status rules
[x] Reading order
[x] Public website baseline
[x] Article/product relationship
[x] Multi-tenancy baseline
[x] Security baseline
[x] API/data baseline
[x] Search baseline
[x] Localization baseline
[x] Dark mode baseline
[x] Observability baseline
[x] Backup/recovery baseline
[x] Testing/release baseline
[x] Admin baseline
[x] Billing baseline
[x] Notification/document baseline
[x] Change control
[x] No-silent-assumption rule
[x] Repository convention
[x] Environment baseline
[x] Documentation governance
[x] Next-document roadmap
```

---

## 36. IMPLEMENTATION READINESS

Architecture decisions are approved in `docs/32_TECHNOLOGY_AND_ARCHITECTURE_DECISIONS.md`. Initialise the repository and CI according to `docs/42_ENGINEERING_BOOTSTRAP_AND_REPOSITORY_STANDARDS.md`, then validate the selected services, cost, and account ownership before provisioning production.

The ready-to-build MVP is defined by `docs/33_MVP_RELEASE_PLAN_AND_PRODUCT_BACKLOG.md`. Delivery must use the RBAC, API/event, data migration, test/UAT, privacy, and operations documents as mandatory implementation gates.

## CHANGELOG

### v1.1 — 2026-08-09

- Reorganised numbered specifications into `docs/` without changing their content.
- Updated the index baseline through Document 42.
- Added the build-start order and implementation-readiness handoff.

### v1.0 — 2026-08-09

- Created master README for Batam Travelling ERP.
- Established specification index through Document 30.
- Documented project principles and governance.
- Documented public website, article, landing page, and product relationships.
- Documented multi-tenancy, security, API, database, and operations baseline.
- Documented search and discovery baseline.
- Documented localization and multilingual baseline.
- Added Light/Dark/System theme baseline.
- Added documentation change-control rules.
- Established Document 31 as the next planned specification.
