# Integration, Environment and Secrets Register

**Security rule:** never place real credentials in this repository.

| Environment | Purpose | Data | Providers |
|---|---|---|---|
| Development | Local engineer work | Synthetic only | Mocked/sandbox |
| Staging | Integration and UAT | Masked/synthetic | Sandbox/test account |
| Production | Live operation | Live, least privilege | Production account |

## Provider decisions

Record the selected payment, email, WhatsApp/SMS, storage, maps, search, analytics, error tracking, queue, identity/MFA, DNS/CDN, and backup providers. For each: owner, account holder, sandbox/production URL, webhook verification, rate limit, outage fallback, data shared, retention, cost/renewal owner, and offboarding/export plan.

Store only variable names in `.env.example`; keep real values in a managed secret store, rotate credentials, separate environments, and scan commits/CI logs for leaks.
