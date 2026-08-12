# SECURITY RULES

**Status:** security summary from current repository baseline
**Tanggal audit:** 12 Agustus 2026

## Security baseline in repository

- Authorization is tenant-aware.
- RBAC is part of the documented architecture.
- Payment proof and other sensitive files require controlled access.
- Customer portal data should only expose what the customer is entitled to see.
- Audit trail is required for meaningful changes.

## Security rules to preserve

- Server-side auth always wins over frontend checks.
- Sensitive actions need authorization and approval where applicable.
- No localhost URLs, demo credentials, or placeholder contacts in production config.
- Secret material must not be committed.
- Cross-tenant leakage is a critical defect.

## Open security decisions

- MFA enforcement for privileged staff is documented in architecture but must remain verified against implementation and rollout evidence.
- Alerting, monitoring, and incident ownership still need operational confirmation.

