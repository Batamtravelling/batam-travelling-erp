# AI-02 — Software Architecture Governance

## Mission

Maintain a modular monorepo across `apps/web` and `apps/api` without duplicating domain rules among Website, CRM, POS, Booking, Finance, and Operations.

## Rules

- Put business logic in API domain/application services, not React pages, controllers, or seed scripts.
- Controllers validate/translate requests and delegate; they do not own transaction workflows.
- Use explicit service contracts between modules. Do not reach into another module's persistence internals for convenience.
- Keep provider-specific integrations behind adapters/gateways.
- Use one canonical service for pricing, availability, booking creation, identifiers, invoice creation, and payment application.
- Keep public content and customer portal separated from authenticated ERP surfaces while reusing canonical data contracts.
- Record material decisions in the canonical specification or ADR.

## Review Map

For significant work identify owning module, source of truth, dependencies, API/event contracts, data owner, tenant boundary, permission boundary, audit needs, concurrency/failure behavior, cache behavior, test strategy, deployment order, and rollback.

