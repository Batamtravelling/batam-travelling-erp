# Integration, Environment and Secrets Register

**Security rule:** never place real credentials in this repository.

| Environment | Purpose | Data | Providers |
|---|---|---|---|
| Development | Local engineer work | Synthetic only | Mocked/sandbox |
| Staging | Integration and UAT | Masked/synthetic | Sandbox/test account |
| Production | Live operation | Live, least privilege | Production account |

## Provider decisions

| Capability | Selected baseline | Secret/config owner | Environment rule |
|---|---|---|---|
| Web and HTTP API runtime | Vercel | Company Vercel team | Separate Preview and Production variables; production promotion requires approval |
| Transactional database | Supabase PostgreSQL | Company Supabase organization | Separate projects; runtime uses transaction pooler, migrations use `DIRECT_URL` |
| Staff identity | Supabase Auth | Company Supabase organization | Publishable key may reach browser; secret key is server-only; PostgreSQL RBAC remains authoritative |
| Object storage | Supabase Storage | Company Supabase organization | Public media and private business documents use separate buckets/policies |
| Distributed rate limit | Managed Redis, provider TBD | Infrastructure owner | Separate resources or namespaces; `REDIS_URL` is server-only |
| Runtime logs | Vercel + Supabase provider logs | Infrastructure/security owner | No secrets or customer PII in logs; retention and alert routing require approval |

Required Vercel variables are defined by name in `.env.example`. `DATABASE_URL`, `DIRECT_URL`, `SUPABASE_SECRET_KEY`, and `REDIS_URL` are sensitive server-only values. Preview variables must point only to non-production Supabase, Storage, Auth, and Redis resources.

Record the selected payment, email, WhatsApp/SMS, storage, maps, search, analytics, error tracking, queue, identity/MFA, DNS/CDN, and backup providers. For each: owner, account holder, sandbox/production URL, webhook verification, rate limit, outage fallback, data shared, retention, cost/renewal owner, and offboarding/export plan.

Store only variable names in `.env.example`; keep real values in a managed secret store, rotate credentials, separate environments, and scan commits/CI logs for leaks.
