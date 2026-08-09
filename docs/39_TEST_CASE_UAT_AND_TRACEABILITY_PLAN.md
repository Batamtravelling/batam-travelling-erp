# Test Case, UAT and Traceability Plan

## Traceability format

`Requirement -> backlog item -> design screen -> API/event -> automated test -> UAT scenario -> release evidence`.

| ID | Scenario | Expected result |
|---|---|---|
| UAT-001 | Create and assign a lead | Tenant-scoped audit record exists |
| UAT-002 | Send approved quotation | Immutable version/snapshot is sent |
| UAT-003 | Confirm after verified payment | Booking/finance records reconcile |
| UAT-004 | Attempt cross-tenant access | Access denied and security event logged |
| UAT-005 | Receive duplicate payment webhook | Exactly one financial outcome |
| UAT-006 | Cancel/reschedule | Policy, notification, audit, finance apply |
| UAT-007 | Restore non-production backup | Integrity and tenant isolation verified |

Run unit, integration, API-contract, authorization, migration, end-to-end, accessibility, performance, security, backup-restore, and webhook-recovery tests. Record result, defect severity, owner, retest date, and product-owner approval.
