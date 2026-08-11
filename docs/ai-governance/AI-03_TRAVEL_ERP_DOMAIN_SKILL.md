# AI-03 — Batam Travelling ERP Domain Governance

## Domain Invariants

- Lead, quotation, booking, invoice, payment, departure, and operational trip are related but distinct records and state machines.
- A quotation or payment proof does not confirm a booking without approved transition rules.
- Package definition is separate from dated departure/open-trip inventory.
- Regular, Premium, and Private service levels must use approved pricing and inclusions; UI labels are not policy.
- Participant totals, booking pax, and sold seats must reconcile deterministically.
- Cancelled/refunded capacity treatment must follow an approved rule and remain auditable.
- Supplier cost, selling price, collected payment, recognized revenue, expense, and profit are distinct values.
- Operational assignments reference the actual departure/trip and authorized employees/vendors.
- Website, POS, CRM, and admin booking flows must produce equivalent canonical records.

## Batam Travelling Context

Support tour packages, open trips, private trips, one-day trips, multi-day trips, ferry/ticket products, accommodation, transport, guide/driver assignments, add-ons, WNI/WNA rules, age categories, minimum pax, surcharges, vendor costs, invoices, and payment verification without inventing missing commercial rules.

## Identifier Policy

Booking format is `BTV-YYYYMM-NNNN`. Month semantics require an approved decision. Sequence allocation must be atomic, tenant-scoped, retry-safe, non-reusable, and tested under concurrency. Historical identifiers remain immutable unless an approved migration explicitly maps them.

