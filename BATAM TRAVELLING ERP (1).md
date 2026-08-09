Siap, kita lanjutkan ke **Dokumen 26** sesuai urutan arsitektur.

# BATAM TRAVELLING ERP

# MULTI-TENANCY CONFIGURATION AND TENANT ISOLATION SPECIFICATION

**File Name:** `26_MULTI_TENANCY_CONFIGURATION_AND_TENANT_ISOLATION_SPECIFICATION.md`\
**Document Number:** 26\
**Version:** 1.0\
**Status:** PRODUCTION BASELINE\
**Project:** Batam Travelling ERP\
**Last Updated:** 2026-08-08

---

# 1. PURPOSE

Dokumen ini mendefinisikan arsitektur multi-tenancy, isolasi data, konfigurasi tenant, serta mekanisme keamanan dan skalabilitas antar tenant dalam sistem Batam Travelling ERP.

Tujuan utama:

```text
Isolation
Security
Scalability
Configurability
Performance fairness
Operational control
Tenant independence
```

---

# 2. MULTI-TENANCY MODEL

Sistem menggunakan model:

```text
Logical Multi-Tenancy (Shared Infrastructure, Isolated Data)
```

Artinya:

```text
Satu aplikasi
Satu cluster
Satu database (logical separation)
Multi tenant via tenant_id isolation
```

---

# 3. TENANT DEFINITION

Tenant adalah entitas bisnis independen seperti:

```text
Travel agency
Branch operator
Corporate client
Reseller partner
Franchise unit
```

---

# 4. TENANT ISOLATION PRINCIPLE

Semua data harus terisolasi berdasarkan:

```text
tenant_id (mandatory)
```

Tidak boleh ada query tanpa tenant scope kecuali super-admin context.

---

# 5. ISOLATION LEVELS

## 5.1 Data Isolation

```text
Row-level isolation via tenant_id
```

## 5.2 Query Isolation

Semua query wajib:

```text
WHERE tenant_id = ?
```

## 5.3 Service Isolation

Service layer wajib enforce tenant context.

## 5.4 Cache Isolation

Cache key wajib mengandung tenant scope.

## 5.5 File Isolation

Storage path wajib dipisahkan per tenant.

---

# 6. TENANT CONTEXT

Setiap request wajib membawa tenant context:

```text
tenant_id
user_id
role
permissions
```

---

# 7. TENANT RESOLUTION

Tenant dapat ditentukan melalui:

```text
Subdomain (preferred)
Header (X-Tenant-ID)
JWT claim
API key mapping
```

Priority resolution:

```text
1. Subdomain
2. JWT
3. API Key
4. Header fallback
```

---

# 8. TENANT SCHEMA RULE

Semua tabel business wajib memiliki:

```sql
tenant_id UUID NOT NULL
```

Index wajib:

```sql
INDEX (tenant_id)
```

Composite index jika diperlukan:

```sql
(tenant_id, created_at)
(tenant_id, status)
```

---

# 9. GLOBAL VS TENANT DATA

## 9.1 Global Data

```text
System config
Master currency
Global roles template
Platform settings
```

## 9.2 Tenant Data

```text
Users
Bookings
Orders
Payments
Articles
Products
Reports
```

---

# 10. SUPER ADMIN MODEL

Super admin memiliki akses:

```text
Cross-tenant read
Cross-tenant analytics
Tenant management
System configuration
```

Namun:

```text
Tidak boleh modify tenant data tanpa audit log
```

---

# 11. TENANT CREATION

Tenant onboarding harus mencakup:

```text
Create tenant record
Initialize default roles
Initialize default settings
Provision storage namespace
Initialize cache namespace
Initialize billing profile
```

---

# 12. TENANT LIFECYCLE

```text
ACTIVE
SUSPENDED
TRIAL
EXPIRED
DELETED
```

---

# 13. TENANT SUSPENSION

Jika tenant suspended:

```text
Block API access
Block login
Allow read-only (optional)
Preserve data
```

---

# 14. TENANT DELETION

Deletion mode:

```text
Soft delete (default)
Hard delete (restricted)
```

Soft delete:

```text
Mark inactive
Retain data
Disable access
```

Hard delete:

```text
Remove all tenant data
Remove files
Remove cache
Remove logs (optional compliance-based)
```

---

# 15. TENANT CONFIGURATION

Setiap tenant memiliki konfigurasi:

```text
Business rules
Pricing rules
Feature flags
UI branding
Notification settings
Integration settings
```

---

# 16. FEATURE FLAGS PER TENANT

Feature dapat diaktifkan per tenant:

```text
booking_module: true
payment_gateway: false
analytics: true
```

---

# 17. TENANT BRANDING

Support:

```text
Logo
Primary color
Secondary color
Font
Email template branding
Invoice template branding
```

---

# 18. TENANT PRICING MODEL

Setiap tenant dapat memiliki:

```text
Commission rate
Markup rules
Discount rules
Service fee
Subscription plan
```

---

# 19. TENANT LIMITS

Limit per tenant:

```text
Max users
Max bookings/day
Max API calls
Max storage
Max reports
Max integrations
```

---

# 20. TENANT QUOTAS

Quota enforcement:

```text
Soft limit (warning)
Hard limit (block)
```

---

# 21. TENANT RATE LIMIT

Rate limit per tenant:

```text
requests/minute
requests/hour
requests/day
```

---

# 22. TENANT DATA SCOPE ENFORCEMENT

Enforcement layer:

```text
Controller layer
Service layer
Repository layer
Query builder layer
```

---

# 23. QUERY GUARD

System harus mencegah query tanpa tenant filter:

```text
FAIL FAST if tenant_id missing
```

---

# 24. ORM ENFORCEMENT

ORM harus auto-inject tenant filter jika possible.

---

# 25. RAW QUERY RULE

Raw SQL wajib menyertakan tenant filter manual.

---

# 26. CACHE TENANT ISOLATION

Cache key format:

```text
tenant:{tenant_id}:{resource}:{id}
```

---

# 27. FILE STORAGE ISOLATION

Path structure:

```text
/tenant/{tenant_id}/files/...
```

---

# 28. CDN ISOLATION

Public assets tetap global, private assets tenant-scoped.

---

# 29. SEARCH ISOLATION

Search index wajib partition per tenant:

```text
tenant_id field mandatory
```

---

# 30. ANALYTICS ISOLATION

Analytics harus:

```text
tenant-level aggregation
cross-tenant only for super admin
```

---

# 31. REPORTING ISOLATION

Report default:

```text
tenant-scoped
```

---

# 32. CROSS-TENANT ACCESS RULE

Hanya super-admin atau system job tertentu yang boleh:

```text
cross-tenant query
```

---

# 33. AUDIT REQUIREMENT

Semua cross-tenant access harus dicatat:

```text
actor
reason
timestamp
affected tenants
```

---

# 34. TENANT-AWARE AUDIT LOG

Audit log wajib menyimpan:

```text
tenant_id
user_id
action
resource
timestamp
ip_address
```

---

# 35. TENANT-AWARE NOTIFICATION

Notification harus scoped:

```text
tenant recipients only
```

---

# 36. TENANT-AWARE INTEGRATION

Webhook/integration harus:

```text
tenant-specific credentials
tenant-specific endpoints
```

---

# 37. TENANT DATABASE STRATEGY

Model:

```text
Single database
Shared schema
Tenant isolation via tenant_id
```

---

# 38. OPTIONAL SCALING MODEL

Jika scale besar:

```text
Database sharding per tenant group
Read replica per region
```

---

# 39. TENANT PERFORMANCE ISOLATION

Satu tenant tidak boleh:

```text
mengganggu latency tenant lain
menghabiskan shared resources
```

---

# 40. NOISY NEIGHBOR PROTECTION

Mitigasi:

```text
Rate limiting per tenant
Queue isolation
Worker pool isolation
Query throttling
```

---

# 41. TENANT QUEUE ISOLATION

Queue dapat dipisah:

```text
tenant-aware routing
priority-based scheduling
```

---

# 42. TENANT WORKER ISOLATION

Worker dapat:

```text
dedicated per tenant (enterprise)
shared pool (standard)
```

---

# 43. TENANT CONFIG CACHE

Config tenant harus di-cache:

```text
low latency access
auto refresh on update
```

---

# 44. TENANT CONFIG INVALIDATION

Jika config berubah:

```text
invalidate cache
broadcast update
```

---

# 45. TENANT MIGRATION

Migration harus:

```text
backward compatible
tenant-safe
zero downtime
```

---

# 46. TENANT BACKUP

Backup harus:

```text
per tenant restore capability
logical separation
```

---

# 47. TENANT RESTORE

Restore dapat dilakukan:

```text
full tenant restore
partial data restore
```

---

# 48. TENANT OBSERVABILITY

Metrics per tenant:

```text
request rate
error rate
latency
resource usage
```

---

# 49. TENANT HEALTH SCORE

Optional scoring:

```text
healthy
degraded
critical
```

---

# 50. TENANT BILLING INTEGRATION

Billing dapat berbasis:

```text
usage-based
subscription-based
hybrid
```

---

# 51. USAGE TRACKING

Track per tenant:

```text
API calls
storage usage
transactions
jobs
```

---

# 52. TENANT LIMIT ENFORCEMENT FLOW

```text
Request
 ↓
Resolve tenant
 ↓
Check quota
 ↓
Allow / Reject / Throttle
```

---

# 53. TENANT SECURITY MODEL

Security scope:

```text
tenant boundary = security boundary
```

---

# 54. TENANT DATA LEAK PREVENTION

Wajib:

```text
strict query filtering
automated tests
security validation
```

---

# 55. TENANT TESTING REQUIREMENT

Test harus mencakup:

```text
multi-tenant isolation test
cross-tenant access test
load per tenant test
```

---

# 56. TENANT DEBUGGING MODE

Debug mode harus:

```text
restricted access
audit logged
```

---

# 57. TENANT FEATURE ROLLOUT

Feature rollout dapat:

```text
per tenant
per group
global
```

---

# 58. TENANT EXPERIMENTATION

A/B testing per tenant diperbolehkan.

---

# 59. TENANT MIGRATION STRATEGY

Jika schema berubah:

```text
dual write
backfill
switch
cleanup
```

---

# 60. FINAL TENANT ARCHITECTURE

```text
                ┌──────────────────────┐
                │      SUPER ADMIN     │
                └──────────┬───────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
 ┌────────────┐   ┌────────────┐   ┌────────────┐
 │ TENANT A   │   │ TENANT B   │   │ TENANT C   │
 └────┬───────┘   └────┬───────┘   └────┬───────┘
      │                │                │
      ▼                ▼                ▼
  Users/Orders     Users/Orders     Users/Orders
  Bookings         Bookings         Bookings
  Payments         Payments         Payments
```

---

# 61. NEXT DOCUMENT

Dokumen berikutnya:

```text
27_ROLE_BASED_ACCESS_CONTROL_AND_PERMISSION_MATRIX_SPECIFICATION.md
```

Fokus:

```text
RBAC model
Permission matrix
Role hierarchy
Dynamic permissions
Module-level access control
Field-level security
Action-level security
API authorization rules
UI permission gating
Audit permission usage
```

---

# END OF DOCUMENT
