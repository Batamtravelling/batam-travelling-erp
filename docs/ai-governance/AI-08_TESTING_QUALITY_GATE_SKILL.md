# AI-08 — Testing and Quality Gate

## Test Priority

- Unit: pricing, status transitions, totals, identifier parsing, capacity.
- Integration: Prisma transactions, constraints, tenant scope, identifier allocation.
- API contract: validation, authorization, errors, idempotency, compatibility.
- E2E: lead → quotation → booking; public order → booking/invoice; booking → payment; departure capacity; customer portal.

## Mandatory High-Risk Tests

- Cross-tenant reads and writes are denied.
- Unauthorized role and object access are denied.
- Concurrent bookings do not oversell capacity or duplicate codes.
- Repeated public order/payment/webhook requests do not duplicate transactions.
- Cancel/refund/finalization behavior matches approved rules.
- SSR public pages behave correctly for API success, empty content, timeout, misconfiguration, and stale cache.
- Production seed does not create demo identities, localhost media, or placeholder contact data.

## Repository Gate

Run relevant targeted tests, then `pnpm lint`, `pnpm test`, and `pnpm build` before production handoff. Use `pnpm check` for the complete configured gate. Never weaken a valid test to make a change pass.

