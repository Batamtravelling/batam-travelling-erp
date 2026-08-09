# BATAM TRAVELLING ERP
# PERFORMANCE, SCALABILITY AND CAPACITY SPECIFICATION

**File Name:** `25_PERFORMANCE_SCALABILITY_AND_CAPACITY_SPECIFICATION.md`  
**Document Number:** 25  
**Version:** 1.0  
**Status:** PRODUCTION BASELINE  
**Project:** Batam Travelling ERP  
**Last Updated:** 2026-08-08

---

# 1. PURPOSE

Dokumen ini mendefinisikan requirement performa, scalability, capacity planning, resource management, caching, concurrency, load handling, dan performance validation untuk Batam Travelling ERP.

Tujuan utama:

```text
Fast
Predictable
Scalable
Efficient
Observable
Resilient
Cost-aware
```

---

# 2. OBJECTIVES

System harus mampu:

```text
Menangani traffic normal
Menangani traffic peak
Menangani concurrent users
Menangani concurrent transactions
Memproses background jobs
Menskalakan workload
Menghindari resource exhaustion
Mempertahankan response time yang dapat diprediksi
Mendeteksi bottleneck
Melakukan capacity planning
```

---

# 3. PERFORMANCE PRINCIPLE

Performance harus dievaluasi melalui latency, throughput, concurrency, error rate, resource utilization, queue depth, database load, external dependency latency, cache effectiveness, dan cost per workload.

---

# 4. PERFORMANCE TARGET

Baseline target:

| Metric | Target |
|---|---:|
| Standard API p95 | ≤ 500 ms |
| Critical read API p95 | ≤ 500 ms |
| Critical write API p95 | ≤ 800 ms |
| Lightweight internal operation p95 | ≤ 300 ms |
| Standard page/API initial response | ≤ 1 s |
| Background job start latency | ≤ 30 s |
| Queue processing latency | ≤ 60 s |
| Error rate | < 1% |
| Critical API availability | ≥ 99.9% |

Target final dapat disesuaikan berdasarkan hasil capacity testing production-like.

---

# 5. PERCENTILE

Performance reporting wajib menggunakan p50, p75, p90, p95, dan p99. Average tidak boleh menjadi satu-satunya metric.

---

# 6. CRITICAL USER FLOWS

Priority tertinggi:

```text
Login
Dashboard
Customer search
Booking creation
Booking update
Availability checking
Payment status
Invoice
Order processing
Critical operational workflows
```

---

# 7. SYNCHRONOUS VS ASYNCHRONOUS

Heavy/non-critical workload seperti analytics, historical reports, bulk export, search indexing, notification, dan enrichment sebaiknya asynchronous.

---

# 8. PAGINATION

Dataset besar wajib menggunakan pagination. Default page size direkomendasikan 20–50 records dan client tidak boleh meminta unlimited records.

Cursor pagination preferred untuk dataset besar/sering berubah; offset pagination dapat digunakan untuk dataset kecil atau administrative views.

---

# 9. DATABASE PERFORMANCE

Database performance dikontrol melalui:

```text
Index
Query optimization
Connection pooling
Pagination
Caching
Partitioning
Archiving
Read replicas
```

Field yang sering digunakan pada WHERE, JOIN, ORDER BY, UNIQUE, dan foreign-key lookup harus dievaluasi untuk indexing.

---

# 10. QUERY PERFORMANCE

Critical query harus memiliki baseline. Query >500 ms pada critical path masuk performance review. Query >2 detik pada transactional path dianggap issue kecuali explicitly justified.

N+1 query harus dihindari. Gunakan projection dan jangan mengambil data yang tidak diperlukan.

---

# 11. DATABASE CONNECTIONS

Application wajib menggunakan connection pooling dan memonitor active, idle, waiting connections, errors, serta pool saturation.

Transaction harus sesingkat mungkin. Lock contention dan deadlock harus observable.

---

# 12. CONCURRENCY

System harus mencegah:

```text
Lost update
Duplicate transaction
Overselling
Double booking
Duplicate payment
Race condition
```

Availability-sensitive transaction harus menggunakan atomic reservation/concurrency control.

---

# 13. IDEMPOTENCY

Critical write endpoint dan retryable background jobs harus idempotent sehingga duplicate request menghasilkan logical result yang sama, bukan duplicate transaction.

---

# 14. CACHE ARCHITECTURE

Cache dapat digunakan untuk frequently-read data, reference data, configuration, expensive computations, public content, dan safe availability metadata.

Cache bukan source of truth untuk transactional state.

Cache key harus unique, deterministic, dan versioned bila perlu. Cache harus memiliki TTL atau explicit invalidation strategy.

---

# 15. CACHE STAMPEDE

Mitigasi dapat menggunakan:

```text
Lock
Request coalescing
Jittered TTL
Background refresh
```

Cache outage tidak boleh menghasilkan uncontrolled database thundering herd.

---

# 16. CDN AND STATIC ASSETS

CDN dapat digunakan untuk static assets, images, public content, landing pages, dan cacheable resources.

Assets harus menggunakan compression, content hashing, caching, image optimization, responsive sizing, dan lazy loading jika sesuai.

---

# 17. FRONTEND PERFORMANCE

Frontend harus memonitor:

```text
LCP
INP
CLS
TTFB
Bundle size
API waterfall
```

Public-facing pages ditargetkan memenuhi healthy Core Web Vitals.

---

# 18. PUBLIC CONTENT

Landing pages, artikel/blog, dan product widgets harus menggunakan caching, optimized images, minimal blocking JavaScript, batched product fetching, pagination, dan CDN jika sesuai.

---

# 19. DATABASE REPLICATION

Read replica dapat digunakan untuk read-heavy workload. Critical read-after-write harus menggunakan consistent source dan memperhitungkan replication lag.

---

# 20. DATABASE SCALING ORDER

```text
Query optimization
↓
Index optimization
↓
Caching
↓
Connection tuning
↓
Read replicas
↓
Partitioning
↓
Vertical scaling
↓
Horizontal architecture
```

---

# 21. QUEUE ARCHITECTURE

Durable queue digunakan untuk reliable background workload.

Logical priority:

```text
CRITICAL
HIGH
DEFAULT
LOW
BULK
```

Monitor queue depth, oldest-message age, processing rate, failure rate, dan queue lag.

---

# 22. WORKERS

Worker concurrency harus configurable. Jobs harus memiliki timeout, retry policy, idempotency, dan DLQ setelah retry exhausted.

Bulk workloads tidak boleh memonopoli critical worker pool.

---

# 23. AUTOSCALING

Application/worker dapat autoscale berdasarkan CPU, memory, request rate, latency, concurrency, queue depth, atau queue lag.

Autoscaling harus memiliki min/max instances, cooldown/hysteresis, dan cost guardrail.

---

# 24. STATELESS APPLICATION

Application layer harus stateless untuk horizontal scaling. Persistent files tidak boleh bergantung pada local instance filesystem.

---

# 25. RESOURCE LIMITS

Services/containers harus memiliki resource requests dan limits. Monitor CPU saturation, memory pressure, OOM, disk I/O, disk capacity, database storage, network throughput, dan connection saturation.

Baseline resource alerts dapat menggunakan WARNING ≥70% dan CRITICAL ≥85%, disesuaikan per resource.

---

# 26. EXTERNAL DEPENDENCIES

Monitor provider latency, timeout, error rate, dan rate limits.

Third-party latency harus dipisahkan dari internal application latency.

Timeout dependency tidak boleh lebih besar daripada overall request budget.

---

# 27. GOLDEN SIGNALS

Monitoring minimum:

```text
Latency
Traffic
Errors
Saturation
```

Tambahkan request rate, concurrency, database latency/connections, cache hit rate, queue depth/lag, dan external latency.

---

# 28. SLO

Critical service baseline:

```text
Availability ≥ 99.9%
p95 latency ≤ defined target
Error rate < 1%
```

SLO harus memiliki error budget.

---

# 29. PERFORMANCE REGRESSION

Release harus dibandingkan dengan baseline sebelumnya. Regression >10% pada critical path harus memicu review.

---

# 30. LOAD TESTING

Minimum:

```text
Baseline Test
Load Test
Stress Test
Spike Test
Soak Test
Volume Test
Concurrency Test
```

Testing harus menggunakan production-like environment dan realistic workload mix.

---

# 31. CAPACITY MODEL

Capacity model minimal menghitung:

```text
Registered users
Daily active users
Peak concurrent users
Requests/day
Peak RPS
Bookings/day
Payments/day
Jobs/day
Database growth
Storage growth
Log volume
Provider quota
```

---

# 32. CAPACITY HEADROOM

Baseline:

```text
Normal load ≤ 60%
Expected peak ≤ 75–80%
```

Capacity harus menyisakan headroom untuk spike, deployment, failure, maintenance, dan unexpected workload.

---

# 33. CAPACITY FORECAST

Forecast dilakukan minimal monthly, sebelum campaign, high season, major launch, dan significant architecture changes.

Database/storage/infrastructure growth harus memiliki planning horizon.

---

# 34. RATE LIMITING AND BACKPRESSURE

Public dan expensive endpoints harus memiliki rate limiting.

Saat saturation:

```text
Reject
Delay
Queue
Degrade
```

sesuai criticality.

---

# 35. GRACEFUL DEGRADATION

Non-critical features dapat ditunda/dinonaktifkan ketika system under pressure:

```text
Analytics
Heavy reports
Recommendations
Image optimization
Bulk jobs
```

Booking/payment critical path harus diprioritaskan.

---

# 36. WORKLOAD ISOLATION

Priority:

```text
P0 Critical Transaction
P1 Core Operation
P2 User Convenience
P3 Background
P4 Analytics/Bulk
```

Reporting/analytics/bulk workloads tidak boleh mengganggu booking/payment.

---

# 37. RETRY STORM PROTECTION

Gunakan exponential backoff, jitter, retry limits, circuit breaker, throttling, dan single retry ownership untuk mencegah retry amplification.

---

# 38. DEPLOYMENT PERFORMANCE

Rolling/blue-green/canary deployment harus mempertahankan minimum healthy capacity.

Canary harus memonitor latency, error rate, CPU, memory, dan database load serta mendukung rollback bila threshold terlampaui.

---

# 39. PERFORMANCE TEST GATE

Production release tidak boleh dilanjutkan jika critical performance test gagal.

Pass criteria:

```text
Critical p95 ≤ target
Critical p99 ≤ approved threshold
Error rate ≤ target
No severe resource saturation
No critical regression
```

---

# 40. CAPACITY TEST GATE

System harus mampu menangani expected peak load + approved headroom tanpa critical degradation.

---

# 41. SOAK/STRESS/SPIKE EXIT CRITERIA

Stress test harus menemukan sustainable throughput dan breaking point.

Soak test harus memastikan tidak ada memory leak, connection leak, queue accumulation, atau progressive latency degradation.

Spike test harus menunjukkan system dapat absorb, scale/throttle, avoid catastrophic failure, dan recover.

---

# 42. OBSERVABILITY

Performance dashboard minimal:

```text
p50/p95/p99 latency
Throughput
Error rate
CPU
Memory
Database
Cache
Queue
External services
Capacity
```

---

# 43. PERFORMANCE INCIDENT

Incident harus dianalisis menggunakan metrics, traces, logs, profiles, dan query plans.

Severity:

```text
P0 Critical transaction unavailable
P1 Major degradation
P2 Noticeable degradation
P3 Minor performance issue
```

---

# 44. DATA MIGRATION PERFORMANCE

Large migration/backfill harus:

```text
Chunked
Throttled
Resumable
Observable
Low-lock / online where possible
```

---

# 45. PERFORMANCE ACCEPTANCE CHECKLIST

```text
[ ] Critical APIs meet latency target
[ ] Frontend meets performance target
[ ] Database queries optimized
[ ] Indexes reviewed
[ ] Connection pool tuned
[ ] Cache strategy implemented
[ ] Queue strategy implemented
[ ] Worker concurrency configured
[ ] Autoscaling configured
[ ] Resource limits configured
[ ] Rate limits configured
[ ] External dependency timeouts configured
[ ] Retry policy configured
[ ] Circuit breaker configured where needed
[ ] Monitoring configured
[ ] Alerting configured
[ ] Load test passed
[ ] Stress test passed
[ ] Spike test passed
[ ] Soak test passed
[ ] Capacity forecast completed
[ ] Cost impact reviewed
```

---

# 46. FINAL PERFORMANCE PRINCIPLES

```text
1. Measure before optimizing.
2. Optimize before scaling.
3. Keep critical paths short.
4. Keep application services stateless.
5. Use pagination for large datasets.
6. Use caching only where it provides measurable value.
7. Keep database transactions short.
8. Protect critical operations from concurrency issues.
9. Make retries idempotent.
10. Prevent retry storms.
11. Isolate bulk workloads.
12. Process heavy work asynchronously.
13. Monitor queues and workers.
14. Treat external dependencies as unreliable.
15. Set explicit timeout budgets.
16. Use graceful degradation.
17. Maintain capacity headroom.
18. Test peak and failure scenarios.
19. Monitor p95/p99, not only averages.
20. Keep performance observable.
21. Forecast capacity before exhaustion.
22. Keep scaling limits cost-controlled.
23. Validate performance after major architectural changes.
24. Never sacrifice financial correctness for speed.
25. Never sacrifice security or data integrity for performance.
```

---

# 47. DOCUMENT DEPENDENCIES

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
16_BACKUP_DISASTER_RECOVERY_AND_BUSINESS_CONTINUITY_SPECIFICATION.md
17_TESTING_QUALITY_ASSURANCE_AND_RELEASE_VALIDATION_SPECIFICATION.md
19_REPORTING_ANALYTICS_AND_DASHBOARD_SPECIFICATION.md
20_NOTIFICATION_AND_COMMUNICATION_SPECIFICATION.md
21_FILE_AND_DOCUMENT_MANAGEMENT_SPECIFICATION.md
22_SEARCH_AND_DISCOVERY_SPECIFICATION.md
23_BUSINESS_WORKFLOW_AND_AUTOMATION_SPECIFICATION.md
24_INTEGRATION_EXTERNAL_SERVICES_AND_WEBHOOK_SPECIFICATION.md
```

---

# 48. NEXT DOCUMENT

```text
26_MULTI_TENANCY_CONFIGURATION_AND_TENANT_ISOLATION_SPECIFICATION.md
```

# END OF DOCUMENT
