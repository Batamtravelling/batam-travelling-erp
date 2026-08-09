# API Contract and Event Catalog

**Policy source:** `10_API_AND_INTEGRATION_SPECIFICATION.md`. This document governs implementation artifacts.

## Deliverables

- Maintain an OpenAPI 3.1 file named `openapi.yaml` after ADR-001 is approved.
- Each endpoint declares authentication, tenant scope, schemas, errors, pagination/filtering, and state-change idempotency.
- Version contracts. Breaking changes need migration and deprecation dates.
- Generate validation and contract tests from the approved OpenAPI file.

## Resource groups

`auth`, `users`, `roles`, `customers`, `leads`, `packages`, `itineraries`, `quotations`, `bookings`, `invoices`, `payments`, `vendors`, `trips`, `files`, `content`, `notifications`, and `reports`.

## Required events

| Event | Producer | Consumers |
|---|---|---|
| `lead.created` | CRM | Notification, analytics |
| `quotation.sent` | Quotation | Notification, audit |
| `booking.confirmed` | Booking | Operations, notification, analytics |
| `invoice.issued` | Finance | Notification |
| `payment.verified` | Payment | Booking, finance, notification |
| `trip.assignment.changed` | Operations | Notification |

Every event includes `event_id`, `event_type`, `occurred_at`, `tenant_id`, `actor_id` where applicable, `aggregate_type`, `aggregate_id`, `schema_version`, and a minimum safe payload. Consumers must be idempotent. No endpoint/event starts implementation before schema, authorization, and acceptance scenario review.
