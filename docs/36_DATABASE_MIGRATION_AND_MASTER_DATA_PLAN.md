# Database Migration and Master Data Plan

## Migration rules

- Version, review, and execute schema changes through CI/CD—never manually in production.
- Back up and test a restore before destructive migrations.
- Include tenant scope, audit timestamps, actor/ownership fields, and required indexes in tenant-owned tables.
- For high-risk changes use expand -> backfill -> dual read/write where needed -> cutover -> contract.

## Master data before MVP UAT

Currency, tax category, payment method, lead source, customer type, vendor type, destination, product/package category, booking/invoice/payment statuses, cancellation/refund reasons, employee role, and notification template.

## Legacy-data intake

| Dataset | Import format | Validation |
|---|---|---|
| Customers | CSV | duplicate, contact format, consent |
| Packages/prices | Spreadsheet | currency, dates, availability |
| Vendors | Spreadsheet | identity, contract, price period |
| Open bookings/invoices | CSV/accounting export | balance and reconciliation |

Cutover requires approved freeze window, archived source export, reconciled dry-run, assigned quality exceptions, logged import, signed spot checks, and named rollback owner.
