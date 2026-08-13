# API Contract and Event Catalog

**Policy source:** `10_API_AND_INTEGRATION_SPECIFICATION.md`. This document governs implementation artifacts.

## Deliverables

- Maintain an OpenAPI 3.1 file named `openapi.yaml` after ADR-001 is approved.
- Each endpoint declares authentication, tenant scope, schemas, errors, pagination/filtering, and state-change idempotency.
- Version contracts. Breaking changes need migration and deprecation dates.
- Generate validation and contract tests from the approved OpenAPI file.

## Resource groups

`auth`, `users`, `roles`, `customers`, `leads`, `packages`, `itineraries`, `quotations`, `bookings`, `invoices`, `payments`, `vendors`, `trips`, `files`, `content`, `notifications`, and `reports`.

## Refund lifecycle contract

All refund operations are authenticated and tenant-scoped. Authorization uses separate permissions for viewing, requesting, Manager approval, Owner approval, rejection, and execution.

| Method | Path | Permission | Purpose |
|---|---|---|---|
| `GET` | `/payments/{paymentId}/refunds` | `refund.view` | List payment refunds |
| `POST` | `/payments/{paymentId}/refund-requests` | `refund.request` | Create a refund request without posting a ledger entry |
| `GET` | `/refund-requests/{refundId}` | `refund.view` | Read one refund request |
| `POST` | `/refund-requests/{refundId}/manager-approval` | `refund.approve.manager` | Record Finance Manager approval |
| `POST` | `/refund-requests/{refundId}/owner-approval` | `refund.approve.owner` | Record Owner approval after Manager approval |
| `POST` | `/refund-requests/{refundId}/reject` | `refund.reject` | Reject a request while it is still `REQUESTED` |
| `POST` | `/refund-requests/{refundId}/execute` | `refund.process` | Execute an approved refund and post one ledger `OUT` entry |

Execution requires an `Idempotency-Key` header plus proof and transaction reference. Reusing the same key with the same request returns the original result without duplicate refund, ledger, audit, or outbox records. A different key cannot execute an already executed request.

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
