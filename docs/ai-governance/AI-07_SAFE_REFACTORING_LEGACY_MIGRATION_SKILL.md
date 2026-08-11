# AI-07 — Safe Refactoring and Legacy Migration

## Rule

Characterize and refactor in place before rewriting. A rewrite requires explicit justification, migration plan, compatibility plan, validation, and approval.

## Sequence

1. Capture current behavior with tests or reproducible checks.
2. Identify consumers, routes, schemas, identifiers, permissions, and operational dependencies.
3. Introduce a stable seam/interface.
4. Move one coherent capability at a time.
5. Keep old contracts working during transition when practical.
6. Migrate callers and data with observability.
7. Remove obsolete paths only after proving they are unused and rollback is safe.

## Prohibited Bundling

Do not combine a business change with broad formatting, mass renaming, unrelated dependency upgrades, schema cleanup, or deletion of allegedly unused code. Preserve historical transaction identifiers and financial audit trails.

