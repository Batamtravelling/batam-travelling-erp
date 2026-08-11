# AI-04 — API and Integration Governance

## Boundary Rules

- Validate DTOs and enforce tenant, ownership, authorization, price, totals, capacity, and lifecycle rules server-side.
- Never trust client-supplied tenant, role, permission, price, discount, paid amount, status, or ownership.
- Public writes require rate limiting and abuse controls.
- Payment, booking, public order, and webhook writes require idempotency when retry duplication is harmful.
- External calls require explicit timeout, bounded retry, error mapping, correlation/request IDs, and observability.
- Verify webhook signatures where supported and store provider IDs separately.
- Version breaking API changes and preserve compatibility windows.

## Public Order Transaction

A public order must use canonical services and an atomic transaction for the intended customer/lead/booking/invoice/item creation. Capacity checks and identifier allocation must remain safe under concurrent requests. Partial failure must not leave orphaned financial or booking records.

## Provider Pattern

Core domain → application service → provider interface → provider adapter → external API.

