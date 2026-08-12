# Production Readiness — Work Items 1–16

This document is a release gate, not a deployment approval. Production deployment remains prohibited until all external evidence is attached and the owner explicitly approves it.

| # | Work item | Repository status | External evidence still required |
|---|---|---|---|
| 1 | Isolated Supabase staging | Ready to provision | Owner cost confirmation and branch creation |
| 2 | Apply migrations | Quotation, payment-proof, and privilege migrations prepared | Replay on fresh PostgreSQL and Supabase staging |
| 3 | Tenant, owner, roles | Production-safe seed prepared; demo seed disabled by default | Bind the real Supabase Auth ID and verify two company admins |
| 4 | Real quotation module | Database-backed list/create/update/version/send/accept/reject/duplicate/convert | Staging workflow and printable quotation UAT |
| 5 | Remove placeholders | Misleading catch-all module page now returns 404 | Route-by-route visual confirmation |
| 6 | DTO and tenant controls | DTO validation, tenant ownership checks, explicit auth linking | Negative tenant/RBAC integration suite on staging |
| 7 | Booking workflow | Canonical server pricing, surcharge/capacity locks, manual-confirm audit, quote conversion | Cancellation/reschedule approval decisions and UAT |
| 8 | Operations modules | Create/update foundations, trip transitions and conflict-safe assignments | Full vendor billing/rate and lifecycle UAT |
| 9 | Payment controls | Pending/verify/reject, receipt, private payment proof and signed access | Refund threshold/approval policy, void/reversal workflow decision |
| 10 | Pagination | Core and admin lists paginated and searchable | High-cardinality staging verification |
| 11 | Reliability/observability | Redis production gate, request IDs, structured logs, health and housekeeping | Select alert/APM provider and verify alert delivery |
| 12 | Automated tests | Unit tests and concurrent sequence integration test prepared | CI green plus expanded tenant/payment/browser E2E |
| 13 | Load test | Read, catalog, and guarded write K6 scripts prepared | Run only on isolated staging and record thresholds/metrics |
| 14 | Real-device review | Popup-free package print route prepared | Android and desktop screenshots from staging |
| 15 | Backup/rollback | Guarded backup/restore rehearsal script and checklist prepared | Execute against isolated restore target and record RTO/RPO |
| 16 | Final read-only audit | Checklist defined | Run after items 1–15 evidence; owner signs deploy decision |

## Business decisions deliberately not encoded

- Refund small/large approval threshold and four-eyes policy.
- Cancellation/reschedule eligibility, fee, capacity release, and approval path.
- Invoice void/replacement and verified-payment reversal authority.
- Payment reminder channels/provider and delivery schedule.
- Alerting/APM provider and on-call recipients.
- Package-specific DP/final-payment exceptions beyond the documented company default.

These decisions must be approved before their workflows can be marked production-complete. They must not be inferred from UI text or implemented as hidden constants.
