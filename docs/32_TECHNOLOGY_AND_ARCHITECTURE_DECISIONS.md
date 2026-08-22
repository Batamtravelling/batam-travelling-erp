# Technology and Architecture Decisions

> **Current status: APPROVED BASELINE v2 — 2026-08-21.** Vercel + Supabase supersedes the AWS provider baseline dated 2026-08-09. The earlier AWS selection is retained in Git history as an exit/scaling option, not an active deployment target.

## Approved decisions

| ID | Selected baseline |
|---|---|
| ADR-001 | TypeScript on current Active LTS Node.js; NestJS with the Fastify adapter |
| ADR-002 | TypeScript, React, and Next.js App Router |
| ADR-003 | Supabase PostgreSQL; Prisma ORM; Supavisor transaction pooler for Vercel runtime; direct/session connection for migrations |
| ADR-004 | Managed Redis for distributed rate limits and future bounded background work; transactional database remains authoritative |
| ADR-005 | Supabase Storage: public marketing bucket plus private business-document bucket with short-lived signed URLs |
| ADR-006 | Vercel for Next.js and NestJS Functions; isolated Preview and Production environments |
| ADR-007 | Supabase Auth for identity; PostgreSQL membership/RBAC remains authoritative; API-side JWT validation |
| ADR-008 | Vercel runtime logs/observability plus structured request IDs; external error monitoring requires a separately approved provider |

### ADR-001 — Backend

Use TypeScript on the current Active LTS Node.js version, pinned in .nvmrc and CI. Build API and worker services with NestJS using Fastify. The MVP remains a modular monolith: modules own business rules and communicate through explicit services and versioned events. Microservices need a future ADR with a measurable boundary.

### ADR-002 — Frontend

Use Next.js App Router, React, and TypeScript. The public website and authenticated ERP share apps/web but use separate route groups and authorization boundaries. Public content uses server rendering and SEO-safe caching. The API remains the authority for authorization and mutations. Use Tailwind CSS, accessible component primitives, and semantic theme tokens for light, dark, and system modes. Native mobile applications are outside MVP scope.

### ADR-003 — Data

PostgreSQL is the authoritative transactional database. Staging and production use separate Supabase projects; local development uses Docker PostgreSQL of the same supported major version. Prisma is the default ORM. Vercel runtime traffic uses the Supabase transaction pooler through `DATABASE_URL`; migrations use a separate direct or session-pooler connection through `DIRECT_URL`. Tenant tables require tenant_id, ownership/audit fields, and tenant-aware indexes. All migrations are versioned in Git and executed as an explicit release step outside the Vercel request lifecycle.

### ADR-004 — Cache, queues, and scheduled work

Use a managed Redis instance for distributed API rate limits and short-lived non-authoritative state. Configure a different Redis instance or namespace per environment. Background workers, queues, and schedules are not implied by Vercel Functions; introduce them only through a future ADR with bounded retries and operational ownership. State changes continue to use PostgreSQL transactions and the outbox pattern. Financial and booking states must never depend solely on Redis or a queue.

### ADR-005 — Files and delivery

Use Supabase Storage. Public marketing media uses the dedicated public media bucket. Payment evidence, customer documents, archives, and internal files use private buckets with server-side authorization and short-lived signed URLs. The application generates tenant-scoped object keys and never trusts user filenames. Bucket policies, retention, malware-scanning requirements, backup/export, and restore evidence remain release gates. Database backups do not by themselves back up Storage objects.

### ADR-006 — Deployment and networking

Deploy the Next.js web application and NestJS HTTP API on Vercel from the repository root. The framework preset is Next.js and the build output is `apps/web/.next`; `api/index.ts` is the NestJS Vercel Function entry point. Vercel Preview must use isolated Supabase and Redis resources and must never connect to production data. Production promotion uses the same validated artifact after migration, smoke, security, and owner approval. Long-running workers or schedules require a separate runtime decision and must not be hidden inside request handlers.

### ADR-007 — Identity and access

Use Supabase Auth for staff identity and approved customer authentication adapters. Require MFA for privileged staff before production when the selected Supabase plan and application flow support the approved assurance level. Supabase establishes identity; PostgreSQL establishes tenant membership, RBAC, approval limits, and resource ownership. The API validates access tokens and resolves tenant context on every request. Supabase `user_metadata` and frontend checks never establish authorization.

### ADR-008 — Observability

Emit structured logs and request IDs from web/API code and use Vercel deployment/runtime logs for the initial runtime view. Enable Vercel observability appropriate to the selected plan and configure an approved external error-monitoring destination with PII scrubbing before production. Supabase database/Auth/Storage signals and Redis health require separate dashboards and alerts. Alert ownership and escalation must be completed in Document 41 before production.

## Immediate build actions

1. Initialise the pnpm workspace, Git protections, and CI under Document 42.
2. Maintain apps/web, apps/api, packages/contracts, and provider adapters; add worker infrastructure only after a worker-runtime ADR.
3. Create OpenAPI schemas and contract tests under Document 35.
4. Provision isolated Supabase projects, Redis resources, and Vercel environments before migration or external-provider setup.
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
- Deploy web/API on Vercel; deploy workers or schedulers separately only after their runtime ADR is approved.
- Enforce tenant context in API, service, query, cache, storage, queue, search, and audit layers.
- Access external providers through adapters; external providers do not define internal business states.
- Use database transactions plus an outbox/event pattern for state changes that emit events.

## ADR template

Record context, options, selected option, rejected options, consequences, migration/exit plan, security/cost impact, date, and approver. ADR-001 to ADR-006 are mandatory before repository bootstrap; ADR-007 and ADR-008 are mandatory before public deployment.
