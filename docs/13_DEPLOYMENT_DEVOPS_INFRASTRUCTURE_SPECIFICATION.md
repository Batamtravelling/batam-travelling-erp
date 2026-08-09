# BATAM TRAVELLING ERP
# DEPLOYMENT, DEVOPS & INFRASTRUCTURE SPECIFICATION

**File Name:** `13_DEPLOYMENT_DEVOPS_INFRASTRUCTURE_SPECIFICATION.md`  
**Document Number:** 13  
**Version:** 1.0  
**Status:** INFRASTRUCTURE BASELINE  
**Project:** Batam Travelling ERP  
**Last Updated:** 2026-08-08

---

# 1. PURPOSE

Dokumen ini menetapkan standar deployment, DevOps, infrastructure, environment, CI/CD, release management, backup, monitoring, dan operational reliability untuk Batam Travelling ERP.

Dokumen ini menjadi acuan untuk:

- Development environment
- Staging environment
- Production environment
- Source code management
- Branching strategy
- CI/CD
- Build process
- Deployment process
- Database migration
- Environment variables
- Secrets management
- Domain
- DNS
- HTTPS/TLS
- Application hosting
- Database hosting
- Object/file storage
- Background jobs
- Queue
- Cache
- Monitoring
- Logging
- Backup
- Restore
- Rollback
- Disaster recovery
- Infrastructure security
- Release management

---

# 2. CORE DEVOPS PRINCIPLE

Prinsip utama:

> Build once, configure per environment, deploy consistently.

Infrastructure harus reproducible dan terdokumentasi.

Tidak boleh bergantung pada:

- Manual server configuration
- Manual database editing
- Manual file copying
- Developer laptop
- Undocumented production changes

---

# 3. INFRASTRUCTURE OBJECTIVES

Infrastructure harus menyediakan:

```text id="z3r8um"
Reliability
Security
Scalability
Observability
Recoverability
Repeatability
Maintainability
Cost Awareness
```

---

# 4. HIGH-LEVEL ARCHITECTURE

Baseline architecture:

```text id="q9x7u0"
                    INTERNET
                       │
                       ▼
                DNS / CDN / WAF
                       │
                       ▼
                 HTTPS / TLS
                       │
              ┌────────┴────────┐
              │                 │
              ▼                 ▼
        Public Website       ERP Web App
              │                 │
              └────────┬────────┘
                       ▼
                    API
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
    Database         Cache          Queue
        │                             │
        │                             ▼
        │                       Worker / Jobs
        │
        └──────────────┬──────────────┐
                       │              │
                       ▼              ▼
                   File Storage   External APIs
```

Actual provider dapat berubah tanpa mengubah architectural principle.

---

# 5. ENVIRONMENT STRATEGY

Minimal terdapat:

```text id="w4c2i9"
Development
Staging
Production
```

Optional:

```text id="6mx9m1"
Preview
QA
Sandbox
```

---

# 6. DEVELOPMENT ENVIRONMENT

Development digunakan untuk:

- Coding
- Local testing
- Unit testing
- Feature development
- Debugging

Development tidak boleh mengakses production data tanpa explicit secure mechanism.

---

# 7. STAGING ENVIRONMENT

Staging digunakan untuk:

- Integration testing
- UAT
- Regression testing
- Release candidate
- Performance baseline
- Deployment rehearsal

Staging harus semirip mungkin dengan production.

---

# 8. PRODUCTION ENVIRONMENT

Production digunakan hanya untuk:

- Real users
- Real business transactions
- Real integrations
- Approved release

Production access harus dibatasi.

---

# 9. ENVIRONMENT ISOLATION

Setiap environment harus memiliki:

```text id="z2m1ha"
Separate configuration
Separate credentials
Separate database
Separate storage
Separate external integration credentials
```

Jika provider mendukung, gunakan resource isolation.

---

# 10. PRODUCTION DATA ISOLATION

Production database tidak boleh digunakan sebagai development database.

Production data tidak boleh disalin ke local environment tanpa:

- Authorization
- Anonymization
- Security review

---

# 11. SOURCE CODE REPOSITORY

Source code harus berada pada version control system.

Repository harus mencakup:

```text id="8z5x1b"
Application
Infrastructure configuration
Database migrations
Tests
Documentation
Deployment configuration
```

Secrets tidak boleh masuk repository.

---

# 12. REPOSITORY STRUCTURE

Contoh:

```text id="q0y0l7"
/
├── apps/
│   ├── web/
│   ├── api/
│   └── worker/
│
├── packages/
│
├── database/
│   ├── migrations/
│   └── seeds/
│
├── infrastructure/
│
├── scripts/
│
├── tests/
│
├── docs/
│
└── README.md
```

Struktur final mengikuti framework yang dipilih.

---

# 13. GIT BRANCHING

Baseline:

```text id="z2r5t4"
main
  │
  ├── feature/*
  ├── fix/*
  ├── refactor/*
  └── hotfix/*
```

`main` harus selalu berada pada kondisi deployable.

---

# 14. FEATURE BRANCH

Feature development dilakukan pada:

```text id="prv6s7"
feature/<short-description>
```

Contoh:

```text id="a4rjtw"
feature/payment-verification
feature/article-product-reference
feature/crm-follow-up
```

---

# 15. HOTFIX

Production critical fix menggunakan:

```text id="g9t3yn"
hotfix/<short-description>
```

Hotfix harus tetap melalui review dan testing minimum yang diperlukan.

---

# 16. PULL REQUEST

Pull request harus mencantumkan:

```text id="x2nq3p"
Purpose
Changes
Related requirement
Testing performed
Migration impact
Security impact
Deployment impact
```

---

# 17. CODE REVIEW

Minimal satu reviewer untuk perubahan normal.

Security-sensitive atau financial-sensitive change dapat membutuhkan additional reviewer sesuai governance.

---

# 18. PROTECTED BRANCH

`main` harus dilindungi dari direct push jika tooling mendukung.

Require:

```text id="4m9v2c"
Pull Request
Review
CI Passing
```

---

# 19. COMMIT PRINCIPLE

Commit harus:

- Fokus
- Deskriptif
- Tidak mencampur unrelated changes

Contoh:

```text id="s7f2m9"
feat: add payment proof verification
fix: prevent duplicate booking submission
refactor: extract quotation total calculator
```

---

# 20. CI/CD OVERVIEW

Pipeline:

```text id="8a2y4p"
Push / Pull Request
        ↓
Lint
        ↓
Type Check
        ↓
Unit Tests
        ↓
Integration Tests
        ↓
Security Scan
        ↓
Build
        ↓
Artifact
        ↓
Deploy Staging
        ↓
Smoke / UAT
        ↓
Approval
        ↓
Deploy Production
```

---

# 21. CONTINUOUS INTEGRATION

Setiap pull request minimal menjalankan:

```text id="m0e8m5"
Lint
Type Check
Unit Test
Build
```

Critical repository dapat menambahkan:

```text id="4y8u9v"
Integration Test
Security Scan
API Contract Test
```

---

# 22. CONTINUOUS DELIVERY

Setelah merge ke `main`:

```text id="t3m2ps"
Build Artifact
 ↓
Deploy Staging
 ↓
Automated Smoke
 ↓
UAT
 ↓
Production Approval
```

---

# 23. BUILD ARTIFACT

Build artifact harus reproducible.

Contoh:

```text id="2f8m3s"
Docker Image
Static Build Artifact
Package
```

Artifact harus memiliki version/tag.

---

# 24. IMAGE TAGGING

Container image sebaiknya menggunakan immutable tag.

Contoh:

```text id="x0j4b1"
app:1.4.2
app:<git-sha>
```

Hindari menggunakan `latest` sebagai production deployment reference.

---

# 25. DEPLOYMENT STRATEGY

Deployment strategy baseline:

```text id="6v5g8q"
Rolling / Replace
```

Untuk kebutuhan lebih tinggi dapat menggunakan:

```text id="9h4p1k"
Blue-Green
Canary
Feature Flag
```

---

# 26. ZERO / LOW DOWNTIME PRINCIPLE

Deployment harus meminimalkan downtime.

Critical application harus mendukung:

- Health check
- Graceful shutdown
- Connection draining jika diperlukan
- Backward-compatible migration

---

# 27. HEALTH CHECK

Application harus menyediakan health endpoint, misalnya:

```text id="j6w2pc"
/health
```

Health check harus membedakan:

```text id="g7t5m8"
Application alive
Application ready
```

---

# 28. READINESS CHECK

Readiness harus memastikan dependency minimum tersedia sebelum instance menerima traffic.

Contoh:

```text id="k9b2f7"
Database connectivity
Required configuration
Critical dependency
```

---

# 29. LIVENESS CHECK

Liveness hanya memeriksa apakah process masih hidup dan dapat merespons.

Jangan memasukkan dependency yang tidak perlu sehingga application restart terus-menerus hanya karena external provider down.

---

# 30. GRACEFUL SHUTDOWN

Application harus menangani shutdown dengan benar.

Contoh:

```text id="d2n6q8"
Stop accepting new requests
 ↓
Finish active request
 ↓
Close connections
 ↓
Stop workers safely
```

---

# 31. DATABASE

Production database harus menggunakan managed/secure database infrastructure jika memungkinkan.

Database harus memiliki:

```text id="v5k3n8"
Private access
Authentication
Encryption
Backup
Monitoring
Migration strategy
```

---

# 32. DATABASE CONNECTION

Application tidak boleh membuat unlimited database connections.

Gunakan connection pooling.

---

# 33. DATABASE MIGRATION

Schema change harus dilakukan melalui migration.

Tidak boleh mengandalkan:

```text id="8n3f7k"
Manual SQL editing in production
```

untuk normal deployment.

---

# 34. MIGRATION VERSIONING

Setiap migration harus:

- Versioned
- Ordered
- Reviewable
- Reproducible

---

# 35. MIGRATION SAFETY

Migration harus mempertimbangkan:

```text id="6j2r9w"
Existing data
Existing application
Rollback impact
Downtime
Locking
Large table
Index creation
```

---

# 36. BACKWARD-COMPATIBLE MIGRATION

Preferred sequence:

```text id="9q1b3d"
Add
 ↓
Deploy compatible code
 ↓
Migrate / backfill
 ↓
Switch usage
 ↓
Remove obsolete structure later
```

---

# 37. DATABASE SEEDING

Seed data harus dibedakan dari production data.

Contoh:

```text id="8f5k0c"
Development seed
Staging seed
Production bootstrap
```

Production seed tidak boleh menghapus existing business data.

---

# 38. CACHE

Cache dapat digunakan untuk:

```text id="f0x8p2"
Public content
Product data
Article data
Configuration
Frequently accessed lookup
```

Cache tidak boleh menjadi source of truth untuk critical financial data.

---

# 39. CACHE INVALIDATION

Cache harus di-invalidasi ketika source data berubah.

Contoh:

```text id="k3x7p9"
Product published
→ invalidate product cache

Article updated
→ invalidate article cache
```

---

# 40. QUEUE

Background jobs menggunakan queue untuk pekerjaan asynchronous.

Contoh:

```text id="s4y8m1"
Email
WhatsApp
Webhook processing
Report generation
Image processing
Notifications
```

---

# 41. JOB IDEMPOTENCY

Job yang dapat diproses lebih dari sekali harus idempotent.

Contoh:

```text id="a9q2v6"
Send notification
Process webhook
Generate invoice PDF
```

---

# 42. JOB RETRY

Retry harus menggunakan bounded retry.

Contoh strategy:

```text id="r7w2m8"
Attempt 1
Attempt 2
Attempt 3
Dead Letter / Failed
```

Jangan retry infinite.

---

# 43. DEAD LETTER QUEUE

Failed jobs yang tidak dapat diproses setelah retry harus masuk failure handling mechanism.

Operator harus dapat:

- Inspect
- Retry
- Resolve
- Archive

---

# 44. CRON / SCHEDULED JOB

Scheduled jobs harus:

- Terdaftar
- Memiliki owner
- Memiliki monitoring
- Memiliki idempotency protection

Contoh:

```text id="p8c2s6"
Expire quotations
Send follow-up reminders
Generate reports
Cleanup temporary files
```

---

# 45. FILE STORAGE

File storage digunakan untuk:

```text id="u6r9k1"
Payment proof
Customer documents
Article images
Product images
Landing page assets
Generated documents
```

---

# 46. STORAGE CLASSIFICATION

File harus memiliki classification:

```text id="b5k2w7"
PUBLIC
PRIVATE
INTERNAL
```

---

# 47. PUBLIC STORAGE

Public files hanya untuk asset yang memang dimaksudkan public.

Contoh:

```text id="z7r1p4"
Published product image
Published article image
Public website asset
```

---

# 48. PRIVATE STORAGE

Private files harus diakses melalui authorized application flow.

Contoh:

```text id="m3n6c9"
Payment proof
Customer document
Internal document
```

---

# 49. FILE URL

Private file tidak boleh menggunakan permanent publicly accessible URL.

Gunakan:

- Authorized download
- Short-lived signed URL
- Equivalent secure mechanism

---

# 50. CDN

CDN dapat digunakan untuk:

```text id="w2k8n5"
Public assets
Images
CSS
JavaScript
Public content
```

Private resources tidak boleh ter-cache secara public tanpa protection.

---

# 51. DOMAIN ARCHITECTURE

Contoh logical separation:

```text id="g8q4m1"
www.example.com
→ Public website

app.example.com
→ ERP

api.example.com
→ API
```

Actual domain mengikuti domain project.

---

# 52. DNS

DNS records harus dikelola secara controlled.

Perubahan DNS production harus:

- Authorized
- Documented
- Audited where possible

---

# 53. HTTPS

Production public traffic wajib menggunakan HTTPS.

Redirect:

```text id="h7k3p9"
HTTP
 ↓
HTTPS
```

---

# 54. TLS

Gunakan TLS configuration yang modern dan supported.

Certificate renewal harus otomatis jika provider mendukung.

---

# 55. SECRET MANAGEMENT

Secret harus disimpan pada secure secret management mechanism.

Contoh:

```text id="c4y7m2"
DATABASE_URL
API_SECRET
JWT_SECRET
WEBHOOK_SECRET
PAYMENT_SECRET
STORAGE_SECRET
```

---

# 56. ENVIRONMENT VARIABLES

Configuration non-secret dapat menggunakan environment variable.

Contoh:

```text id="x3n9q1"
APP_ENV
APP_URL
API_URL
LOG_LEVEL
FEATURE_FLAG
```

---

# 57. SECRET ROTATION

Secret penting harus dapat di-rotate:

```text id="r2k6v8"
API Key
Database credential
Webhook secret
Signing secret
```

Rotation harus memiliki prosedur documented.

---

# 58. PRODUCTION ACCESS

Production shell/admin access harus dibatasi.

Idealnya:

```text id="e5q1m7"
Named account
MFA
Audit
Least privilege
Temporary access
```

---

# 59. NO SHARED ADMIN ACCOUNT

Jangan menggunakan satu account:

```text id="p7x4m9"
admin
```

untuk seluruh operator.

Gunakan individual identity jika platform mendukung.

---

# 60. INFRASTRUCTURE AS CODE

Infrastructure configuration sebaiknya dikelola sebagai code jika feasible.

Contoh:

```text id="y6n2k8"
Terraform
Pulumi
CloudFormation
Ansible
Docker Compose
Kubernetes manifests
```

Pemilihan tool mengikuti infrastructure.

---

# 61. INFRASTRUCTURE CHANGE

Infrastructure change harus melalui:

```text id="h1v7q4"
Version Control
Review
Validation
Deployment
```

---

# 62. CONTAINERIZATION

Application dapat menggunakan container untuk:

- API
- Web
- Worker
- Scheduled jobs

Container image harus:

- Minimal
- Reproducible
- Versioned
- Scanned

---

# 63. CONTAINER SECURITY

Container:

- Tidak berjalan sebagai root jika tidak diperlukan
- Menggunakan minimal base image
- Tidak menyimpan secret
- Memiliki resource limits jika applicable

---

# 64. RESOURCE LIMITS

Service production harus memiliki resource planning:

```text id="u8m3q6"
CPU
Memory
Storage
Connections
Concurrency
```

---

# 65. AUTOSCALING

Autoscaling dapat diterapkan berdasarkan:

```text id="k5r9t2"
CPU
Memory
Request count
Queue depth
Latency
```

Tidak wajib untuk initial deployment jika workload kecil, tetapi architecture harus memungkinkan scaling.

---

# 66. SCALING PRINCIPLE

Scale application layer secara horizontal jika memungkinkan.

State harus berada pada:

```text id="a4n7x9"
Database
Cache
Object Storage
Queue
```

bukan pada local application filesystem.

---

# 67. APPLICATION FILESYSTEM

Local filesystem container/server tidak boleh dianggap persistent storage.

---

# 68. LOGGING

Application logs harus dikirim ke centralized logging system jika tersedia.

Log minimal memiliki:

```text id="w6p2m8"
Timestamp
Level
Service
Environment
Request ID
Message
```

---

# 69. LOG LEVELS

Minimal:

```text id="e3k8q1"
DEBUG
INFO
WARN
ERROR
```

Production default sebaiknya tidak menggunakan verbose debug logging.

---

# 70. REQUEST ID

Setiap request penting harus memiliki correlation/request ID.

Request ID harus diteruskan ke:

```text id="f7n4b2"
API
Database operation where useful
Queue job
External request where useful
Audit
Log
```

---

# 71. OBSERVABILITY

Observability terdiri dari:

```text id="j9x3m7"
Logs
Metrics
Traces
Alerts
```

Implementasi detail mengikuti Document 15.

---

# 72. APPLICATION METRICS

Minimal monitor:

```text id="v2q8n4"
Request count
Error count
Error rate
Latency
Active jobs
Queue depth
Database errors
```

---

# 73. BUSINESS METRICS

Operational monitoring juga dapat memantau:

```text id="b6m1z9"
Lead creation
Quotation creation
Booking creation
Payment verification
Failed payment
Webhook failures
```

---

# 74. ALERTING

Alert harus dibuat untuk kondisi critical.

Contoh:

```text id="c8r4p1"
Application down
Error rate spike
Database unavailable
Queue backlog
Payment integration failure
Storage failure
Certificate expiration
```

---

# 75. ALERT FATIGUE

Jangan membuat alert untuk semua warning.

Alert harus:

- Actionable
- Relevant
- Prioritized

---

# 76. UPTIME

Availability target harus ditetapkan berdasarkan business need dan infrastructure budget.

Target tidak boleh ditentukan hanya berdasarkan angka tanpa memahami dependency.

---

# 77. BACKUP STRATEGY

Backup minimal meliputi:

```text id="n5y8q3"
Database
Critical files
Infrastructure configuration
Important application data
```

---

# 78. BACKUP FREQUENCY

Backup frequency mengikuti:

- Transaction volume
- Recovery Point Objective
- Cost
- Business criticality

---

# 79. RPO

Recovery Point Objective menjawab:

> Berapa banyak data yang boleh hilang jika terjadi disaster?

Contoh:

```text id="k1x7m4"
RPO = 24 hours
```

atau lebih ketat sesuai business requirement.

---

# 80. RTO

Recovery Time Objective menjawab:

> Berapa lama system boleh tidak tersedia?

Contoh:

```text id="p9q3w6"
RTO = 4 hours
```

Actual target harus ditentukan bersama business owner.

---

# 81. BACKUP RETENTION

Backup retention harus ditentukan berdasarkan:

```text id="y2m8c5"
Business requirement
Compliance
Storage cost
Recovery need
```

---

# 82. BACKUP ENCRYPTION

Backup harus protected.

Sensitive backup sebaiknya encrypted at rest.

---

# 83. BACKUP IS NOT COMPLETE WITHOUT RESTORE

Backup dianggap reliable hanya jika restore test berhasil.

---

# 84. RESTORE TEST

Secara berkala:

```text id="u4n7r2"
Select backup
 ↓
Restore isolated environment
 ↓
Verify schema
 ↓
Verify records
 ↓
Verify application
```

---

# 85. DISASTER RECOVERY

Disaster scenario:

```text id="f3k8m1"
Database failure
Server failure
Storage failure
Region/provider outage
Credential compromise
Human error
Deployment failure
```

---

# 86. DISASTER RECOVERY FLOW

```text id="q7x2n5"
Detect
 ↓
Assess
 ↓
Declare incident
 ↓
Contain
 ↓
Restore infrastructure
 ↓
Restore data
 ↓
Verify integrity
 ↓
Resume service
 ↓
Post-incident review
```

---

# 87. ROLLBACK STRATEGY

Application rollback:

```text id="m8p3y6"
Current version
 ↓
Previous known-good version
```

Database rollback harus ditangani secara hati-hati karena migration dapat irreversible.

---

# 88. DATABASE ROLLBACK PRINCIPLE

Jangan mengandalkan destructive down migration sebagai satu-satunya rollback strategy.

Prefer:

```text id="x5q9r2"
Backward-compatible migration
+
Application rollback
+
Forward fix
```

---

# 89. BLUE-GREEN DEPLOYMENT

Jika infrastructure mendukung:

```text id="a2n7k4"
Blue = Current
Green = New
```

Traffic dapat dipindahkan setelah verification.

---

# 90. CANARY DEPLOYMENT

Untuk future scaling:

```text id="z6m3p8"
Small traffic
 ↓
Monitor
 ↓
Increase traffic
```

---

# 91. FEATURE FLAGS

Feature flag digunakan untuk:

```text id="v9q4x1"
Gradual rollout
Operational kill switch
Experimental feature
Risk reduction
```

---

# 92. FEATURE FLAG SECURITY

Feature flag tidak boleh menjadi security authorization mechanism.

Authorization tetap harus dilakukan backend.

---

# 93. DEPLOYMENT CHECKLIST

Sebelum deploy:

```text id="w4k8m2"
[ ] CI green
[ ] Code reviewed
[ ] Tests passed
[ ] Migration reviewed
[ ] Environment config checked
[ ] Secrets available
[ ] External integration checked
[ ] Backup available
[ ] Rollback plan ready
```

---

# 94. PRODUCTION DEPLOYMENT

Flow:

```text id="g3p7n1"
Release approved
 ↓
Deploy
 ↓
Migration if required
 ↓
Health check
 ↓
Smoke test
 ↓
Monitor
```

---

# 95. POST-DEPLOYMENT MONITORING

Monitor immediately:

```text id="r8m2q5"
Error rate
Latency
CPU
Memory
Database
Queue
External integrations
Business critical flows
```

---

# 96. FAILED DEPLOYMENT

Jika deployment gagal:

```text id="n6x1c9"
Stop rollout
 ↓
Assess
 ↓
Rollback or forward fix
 ↓
Smoke test
 ↓
Monitor
```

---

# 97. PRODUCTION INCIDENT

Incident response mengikuti:

`11_SECURITY_AUTHENTICATION_AND_AUDIT_SPECIFICATION.md`

dan operational monitoring mengikuti document observability.

---

# 98. CHANGE MANAGEMENT

Infrastructure change dikategorikan:

```text id="b3q7m1"
Normal
High Risk
Emergency
```

---

# 99. NORMAL CHANGE

Normal change:

- Planned
- Reviewed
- Tested
- Scheduled

---

# 100. HIGH-RISK CHANGE

Contoh:

```text id="v5k2n8"
Database migration
Domain change
Payment integration change
Authentication change
Infrastructure replacement
```

Membutuhkan additional review/testing.

---

# 101. EMERGENCY CHANGE

Emergency change hanya untuk:

- Critical security issue
- Production outage
- Severe data issue
- Critical financial issue

Tetap harus dicatat dan direview setelah incident.

---

# 102. CONFIGURATION MANAGEMENT

Configuration harus terdokumentasi.

Contoh:

```text id="j4p8x2"
Environment variables
Feature flags
External provider IDs
Domain configuration
Storage buckets
Queue configuration
```

---

# 103. CONFIGURATION DRIFT

Production configuration tidak boleh berbeda dari expected configuration tanpa documented reason.

---

# 104. TIME SYNCHRONIZATION

Server harus menggunakan reliable time synchronization.

Timestamp penting untuk:

```text id="m7q2z4"
Audit
Payment
Webhook
Logs
Scheduled jobs
```

---

# 105. TIMEZONE

System backend sebaiknya menyimpan timestamp dalam UTC.

UI dapat menampilkan timezone sesuai kebutuhan user/business.

---

# 106. SCHEDULED JOB TIMEZONE

Scheduled jobs harus memiliki timezone yang eksplisit.

Jangan mengandalkan server local timezone secara implicit.

---

# 107. DOMAIN / URL CONFIGURATION

Application URL harus configurable per environment.

Contoh:

```text id="w8n3k6"
Development
Staging
Production
```

---

# 108. CORS CONFIGURATION

Allowed origins harus berbeda sesuai environment.

Production tidak boleh secara default mengizinkan arbitrary origins.

---

# 109. EMAIL ENVIRONMENT

Development/staging sebaiknya menggunakan:

```text id="x2p7m9"
Email sandbox
Test inbox
Email interception
```

agar tidak mengirim email production secara tidak sengaja.

---

# 110. PAYMENT ENVIRONMENT

Development/staging harus menggunakan sandbox/test credentials jika provider mendukung.

---

# 111. WHATSAPP ENVIRONMENT

Development/staging harus menggunakan test/sandbox integration jika tersedia.

---

# 112. WEBHOOK ENVIRONMENT

Webhook endpoint setiap environment harus terpisah.

Contoh:

```text id="p5m8x1"
staging.api.example.com/webhooks/provider
api.example.com/webhooks/provider
```

---

# 113. SECURITY OF CI/CD

CI/CD credentials harus:

- Scoped
- Secret
- Rotatable
- Audited

CI/CD tidak boleh memiliki privilege lebih tinggi dari yang diperlukan.

---

# 114. DEPLOYMENT CREDENTIALS

Deployment credentials tidak boleh disimpan di repository.

---

# 115. CI/CD APPROVAL

Production deployment dapat membutuhkan manual approval.

Minimal untuk:

```text id="n4q7b2"
Major release
Database migration
Security-sensitive change
Financial change
Infrastructure change
```

---

# 116. RELEASE VERSIONING

Gunakan versioning yang konsisten.

Contoh:

```text id="k8r3m6"
1.0.0
1.1.0
1.1.1
```

atau Git SHA sebagai immutable deployment identifier.

---

# 117. RELEASE NOTES

Setiap production release harus memiliki:

```text id="f2x9p5"
Version
Date
Features
Fixes
Breaking changes
Migration
Known issues
Rollback information
```

---

# 118. DEPLOYMENT AUDIT

Deployment record harus dapat menjawab:

```text id="q6m1z8"
Who deployed?
What version?
When?
To which environment?
What migration?
What result?
```

---

# 119. INFRASTRUCTURE AUDIT

Perubahan penting pada:

```text id="c4n7y2"
Database
Network
Domain
Storage
Secrets
Compute
Access
```

harus dapat dilacak.

---

# 120. COST MANAGEMENT

Infrastructure harus dipantau terhadap cost.

Monitor:

```text id="x7p3m9"
Compute
Database
Storage
Bandwidth
CDN
Logs
External API
```

---

# 121. COST ALERT

Jika provider mendukung budget alert:

- Set monthly budget
- Set warning threshold
- Set critical threshold

---

# 122. RESOURCE CLEANUP

Non-production resource yang tidak digunakan harus dibersihkan.

Contoh:

```text id="m2q8v5"
Old preview environment
Unused storage
Unused database
Unused container
Old logs
```

---

# 123. PRODUCTION RESOURCE PROTECTION

Production resource harus memiliki naming/tagging yang jelas.

Contoh:

```text id="z9k4r1"
env=production
service=api
project=batam-travelling
```

---

# 124. NAMING CONVENTION

Resource naming harus konsisten:

```text id="n3x7p2"
<project>-<environment>-<service>
```

Contoh:

```text id="c8m1q6"
batamtravelling-prod-api
batamtravelling-prod-db
batamtravelling-staging-api
```

---

# 125. INFRASTRUCTURE DOCUMENTATION

Dokumentasi harus menjelaskan:

```text id="v4p8n2"
Architecture
Resources
Dependencies
Deployment
Rollback
Backup
Recovery
Access
```

---

# 126. RUNBOOK

Critical operational action harus memiliki runbook.

Contoh:

```text id="j6m2x9"
Database restore
Payment outage
Storage outage
API outage
Certificate renewal
Secret rotation
Rollback
```

---

# 127. ON-CALL / OWNER

Setiap critical service harus memiliki owner.

Contoh:

```text id="q3r7k1"
API
Database
Website
Payment Integration
Storage
CI/CD
```

---

# 128. DEPENDENCY MAP

Documentasikan dependency:

```text id="m8x4p6"
Website
 ↓
API
 ↓
Database
 ↓
Queue
 ↓
External providers
```

Dependency penting harus diketahui sebelum incident.

---

# 129. SERVICE AVAILABILITY

Jika dependency non-critical gagal:

```text id="h2n7c5"
System should degrade gracefully.
```

Contoh:

Email provider down:

```text id="y6q3m8"
Booking transaction
→ tetap berhasil

Email
→ queued/retry
```

---

# 130. CRITICAL DEPENDENCY

Jika dependency critical gagal:

```text id="w1p9x4"
Payment provider
Database
Authentication provider
```

system harus menampilkan controlled failure dan tidak melakukan partial unsafe transaction.

---

# 131. TRANSACTION SAFETY

Critical business transaction harus atomic atau memiliki compensation mechanism.

Contoh:

```text id="r5m2k7"
Payment
Invoice
Booking
```

---

# 132. RETRY SAFETY

Retry tidak boleh menyebabkan:

```text id="n9x3p6"
Duplicate payment
Duplicate invoice
Duplicate booking
Duplicate notification
```

---

# 133. BACKGROUND JOB OBSERVABILITY

Setiap critical job harus dapat dilacak:

```text id="f7q1m8"
Job ID
Type
Created
Started
Completed
Failed
Retry count
Error
```

---

# 134. LOG RETENTION

Log retention harus menyeimbangkan:

```text id="k2v8n5"
Troubleshooting
Security
Compliance
Storage cost
```

---

# 135. LOG ROTATION

Logs harus memiliki rotation/retention mechanism agar storage tidak habis.

---

# 136. STORAGE QUOTA

File upload dan storage harus memiliki quota/limit.

---

# 137. DATABASE STORAGE MONITORING

Monitor:

```text id="p4m7x2"
Disk usage
Connection usage
Query latency
CPU
Memory
Replication if applicable
```

---

# 138. QUEUE MONITORING

Monitor:

```text id="z8n3q6"
Queue depth
Oldest job age
Failure rate
Retry count
Dead-letter count
```

---

# 139. CERTIFICATE MONITORING

TLS certificate expiration harus dimonitor.

---

# 140. DOMAIN MONITORING

Monitor critical domain/DNS availability jika infrastructure tooling mendukung.

---

# 141. DISASTER RECOVERY TEST

DR plan harus diuji secara berkala.

Test:

```text id="m5q2r8"
Restore database
Restore files
Redeploy application
Reconnect dependencies
Verify business flow
```

---

# 142. BUSINESS CONTINUITY

Jika full system outage terjadi, business harus memiliki fallback procedure untuk proses critical.

Contoh:

```text id="x3n7p1"
Payment verification
Customer communication
Booking operation
```

Fallback procedure harus documented.

---

# 143. MANUAL FALLBACK

Manual fallback bukan pengganti system reliability.

Setelah incident, manual records harus dapat direkonsiliasi kembali ke system.

---

# 144. RECONCILIATION

Setelah recovery, periksa:

```text id="q8m4y2"
Bookings
Invoices
Payments
Notifications
CRM activities
```

untuk memastikan tidak ada transaction yang hilang/duplicate.

---

# 145. POST-INCIDENT REVIEW

Setelah critical incident:

```text id="j1p7x5"
What happened?
Why?
Impact?
How detected?
How resolved?
What failed?
What should change?
```

---

# 146. ROOT CAUSE ANALYSIS

RCA harus fokus pada system/process improvement, bukan sekadar mencari individu yang salah.

---

# 147. POST-MORTEM

Untuk major incident, dokumentasikan:

```text id="v6n2k8"
Timeline
Impact
Root cause
Resolution
Preventive action
Owner
Deadline
```

---

# 148. INFRASTRUCTURE SECURITY BASELINE

Production infrastructure harus mengikuti security document:

`11_SECURITY_AUTHENTICATION_AND_AUDIT_SPECIFICATION.md`

Minimal:

```text id="c9m3q7"
Least privilege
HTTPS
Secret management
Access control
Logging
Backup
Monitoring
```

---

# 149. TESTING REQUIREMENT

Deployment pipeline harus mengikuti:

`12_TESTING_QUALITY_ASSURANCE_AND_ACCEPTANCE_SPECIFICATION.md`

Tidak boleh deploy critical release jika required quality gates gagal.

---

# 150. DOCUMENTATION SOURCE OF TRUTH

Infrastructure behavior harus konsisten dengan:

```text id="r4x8m2"
00_PROJECT_INSTRUCTIONS.md
04_PRD_SYSTEM_REQUIREMENTS.md
10_API_AND_INTEGRATION_SPECIFICATION.md
11_SECURITY_AUTHENTICATION_AND_AUDIT_SPECIFICATION.md
12_TESTING_QUALITY_ASSURANCE_AND_ACCEPTANCE_SPECIFICATION.md
13_DEPLOYMENT_DEVOPS_INFRASTRUCTURE_SPECIFICATION.md
```

---

# 151. INFRASTRUCTURE DEFINITION OF DONE

Infrastructure implementation dianggap selesai jika:

```text id="n7q2p5"
[ ] Environment defined
[ ] Repository configured
[ ] Branch protection configured
[ ] CI configured
[ ] Build reproducible
[ ] Staging available
[ ] Production available
[ ] Secrets managed securely
[ ] Database configured
[ ] Migration strategy implemented
[ ] Storage configured
[ ] Queue configured if required
[ ] HTTPS configured
[ ] Domain configured
[ ] Monitoring configured
[ ] Logging configured
[ ] Backup configured
[ ] Restore tested
[ ] Rollback documented
[ ] Disaster recovery documented
[ ] Runbooks available
```

---

# 152. PRODUCTION READINESS CHECKLIST

```text id="w3m8k1"
[ ] Production domain ready
[ ] DNS ready
[ ] TLS ready
[ ] Application deployed
[ ] Database ready
[ ] Database backup ready
[ ] Storage ready
[ ] Queue ready
[ ] External integrations ready
[ ] Secrets configured
[ ] Health checks working
[ ] Logs working
[ ] Metrics working
[ ] Alerts working
[ ] CI/CD working
[ ] Rollback tested
[ ] Smoke test passed
[ ] UAT passed
[ ] Security review passed
```

---

# 153. FINAL DEPLOYMENT PRINCIPLE

Production deployment harus predictable:

```text id="f5x9m2"
Code
 ↓
Test
 ↓
Build
 ↓
Artifact
 ↓
Stage
 ↓
Verify
 ↓
Approve
 ↓
Deploy
 ↓
Smoke Test
 ↓
Monitor
```

---

# 154. FINAL INFRASTRUCTURE PRINCIPLE

Infrastructure bukan sekadar server.

Infrastructure mencakup:

```text id="k8q3n6"
Code
CI/CD
Compute
Database
Storage
Queue
Cache
Network
Domain
Security
Secrets
Monitoring
Backup
Recovery
```

Semua harus diperlakukan sebagai bagian dari system.

---

# 155. FINAL RELIABILITY PRINCIPLE

System harus dirancang dengan asumsi:

> Dependency dapat gagal.

Karena itu:

```text id="m4p7x2"
Timeout
Retry
Idempotency
Circuit protection where appropriate
Queue
Fallback
Monitoring
Recovery
```

harus digunakan sesuai kebutuhan.

---

# 156. FINAL PRODUCTION PRINCIPLE

Production harus:

```text id="z1n8q5"
Secure
Observable
Recoverable
Deployable
Testable
Repeatable
```

---

# 157. NEXT DOCUMENT

Dokumen berikutnya:

```text id="x6r2m9"
14_DATABASE_ARCHITECTURE_AND_DATA_MODEL_SPECIFICATION.md
```

Dokumen tersebut akan mendefinisikan:

- Database architecture
- Entity model
- Table structure
- Primary key
- Foreign key
- Relationships
- Indexing
- Constraints
- Data types
- Status fields
- Audit fields
- Soft delete
- Timestamps
- Money/currency fields
- File references
- CMS data model
- CRM data model
- Quotation data model
- Booking data model
- Payment/invoice data model
- Database security
- Migration strategy
- Data integrity rules

---

# END OF DOCUMENT