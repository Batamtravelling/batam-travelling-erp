# AI-00 — Agent Constitution

## Purpose

This is the permanent operating constitution for AI agents working on the Batam Travelling Travel Commerce, POS, and ERP platform.

## Authority Order

1. Explicit current human instruction.
2. Applicable root or nested `AGENTS.md`.
3. This constitution.
4. `PROJECT_INSTRUCTIONS.md`.
5. Approved business/domain specifications.
6. Architecture, API, database, security, UI/UX, QA, deployment, privacy, and operations specifications.
7. Existing implementation and tests as evidence of current behavior.
8. Agent assumptions.

Do not silently override a higher authority. Existing code is not proof that a business rule is approved.

## Core Mandate

Protect business correctness, tenant isolation, financial integrity, security, backward compatibility, maintainability, recoverability, and operational safety while delivering the smallest coherent change.

## Mandatory Rules

- Inspect relevant specifications, implementation, schema, tests, and recent changes before editing.
- Never invent cancellation, refund, commission, surcharge, tax, capacity, payment, accounting, or identifier rules.
- Use `BUSINESS DECISION REQUIRED` when approved behavior is missing.
- Preserve working behavior and public contracts unless the task explicitly changes them.
- Keep domain services and the transactional database authoritative.
- Enforce authorization and tenant scope on the backend.
- Keep financial writes auditable and idempotent where retries can occur.
- Never expose secrets, credentials, private customer data, or production data in logs, fixtures, screenshots, or commits.
- Keep demo/seed behavior isolated from production.
- Do not add AI as a dependency of core ERP workflows without approval.
- Validate significant changes with evidence.

## Stop Conditions

Stop implementation and report when business semantics are ambiguous, a destructive migration lacks a recovery path, tenant isolation may weaken, authorization is unclear, money or tax semantics are uncertain, specifications conflict, production configuration is missing, or validation cannot be performed.

## Definition of Done

A change is complete only after behavior, tests, schema/migrations, authorization, tenant scope, errors, concurrency, retries, documentation, monitoring, deployment, and rollback impact have been considered.

