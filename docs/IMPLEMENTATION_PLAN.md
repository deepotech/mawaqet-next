# Implementation Plan: MawaqetSalat.com WordPress-to-Next.js Migration

**Date:** October 15, 2026  
**Status:** Approved Roadmap (Phase 1)  
**Project Lead:** Full-Stack & Technical SEO Architect

---

## 1. Phased Migration Roadmap

```mermaid
flowchart LR
    P0["Phase 0: Environment & Source Audit"] --> P1["Phase 1: Architecture & SEO Specs"]
    P1 --> P2["Phase 2: Next.js Foundation & UI"]
    P2 --> P3["Phase 3: Prayer Engine & Seed Data"]
    P3 --> P4["Phase 4: City Pages & Homepage"]
    P4 --> P5["Phase 5: SEO, Redirects & Sitemaps"]
    P5 --> P6["Phase 6: Testing & Performance Audit"]
    P6 --> P7["Phase 7: Staging & Deployment Plan"]
```

---

## 2. Phase-by-Phase Execution Details

### Phase 0 — Environment and Source Audit (COMPLETED)
- [x] Scan workspace and uncover source materials (`.wpress` backup, GSC performance export).
- [x] Extract and audit WordPress custom theme `deepotechprayertimes`.
- [x] Extract and audit full WordPress database `database.sql` (328 cities, 38 countries, custom fields).
- [x] Verify historical Google Search Console metrics (9,262 clicks, 6.57M impressions, 94.6% mobile).
- [x] Flag and isolate unrelated files (`lwatta.com` database).
- [x] Publish `docs/LEGACY_AUDIT.md`.

### Phase 1 — Architecture, SEO Inventory, and Migration Specification (COMPLETED)
- [x] Produce `docs/SEO_MIGRATION_MAP.md` covering all 372 URLs and 301 alias mappings.
- [x] Produce `docs/ARCHITECTURE.md` specifying Next.js App Router, Drizzle ORM, PostgreSQL, and hybrid prayer engine.
- [x] Produce `docs/IMPLEMENTATION_PLAN.md`.

### Phase 2 — Application Foundation and Design System
- [ ] Initialize Next.js 15+ App Router application with TypeScript (strict mode) and Tailwind CSS.
- [ ] Set up project structure: `app/`, `components/`, `lib/`, `types/`, `data/`, `tests/`.
- [ ] Configure RTL layout support (`dir="rtl"`) with Cairo and Amiri Arabic typography.
- [ ] Create base UI component library:
  - Header & responsive mobile drawer navigation.
  - Footer with privacy policy and developer links.
  - Islamic icon set using SVG (replacing 5.6 MB icofont).
  - Countdown card with high contrast next-prayer indicator.
  - Timetable component with responsive tabular layout.
- [ ] Configure ESLint, Prettier, and TypeScript compiler settings.

### Phase 3 — Prayer-Time Engine and City/Country Data
- [ ] Implement core astronomical prayer calculation engine (`lib/prayer/calculator.ts`).
- [ ] Integrate national authority calculation profiles:
  - Habous (Morocco - Method 15)
  - Umm Al-Qura (Saudi Arabia - Method 4)
  - Egyptian General Authority (Egypt - Method 3)
  - Kuwait (Method 9) & Qatar (Method 10)
  - Muslim World League & Gulf defaults (Method 8/1)
- [ ] Build seed data generator: Convert all 328 cities and 38 countries from `database.sql` into structured, typed data with accurate coordinates and timezones.
- [ ] Write comprehensive Vitest unit tests for:
  - Exact time conversions across timezones.
  - Calculation method selection per country.
  - Date boundary edge cases (leap years, month transitions).
  - Fallback and error handling for invalid coordinates.

### Phase 4 — Homepage and City Pages
- [ ] **Homepage (`app/page.tsx`):**
  - Instant city search autocomplete (Arabic & English matching).
  - Geolocation detection with transparent consent modal (zero third-party leak).
  - Today's prayer timetable for user's detected/default city.
  - Next prayer live countdown.
  - Curated grid of 38 countries with localized flag badges.
  - Quick links to major Islamic capitals (Baghdad, Casablanca, Riyadh, Cairo, Erbil).
- [ ] **City Prayer-Time Page (`app/city/[slug]/page.tsx`):**
  - Dynamic route matching legacy slugs with 100% parity.
  - Server-Side Rendered daily schedule (Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha).
  - Server-Side Rendered 30-day monthly prayer calendar with current day highlighted.
  - Hijri and Gregorian dates.
  - Calculation method transparency note.
  - Related cities within the same country and cross-links to sibling nations.
- [ ] **Country Landing Page (`app/country/[slug]/page.tsx`):**
  - Lists all cities within the country with direct internal links.
- [ ] **Seasonal & Utility Pages:**
  - Ramadan Imsakia (`app/imsakia-ramadan/page.tsx`).
  - Developers Widget & Embed API (`app/developers/page.tsx` & `app/embd/page.tsx`).
  - Privacy Policy (`app/[...privacy]/page.tsx`).

### Phase 5 — SEO Migration, Metadata, Redirects, and Sitemap
- [ ] Implement `next.config.ts` with `trailingSlash: true` and edge redirect rules.
- [ ] Implement 301 redirects for legacy typos:
  - `/country/rayer-times-in-india/` -> `/country/prayer-times-in-india/`
  - `/country/prayer-times-in-eqypt/` -> `/country/prayer-times-in-egypt/`
  - `/country/prayer-times-in-united_arab_emirates/` -> `/country/prayer-times-in-united-arab-emirates/`
- [ ] Implement dynamic OpenGraph, Twitter cards, and unique title/meta descriptions via Next.js `generateMetadata`.
- [ ] Implement Schema.org JSON-LD structured data (`WebSite`, `BreadcrumbList`).
- [ ] Implement dynamic XML Sitemaps (`app/sitemap.ts`) generating `sitemap.xml`, `country-sitemap.xml`, and chunked `city-sitemap.xml`.
- [ ] Implement `app/robots.ts` blocking WordPress legacy paths and advertising the new sitemap.

### Phase 6 — Testing, Performance, Accessibility, and Security
- [ ] Run full test suite:
  - TypeScript strict check (`tsc --noEmit`).
  - ESLint verification.
  - Vitest unit & integration tests (>90% coverage on prayer engine & SEO mapper).
  - Playwright E2E tests for mobile search, geolocation refusal/acceptance, and countdown.
- [ ] Audit Core Web Vitals (LCP < 1.2s, CLS = 0, INP < 50ms).
- [ ] Accessibility audit (WCAG 2.1 AA contrast, keyboard navigation, screen reader labels).
- [ ] Security audit: Clean dependency review, CSP headers, XSS prevention, zero credential leakage.

### Phase 7 — Staging Validation & Production Migration Plan
- [ ] Generate production build (`npm run build`).
- [ ] Prepare deployment configuration (`.env.example`, deployment guides).
- [ ] Create DNS cutover checklist and Google Search Console post-migration monitoring plan.

---

## 3. Verification Gates & Success Criteria

No phase may be marked complete without passing these explicit gates:
1. `npm run typecheck`: 0 errors.
2. `npm run lint`: 0 errors.
3. `npm run test`: All unit/integration tests passing.
4. `npm run build`: Production build succeeds with 0 dynamic routing errors.
5. All 328 legacy city URLs and 38 country URLs verified against sitemap inventory.
