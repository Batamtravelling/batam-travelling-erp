# Batam Travelling ERP — Project Instructions

This repository contains the working knowledge base for Batam Travelling ERP. Treat the Markdown files in this project root as the available project baseline. Recovered source specifications are kept alongside distilled guidance; the guidance files are summaries, not replacements for the numbered specifications.

## Working rules

- Use Indonesian for business-facing documentation unless a technical term is clearer in English.
- Preserve multi-tenant isolation: every business-data operation must be scoped by `tenant_id`; cross-tenant access is restricted to audited super-admin or system-job contexts.
- Keep the API contract, security model, audit logging, billing, search, localization, and operational requirements aligned with the knowledge base.
- Do not invent provider credentials, financial rules, compliance obligations, or production configuration. Record assumptions explicitly.
- Store secrets outside source control and redact secrets, payment data, tokens, and unnecessary PII from logs.
- Prefer asynchronous, idempotent processing for webhooks and external integrations. Validate webhook authenticity before business processing.
- Treat private files as private by default; use short-lived, scoped signed URLs where file access is needed.
- When adding a feature, update the relevant knowledge document and the source inventory if it supersedes a recovered original specification.

## Start here

Read [the project knowledge base](BATAM_TRAVELLING_ERP_KNOWLEDGE.md) before planning implementation, then use [the source inventory](SOURCE_INVENTORY.md) to identify the original specification area.

Before application code begins, read `32_TECHNOLOGY_AND_ARCHITECTURE_DECISIONS.md`, `33_MVP_RELEASE_PLAN_AND_PRODUCT_BACKLOG.md`, `34_RBAC_PERMISSION_MATRIX.md`, `35_API_CONTRACT_AND_EVENT_CATALOG.md`, `36_DATABASE_MIGRATION_AND_MASTER_DATA_PLAN.md`, `37_INTEGRATION_PROVIDER_ENVIRONMENT_AND_SECRETS_REGISTER.md`, `39_TEST_CASE_UAT_AND_TRACEABILITY_PLAN.md`, and `42_ENGINEERING_BOOTSTRAP_AND_REPOSITORY_STANDARDS.md`.
