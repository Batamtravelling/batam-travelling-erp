# AI-06 — Security, Authorization, Tenant Isolation, and Audit

## Required Model

Every sensitive action requires authenticated actor, authorized permission, server-resolved tenant scope, object ownership/scope validation, and audit where appropriate.

## Controls

- Deny privileged actions by default; hidden UI is not authorization.
- Validate tenant/object scope on every sensitive lookup and mutation.
- Prevent mass assignment of status, money, ownership, role, tenant, and audit fields.
- Keep secrets in managed environment/secret storage and redact sensitive logs.
- Protect files with authorization and non-guessable storage references.
- Rate-limit public booking lookup and order endpoints; prevent customer enumeration.
- Mask customer data in public portal responses and avoid exposing internal notes.
- Apply least privilege to database, service accounts, integrations, and deployment credentials.

## Audit Events

Audit login/security changes, role/permission changes, booking overrides, price/discount overrides, payment verification, refund/void/finalization, sensitive customer access, cross-tenant administration, destructive actions, and production configuration changes. Capture actor, tenant, action, target, timestamp, reason, request ID, and useful before/after context.

