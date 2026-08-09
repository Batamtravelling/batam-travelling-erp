# BATAM TRAVELLING ERP
# SEO, CONTENT MARKETING AND PUBLIC WEBSITE SPECIFICATION

**Document Number:** 31  
**Status:** IMPLEMENTATION BASELINE

## Objective

Build a fast, crawlable public website that converts visitors into qualified leads, quotation requests, and bookings without exposing internal ERP data.

## Public routes

| Route | Purpose | Primary CTA |
|---|---|---|
| `/` | Brand and destination landing page | Explore packages / chat |
| `/packages` | Searchable package catalogue | View package |
| `/packages/{slug}` | Package, itinerary, price guidance | Request quotation / book |
| `/destinations/{slug}` | Destination discovery | View related packages |
| `/articles/{slug}` | Editorial content | View related package |
| `/contact` | Contact and lead capture | Submit enquiry |

## SEO and content rules

- Public pages must be server-rendered or statically generated; ERP, preview, search-result, and customer-private pages must not be indexed.
- Every published page requires a unique title, meta description, canonical URL, Open Graph image, and appropriate structured data.
- Generate `sitemap.xml` and `robots.txt`; preserve a redirect registry for changed slugs.
- Use locale URLs and `hreflang` only once Indonesian and English content both exist.
- Article-to-package links are editorial references; package price and availability remain authoritative in the ERP.
- Lead forms capture source/campaign, consent state, and a duplicate-safe correlation ID.

## Workflow and acceptance

`DRAFT -> REVIEW -> APPROVED -> SCHEDULED -> PUBLISHED -> ARCHIVED`

Published content requires title, slug, locale, owner, summary, body, feature image, SEO fields, and publish date. Validate that unpublished content is neither cached nor indexed, and that core mobile/accessibility/performance journeys pass.
