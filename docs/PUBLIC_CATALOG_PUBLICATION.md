# Public catalog publication contract

The public website is a projection of reviewed ERP content, not a direct view of ERP records.

## Package eligibility

A package is public only when it belongs to `PUBLIC_TENANT_SLUG`, has `status=ACTIVE`, `approvalStatus=APPROVED`, and is not archived. Editing an approved package or adding a departure invalidates approval and returns the package to draft. It must be submitted and approved again before it can reappear publicly.

Public package responses use an explicit allowlist. They exclude provider/cost/internal notes, exact reservation counts, staff data, audit fields, and storage URLs carrying signatures or tokens. Departure availability is exposed only as remaining seats. Legacy `notes` values are migrated to `internal_notes`; editors must intentionally populate `public_notes`.

## Promotions

Promotions follow `DRAFT -> PENDING_REVIEW -> APPROVED/PUBLISHED -> ARCHIVED`. Submission and approval are separate actions, and a submitter cannot approve their own promotion. Publishing requires at least one active, approved, non-archived package from the same tenant. Editing published content resets it to draft.

`content.manage` permits editing and submission. `content.approve` permits approval or rejection. The migration grants this approval capability only to tenant-scoped roles named exactly `Tenant Owner`; it does not broaden editor or global-role permissions.

## Tenant and relation safety

`ArticlePackage` and `PromotionPackage` carry `tenant_id` and use composite foreign keys to both parents. The migration stops if legacy cross-tenant links exist. Public article and promotion responses independently filter linked packages through the same package eligibility predicate.

## Production safeguards

There is no production demo fallback. Schema migration must be reviewed and applied through the normal release process; it must not be run ad hoc against Supabase production.
