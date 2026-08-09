# MVP Release Plan and Product Backlog

**Release objective:** staff can capture a lead, issue a quotation, create a booking, record a payment, operate a confirmed trip, and see an auditable history.

| Priority | Capability | Outcome |
|---|---|---|
| P0 | Identity, tenant, roles, audit | Authorised staff access only |
| P0 | CRM lead and customer | One customer history and follow-up trail |
| P0 | Package, itinerary, pricing | Valid offer can be prepared |
| P0 | Quotation and approval | Customer-facing offer with version/snapshot |
| P0 | Booking, invoice, payment record | Traceable commercial transaction |
| P0 | Vendor, schedule, operations | Confirmed trip is operationally ready |
| P0 | Core dashboard/reports | Owner sees sales, bookings, payments |
| P1 | Public package pages and lead form | Qualified website leads |
| P1 | Customer quotation/payment portal | Reduced manual follow-up |
| P2 | POS, advanced automation/analytics, tenant billing | Defer until core is stable |

## Delivery order

1. Architecture decisions, tenant/authentication, audit, migration tooling, CI.
2. CRM, package, price, and quotation.
3. Booking, invoice, payment, and notification.
4. Vendor, schedule, assignment, and trip readiness.
5. Reports, UAT, and production-readiness review.

## Gates

A backlog item needs owner, business rule, acceptance criteria, UX reference, API/data impact, role impact, and tests before work starts. No P0 unresolved security issue, incomplete backup-restore drill, or failed UAT flow may reach production.
