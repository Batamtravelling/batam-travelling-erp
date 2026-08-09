# Engineering Bootstrap and Repository Standards

## Before application code

- Approve Document 32 ADRs.
- Initialise version control, protected main branch, pull-request review, and issue tracker.
- Add CI for formatting, linting, type validation, tests, dependency/security scan, and migration validation.
- Configure development/staging/production plus managed secrets.
- Create `openapi.yaml` from Document 35 and migrations from Documents 14/36.

## Standards

One focused change per branch; no direct production edits. Pull requests describe requirement, data/API/security impact, tests, migration/rollback, and user-visible change. Exclude local environment files, secrets, build output, and temporary artefacts from source control.

Implementation is done only when requirements/acceptance pass; authorization and tenant scope are verified; migrations/API contract/tests/telemetry/docs are updated; rollback is understood; and review is approved.
