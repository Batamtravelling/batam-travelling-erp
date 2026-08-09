# Source Inventory

**Updated:** 2026-08-09  
**Purpose:** track recovered project documentation and any remaining gaps.

## Recovered material

The project now contains recovered Markdown source documents, one preserved content variant, and one Word export directly in the project root.

| Area | Recovered documents |
|---|---|
| Project direction | `PROJECT_INSTRUCTIONS.md`, `README.md`, `CLAUDE.md` |
| Business foundation | 01-08 |
| Product and engineering | 09-25 |
| Platform and operations | 26-30 |
| Development execution | 31-42 |
| Variant | a distinct Document 09 UI/UX + website-content version |
| Export | Document 26 in DOCX format |

## Numbering gaps

Documents 07 and 25 were recovered and added to `docs/` on 2026-08-09. The recovered 01–42 sequence now has no numbering gap.

## Duplicate handling

The following were byte-for-byte duplicates and were removed during the 2026-08-09 cleanup:

- one duplicate of Document 18, retaining `18_PERFORMANCE_SCALABILITY_AND_CAPACITY_SPECIFICATION.md`;
- two duplicates of Document 19, retaining `19_REPORTING_ANALYTICS_AND_DASHBOARD_SPECIFICATION.md`.

The separate Document 09 variant was retained because its content and title differ. The DOCX version of Document 26 was retained as an export format rather than treated as a duplicate of the Markdown source.

## Structure rules

- Canonical numbered specifications are stored in `docs/`; root-level files are project-entry, guidance, and inventory documents.
- Canonical specifications use a numbered filename.
- The Document 09 variant is explicitly suffixed with `_VARIANT`.
- The Word export uses the same numbered filename as its Markdown source, with a `.docx` extension.
- `BATAM_TRAVELLING_ERP_KNOWLEDGE.md` and `SOURCE_INVENTORY.md` are cross-document guidance files.
- Documents 31-42 are the implementation planning and delivery baseline added on 2026-08-09.

## Current organisation

On 2026-08-09, all recovered numbered Markdown specifications were moved to `docs/` without content changes. `BUILD_START_HERE.md` was added at the project root as a build handoff and links to the implementation-critical documents.

The root-level file `BATAM TRAVELLING ERP (1).md` is retained unmodified because it was supplied by the user, but it is byte-identical to canonical Document 26 and is not a separate specification.
