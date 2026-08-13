# Batam Travelling UI Structure and Color Audit

**Status:** OWNER APPROVED  
**Approved:** 2026-08-13  
**Scope:** Color foundation and visual hierarchy only

## Approved references

Only these Owner-provided references were sampled:

1. `Gemini_Generated_Image_jqs8ncjqs8ncjqs8.png`
2. `Gemini_Generated_Image_o7b67go7b67go7b6 (1).png`

`Batam Travelling website and ERP dashboard(1).png` is explicitly excluded. It must not influence design, color, layout, structure, or UI decisions.

The references inform hierarchy, color composition, information density, and responsive behavior only. Aether branding, assets, copy, data, icons, and module structure must not be copied.

## Sampling result

Sampling was limited to interface regions and excluded the photographic background. Anti-aliasing, lighting, and image generation create color ranges rather than exact source tokens.

| Role | Dominant sampled range | Approved token |
| --- | --- | --- |
| Primary navy | `#082048`-`#0D2550` | `#082653` |
| Strong navy | `#001840`-`#061A38` | `#061A38` |
| Interactive navy | `#102850`-`#183858` | `#123B70` |
| Brand yellow | `#F8B818`-`#F8C020` | `#FFBF18` |
| Application background | `#F0F1F5`-`#F6F7FB` | `#F4F7FB` |
| Primary surface | `#FFFFFF`-`#F8F8F8` | `#FFFFFF` |

## Final palette

| Semantic token | Value | Intended use |
| --- | --- | --- |
| `brand-navy-primary` | `#082653` | Sidebar, primary charts, strong brand surfaces |
| `brand-navy-strong` | `#061A38` | Strong headers and dark foreground on yellow |
| `brand-navy-hover` | `#123B70` | Navy hover and active surfaces |
| `brand-yellow-primary` | `#FFBF18` | Primary CTA, active indicator, important highlight |
| `brand-yellow-hover` | `#E5A800` | Yellow interaction state |
| `app-background` | `#F4F7FB` | Application canvas |
| `surface-primary` | `#FFFFFF` | Cards, tables, forms, and content surfaces |
| `text-primary` | `#102747` | Headings and body text |
| `text-secondary` | `#667085` | Supporting text and metadata |
| `border-default` | `#DCE3EC` | Borders and dividers only |

## WCAG contrast verification

| Pair | Ratio | Result |
| --- | ---: | --- |
| White on primary navy | 14.87:1 | AAA |
| White on strong navy | 17.32:1 | AAA |
| White on hover navy | 11.14:1 | AAA |
| Primary text on yellow | 9.06:1 | AAA |
| Strong navy on yellow | 10.49:1 | AAA |
| White on yellow | 1.65:1 | Fail; prohibited |
| Secondary text on white | 4.97:1 | AA |
| Secondary text on application background | 4.63:1 | AA |

`border-default` has insufficient contrast for text and must remain a non-text boundary color.

## Usage rules

- Use dark navy text on yellow CTA surfaces; never use white text on bright yellow.
- Yellow is an accent and must not become the dominant page background.
- Preserve green, red, orange, and informational blue as semantic status colors.
- Do not communicate business status through color alone.
- Prefer light borders and restrained shadows. Avoid glow and heavy gradients.
- Desktop data structures must be deliberately adapted for mobile rather than merely scaled down.
- Consolidate hard-coded colors incrementally; do not perform an uncontrolled global replacement.

## Repository audit summary

The existing UI already contains useful navy, yellow, white, blue-gray, moderate radius, and light-border patterns. The primary gap is fragmented hard-coded color usage across module styles. The global shell previously used legacy aliases and referenced undefined `--brand-*` custom properties. The approved foundation defines those properties while retaining legacy aliases for incremental compatibility.

This approval does not mark any page or business feature complete and does not authorize a full redesign.

## P0 public-shell recovery

The public navigation regression was confirmed on `main` at `e9d94f31868e47d4cf942ac6658005fc35b31721`. `AppShell` rendered `websiteNav`, `websiteLinks`, `tripNavMenu`, and `accountMenu`, but the repository contained no desktop selectors for those classes. The broad global `nav { display: grid }` rule therefore became the computed layout.

Evidence before recovery: `.websiteNav` computed to `display: grid`, `height: 169.5px`, transparent background, and zero padding; `.websiteLinks` computed to `display: block`. The branch did not change the public markup or remove an import before this finding.

The P0 recovery adds an explicitly imported `public-shell.css` containing scoped public navigation and baseline hero overrides. After recovery, `.websiteNav` computes to `display: flex`, `height: 72px`, white background, and responsive horizontal padding; `.websiteLinks` computes to `display: flex`. Browser console inspection was clean and the desktop document had no horizontal overflow.

The public mobile navigation still lacks the approved hamburger/drawer interaction. This remains P1 and is intentionally not hidden by granting new behavior during the P0-only recovery.
