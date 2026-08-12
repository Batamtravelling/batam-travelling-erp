# Staging load tests

Run these tests only against an isolated staging database with synthetic data.

- `public-catalog.k6.js`: public catalog/profile read traffic.
- `erp-read.k6.js`: authenticated dashboard and paginated ERP reads.
- `public-order.k6.js`: synthetic write/concurrency test; requires `ENABLE_WRITE_LOAD=true` and creates test bookings.

Never point the write test at production. Record API revision, database project ref, VU/rate, p95/p99, error rate, database CPU/connections, and cleanup result with the release evidence.
