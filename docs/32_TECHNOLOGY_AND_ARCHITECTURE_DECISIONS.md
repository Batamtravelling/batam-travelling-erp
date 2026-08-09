# Technology and Architecture Decisions

> **Current status: APPROVED BASELINE — 2026-08-09.** The decision register below is retained as historical intake; its TBD values are superseded by the approved decisions in this section.

## Approved decisions

| ID | Selected baseline |
|---|---|
| ADR-001 | TypeScript on current Active LTS Node.js; NestJS with the Fastify adapter |
| ADR-002 | TypeScript, React, and Next.js App Router |
| ADR-003 | PostgreSQL on Amazon RDS; Prisma ORM with reviewed SQL migrations |
| ADR-004 | Amazon ElastiCache Redis; BullMQ workers; transactional outbox |
| ADR-005 | Amazon S3 private buckets; CloudFront; short-lived signed URLs |
| ADR-006 | AWS Jakarta (ap-southeast-3); ECS Fargate; Route 53; CloudFront |
| ADR-007 | Amazon Cognito; TOTP MFA for privileged staff; API-side JWT validation |
| ADR-008 | OpenTelemetry; CloudWatch; X-Ray; Sentry with PII scrubbing |

### ADR-001 — Backend

Use TypeScript on the current Active LTS Node.js version, pinned in .nvmrc and CI. Build API and worker services with NestJS using Fastify. The MVP remains a modular monolith: modules own business rules and communicate through explicit services and versioned events. Microservices need a future ADR with a measurable boundary.

### ADR-002 — Frontend

Use Next.js App Router, React, and TypeScript. The public website and authenticated ERP share apps/web but use separate route groups and authorization boundaries. Public content uses server rendering and SEO-safe caching. The API remains the authority for authorization and mutations. Use Tailwind CSS, accessible component primitives, and semantic theme tokens for light, dark, and system modes. Native mobile applications are outside MVP scope.

### ADR-003 — Data

PostgreSQL is the authoritative transactional database. Production uses Amazon RDS PostgreSQL and local development uses Docker PostgreSQL of the same supported major version. Prisma is the default ORM; reviewed SQL is permitted for performance-critical queries and safe migrations. Tenant tables require tenant_id, ownership/audit fields, and tenant-aware indexes. All migrations are versioned in Git and applied only through CI/CD.

### ADR-004 — Cache, queues, and scheduled work

Use Redis and BullMQ for asynchronous jobs, retries, delayed tasks, rate limits, and short-lived caching. Deploy API, worker, and scheduler independently on ECS. State changes use a transactional outbox: commit domain data and an outbox record in one PostgreSQL transaction, publish through a worker, and make consumers idempotent by event ID. Financial and booking states must never depend solely on cache or queue state.

### ADR-005 — Files and delivery

Use Amazon S3. Private files require server-side authorization and short-lived signed URLs; public marketing media is delivered through CloudFront. The application generates object keys, never user filenames. Scan uploads and process images before they are available. Enable object versioning for critical buckets and lifecycle retention rules. Customer documents, payment evidence, secrets, and internal files are never public.

### ADR-006 — Deployment and networking

Deploy production in AWS Asia Pacific (Jakarta), ap-southeast-3, for the Indonesian launch market. Use ECS Fargate for web, API, worker, and scheduler; RDS PostgreSQL; ElastiCache Redis; S3; CloudFront; Route 53; ACM; IAM; KMS; and Secrets Manager. Use private application/data subnets behind a public load balancer, least-privilege security groups, Terraform infrastructure as code, and separate accounts/secrets for development, staging, and production. Production design uses at least two Availability Zones where supported.

### ADR-007 — Identity and access

Use Amazon Cognito for staff and customer identity. Require TOTP MFA for privileged staff before production. Cognito establishes identity; PostgreSQL establishes tenant membership, RBAC, approval limits, and resource ownership. The API validates JWTs and resolves tenant context on every request. Frontend checks never replace server-side authorization.

### ADR-008 — Observability

Instrument web, API, workers, and integrations with OpenTelemetry from the first sprint. Send structured logs, metrics, and alarms to CloudWatch; export distributed traces to X-Ray; and use Sentry for exceptions with PII scrubbing. Every request has a request ID and outbound integrations propagate a correlation ID. Alert ownership and escalation must be completed in Document 41 before staging deployment.

## Immediate build actions

1. Initialise the pnpm workspace, Git protections, and CI under Document 42.
2. Create apps/web, apps/api, apps/worker, packages/contracts, packages/config, and infrastructure/terraform.
3. Create OpenAPI schemas and contract tests under Document 35.
4. Provision development and staging through Terraform before external-provider setup.
5. Populate provider ownership, accounts, and secret-variable names in Document 37.
6. Complete Documents 39–41 before production release.

**Status:** DECISION REGISTER — complete before production coding.

## Historical decision intake (superseded)

| ID | Decision | Owner | Status |
|---|---|---|---|
| ADR-001 | Backend runtime and framework | Technical lead | TBD |
| ADR-002 | Web frontend and rendering model | Technical lead + product | TBD |
| ADR-003 | Primary database | Technical lead | TBD |
| ADR-004 | Cache, queue, and job runner | Technical lead | TBD |
| ADR-005 | Object storage and CDN | Technical lead | TBD |
| ADR-006 | Hosting, region, domains, and DNS | Owner + technical lead | TBD |
| ADR-007 | Authentication and MFA | Security owner | TBD |
| ADR-008 | Logs, metrics, traces, and alerting | Technical lead | TBD |

## Architecture baseline

- Start as a modular monolith; split services only at a measured domain or operational boundary.
- Deploy web/API, workers, and schedulers as separate processes.
- Enforce tenant context in API, service, query, cache, storage, queue, search, and audit layers.
- Access external providers through adapters; external providers do not define internal business states.
- Use database transactions plus an outbox/event pattern for state changes that emit events.

## ADR template

Record context, options, selected option, rejected options, consequences, migration/exit plan, security/cost impact, date, and approver. ADR-001 to ADR-006 are mandatory before repository bootstrap; ADR-007 and ADR-008 are mandatory before public deployment.
