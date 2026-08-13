# Public website before/after audit

Preview: `http://localhost:3002` with `NEXT_PUBLIC_PUBLIC_DEMO_MODE=true` in development only. Production builds never activate demo data.

## Before

The previous screenshots remain in [`screenshots/`](screenshots/). Relevant examples:

- [Homepage desktop](screenshots/home--1440.png)
- [Promo desktop](screenshots/promotions--1440.png)
- [Tickets desktop](screenshots/tickets--1440.png)
- [Transportation desktop](screenshots/transportation--1440.png)
- [Articles desktop](screenshots/articles--1440.png)

## After

Every row links to a populated desktop and mobile capture.

| Route | Desktop | Mobile | Result |
| --- | --- | --- | --- |
| `/` | [1440](public-after/home--1440.png) | [390](public-after/home--390.png) | Populated demo catalogue |
| `/trips` | [1440](public-after/trips--1440.png) | [390](public-after/trips--390.png) | 6 public packages |
| `/trips/trip-singapore-family` | [1440](public-after/trips--trip-singapore-family--1440.png) | [390](public-after/trips--trip-singapore-family--390.png) | Valid Open Trip detail |
| `/tickets` | [1440](public-after/tickets--1440.png) | [390](public-after/tickets--390.png) | Public ticket catalogue |
| `/transportation` | [1440](public-after/transportation--1440.png) | [390](public-after/transportation--390.png) | Public transport catalogue |
| `/promotions` | [1440](public-after/promotions--1440.png) | [390](public-after/promotions--390.png) | 2 promotions |
| `/articles` | [1440](public-after/articles--1440.png) | [390](public-after/articles--390.png) | 2 articles |
| `/articles/panduan-liburan-singapore-dari-batam` | [1440](public-after/articles--panduan-liburan-singapore-dari-batam--1440.png) | [390](public-after/articles--panduan-liburan-singapore-dari-batam--390.png) | Valid article detail |
| `/contact` | [1440](public-after/contact--1440.png) | [390](public-after/contact--390.png) | Populated local profile |
| `/terms` | [1440](public-after/terms--1440.png) | [390](public-after/terms--390.png) | Populated policy content |
| `/sign-in` | [1440](public-after/sign-in--1440.png) | [390](public-after/sign-in--390.png) | Distinct customer sign-in preview |
| `/sign-up` | [1440](public-after/sign-up--1440.png) | [390](public-after/sign-up--390.png) | Distinct customer registration preview |
| `/account` | [1440](public-after/account--1440.png) | [390](public-after/account--390.png) | Customer account entry |
| `/my-trip` | [1440](public-after/my-trip--1440.png) | [390](public-after/my-trip--390.png) | Booking verification portal |
| `/erp-sign-in` | [1440](public-after/erp-sign-in--1440.png) | [390](public-after/erp-sign-in--390.png) | Employee-only sign-in |

## Automated evidence

- 15 routes × 6 breakpoints = 90 responsive checks.
- Breakpoints: 1440, 1280, 1024, 768, 390, and 360 px.
- Horizontal-overflow failures: 0.
- Public routes rendered with ERP shell: 0.
- Browser console errors/warnings on sampled flows: 0.
- Loading, empty, error, unauthorized, not-found, and populated states were verified on `/trips` using development-only state controls.

Customer account authentication now uses the local-only passwordless OTP provider during development/test. The production Supabase provider remains fail-closed until configured; there is no silent mock fallback. `/my-trip` reads the secure HTTP-only customer session and tenant-scoped booking links.
