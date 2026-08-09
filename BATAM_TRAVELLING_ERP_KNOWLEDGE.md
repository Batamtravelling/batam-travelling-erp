# Batam Travelling ERP — Extracted Project Knowledge

**Status:** usable knowledge baseline  
**Source:** extracted from the referenced conversation and reconciled with recovered project Markdown on 2026-08-09.  
**Integrity note:** this is a cross-document operational summary; the recovered specifications in `docs/specifications/` remain the source documents.

## Product scope

Batam Travelling ERP is a multi-tenant platform for travel agencies, branch operators, corporate clients, reseller partners, and franchise units. It covers business operations, product/content discovery, orders and payments, reporting, notifications, files, integrations, back-office operations, and platform administration.

## Core architecture

- Logical multi-tenancy: shared infrastructure and shared database schema, with strict logical isolation through mandatory `tenant_id`.
- Resolve tenant context primarily from subdomain, then JWT claim, API-key mapping, and header fallback. Each request carries tenant, user, role, and permission context.
- Scope every business query, cache key, file path, search document, analytics aggregation, notification, integration credential, and report to a tenant. Fail fast if the tenant scope is absent.
- Super-admin access may cross tenants only with audit logging; it must not modify tenant data without an auditable reason.
- Support lifecycle states such as trial, active, suspended, expired, and deleted. Suspension blocks access but preserves data; soft deletion is the default.
- Protect against noisy neighbours using tenant-specific rate limits, quotas, queues, worker allocation, and query throttling.

## Security and data handling

- Use RBAC and MFA for administrative/back-office capabilities; keep an immutable, tenant-aware audit trail.
- Store API keys, OAuth tokens, webhook secrets, private keys, and client secrets in a secret-management layer—not in source, logs, workflows, or plaintext database fields.
- Encrypt sensitive credentials at rest, rotate them, monitor expiry, and alert before expiry.
- Default uploaded files to private. Validate MIME type, extension, size, and checksum; scan for malware when the security architecture requires it.
- Redact secrets, payment details, and PII from logs and external-error responses.

## APIs and integrations

- Integrate external providers behind provider abstractions for payment, email, messaging, storage, maps, and analytics.
- Set connection/read timeouts, provider-aware rate limiting, exponential backoff with jitter for safe transient failures, circuit breakers, health checks, and explicit failover rules.
- State-changing operations require idempotency. Reject a reused idempotency key with a different payload.
- Webhooks: authenticate, verify signature and timestamp, protect against replay, persist the event, acknowledge promptly, and process asynchronously. Deduplicate by event/provider-event ID and recover failures through retries, DLQ, and authorized replay.
- Payment state is normalized and verified server-to-server where possible. Validate amount, currency, reference, and merchant before marking a payment as paid. Financial reconciliation compares internal payments with provider transactions.

## Operations and quality

- Observe request rate, latency, error rate, resource use, integration health, webhooks, payments, email, storage, queues, and tenant-level health.
- Keep backups and restore capability tenant-aware. Use compatible migrations and zero-downtime patterns such as dual-write, backfill, switch, and cleanup when required.
- Test tenant isolation, cross-tenant access denial, quotas, external-failure recovery, webhook idempotency, payment flows, security controls, light/dark/system themes, accessibility, localization, and RTL readiness.

## Product capabilities captured in the source conversation

The original specification series covered business rules and product requirements; UI/UX; APIs; security; DevOps; database design; observability; backup and disaster recovery; QA; analytics; notifications; files; integration; performance; multi-tenancy; billing; admin back-office; search; and localization.

Public-facing content supports articles, product relationships and discovery, multilingual SEO, locale-specific URL/slug behaviour, Bahasa Indonesia and English, and a Light/Dark/System theme that respects `prefers-color-scheme`, semantic tokens, accessibility contrast, SSR/hydration concerns, and reduced-motion preferences.

## Implementation decision log

1. The baseline is logical multi-tenancy, not a per-tenant database by default.
2. A `tenant_id` filter is a security boundary, not merely a reporting dimension.
3. External requests must never be unbounded; a timeout and safe retry policy are mandatory.
4. Webhook delivery is an input event, not proof of a completed business action until verified and processed idempotently.
5. The platform must remain operable when noncritical enrichment services (for example maps or analytics) fail.
