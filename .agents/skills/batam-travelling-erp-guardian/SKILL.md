---
name: batam-travelling-erp-guardian
description: Review and safely implement production-affecting changes in the Batam Travelling ERP repository. Use for booking, payment, invoice, public ordering, travel packages, departures, capacity, tenant isolation, Prisma migrations, API contracts, public SSR/content, customer portal, refactoring, release review, or deployment readiness. Do not use for generic writing or unrelated repositories.
---

# Batam Travelling ERP Guardian

Follow the repository `AGENTS.md`. Read `PROJECT_INSTRUCTIONS.md`, `docs/ai-governance/AI-00_AGENT_CONSTITUTION.md`, `AI-01_AGENT_OPERATING_PROTOCOL.md`, and only the governance/specification files relevant to the task.

## Workflow

1. Inspect repository state, affected code, Prisma schema/migrations, tests, configuration, and recent commits.
2. Classify the change and map business, API, data, tenant, authorization, audit, concurrency, configuration, deployment, and rollback impact.
3. Surface unresolved business rules as `BUSINESS DECISION REQUIRED`.
4. Implement or recommend the smallest coherent change through canonical services.
5. Validate negative paths, concurrency, retries/idempotency, and tenant isolation when relevant.
6. Run targeted checks, then production gates required by `AGENTS.md`.
7. Report findings first for reviews; otherwise report changed behavior, evidence, risks, and deployment notes.

## Critical Guardrails

- Never use `count() + 1` for business identifiers.
- Never duplicate booking/pricing/capacity logic across Website, POS, CRM, and admin flows.
- Never trust client-supplied tenant, permission, price, totals, paid amount, or lifecycle status.
- Never allow API/configuration failure to masquerade silently as valid empty public content.
- Never ship localhost/demo/placeholder data into production configuration or seeds.
- Never approve a deploy without successful build evidence and explicit remaining-risk disclosure.

## Booking Code

Use `BTV-YYYYMM-NNNN` only after confirming the approved meaning of `YYYYMM`. Allocate the sequence atomically per tenant and month with a unique database constraint and concurrency tests. Preserve historical codes.

