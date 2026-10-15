# Phase 5 Baseline UI/UX & Technical Audit

**Project:** MawaqetSalat.com WordPress-to-Next.js Migration  
**Date:** October 15, 2026  
**Auditor:** Principal Software Architect, Senior Technical SEO Specialist & Frontend Lead  
**Working Directory:** `C:\Users\HP\.gemini\antigravity\scratch\mawaqetsalat`  
**Status:** Baseline Established — Ready for Phase 5 UI/UX Enhancements  

---

## 1. Executive Summary

Prior to making any design or front-end modifications in Phase 5, this baseline audit inspects all active components, design tokens, route behaviors, test suites, and framework artifacts.

### Key Baseline Findings:
1. **Framework & Design Stack:** Next.js 15.5.27 (App Router), React 19, Tailwind CSS v4 (`@import "tailwindcss"`), with Google Font `Tajawal` (weights 300, 400, 500, 700, 800) in Arabic RTL layout.
2. **Quality Gates Baseline (100% Green):**
   - `npm test`: 132 passed / 132 tests across 11 test suites (Duration: ~950ms).
   - `npm run typecheck`: 0 errors (`tsc --noEmit`).
   - `npm run lint`: 0 warnings, 0 errors (`next lint`).
   - `npm run build`: 377 static pages successfully generated.
3. **The Black Circular "N" Badge Source:**
   - **Identity:** The black circular icon with white letter "N" appearing at the bottom of screens during browser preview is the official **Next.js Development Indicator** (`devIndicators` in Next.js 15).
   - **Verification:** It is injected exclusively during `next dev` by the Next.js runtime client to indicate static/server-rendered activity and build status.
   - **Production Status:** It is automatically stripped from production builds (`npm run build` & `next start`) and is **never served to end users or search engine crawlers**. It must NOT be hidden or tampered with using destructive CSS hacks.
4. **Current Route Inventory & SEO Protection:**
   - Total Published Legacy URLs: 372.
   - Preserved 200 OK routes: 371 (1 homepage, 328 cities, 38 countries, 4 static pages).
   - Permanent 301 redirects: 1 (`/sample-page/` $\to$ `/`).
   - Sitemaps: Exactly 370 canonical indexable URLs.

---

## 2. Component & Architecture Inventory

| Component Path | Type | Responsibility & Current State | Enhancement Opportunity in Phase 5 |
| :--- | :---: | :--- | :--- |
| `src/components/layout/Header.tsx` | Client | Site logo, title, desktop links (Home, Ramadan, Developers), mobile hamburger menu. | Improve spacing, touch target accessibility, mobile drawer UX, and keyboard focus outlines. |
| `src/components/layout/Footer.tsx` | Server | Copyright, disclaimer, quick links to countries and legal pages. | Add clear contrast, refine typography, ensure accessible touch targets on mobile. |
| `src/components/search/CitySearch.tsx` | Client | Debounced instant search against `/api/search/?q=`, Arabic normalization, keyboard navigation. | Add "استخدم موقعي" (Use My Location) geolocation trigger button with explicit consent and distance matching. |
| `src/app/page.tsx` | Server | Hero section, search input container, featured countries (8), top cities (12), informational summary. | Modernize card layouts, improve contrast, tighten hero section, add subtle elevation and touch-friendly borders. |
| `src/app/city/[slug]/page.tsx` | Server (SSG) | Canonical city landing page, pre-renders prayer times, breadcrumb schema, sister cities, legacy WP editorial text. | Elevate first-viewport hierarchy: city title, current/next prayer callout, quick jump to monthly timetable. |
| `src/components/prayer/CityPrayerInteractive.tsx` | Client | Coordinates daily table, monthly table, countdown, and prayer controls with hydration safety. | Improve layout spacing, polish countdown visualization, make monthly table navigation sticky and intuitive. |
| `src/components/prayer/PrayerTimesTable.tsx` | Server/Client | Table displaying the 6 daily times (Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha). | Highlight the next prayer with high-contrast text and badge (not color alone), optimize mobile column padding. |
| `src/components/prayer/NextPrayerCountdown.tsx` | Client | Real-time countdown ticker to the next upcoming prayer. | Refine typography, tabular numbers, and add accessible time indicators. |
| `src/components/prayer/PrayerControls.tsx` | Client | Dropdown for 12 calculation methods, Asr Madhab toggle (Standard vs Hanafi), Iraq/Syria context card. | Improve visual clarity, microcopy, and toggle accessibility for screen readers. |
| `src/components/prayer/MonthlyTimetable.tsx` | Client | 30-day monthly prayer schedule with month selector and sticky day column. | Ensure horizontal scroll container does not cause page-wide overflow; polish sticky day column shadow. |
| `src/components/prayer/IqamahDisclaimer.tsx` | Server | Prominent callout distinguishing calculated astronomical adhan times from mosque iqamah schedules. | Ensure clear visual contrast, accessible warning icon, and unambiguous wording. |
| `src/app/country/[slug]/page.tsx` | Server (SSG) | Canonical country landing page, country flag, calculation method notice, cities grid. | Improve city search filter, polish flag aspect ratios, ensure grid readability on 320px–390px screens. |
| `src/components/country/CountryCitiesList.tsx` | Client | Instant search and filter for city cards within the country page. | Add clear count badge, instant reset button, accessible live-region status. |
| `src/app/imsakia-ramadan/page.tsx` | Server | Ramadan timetable tool and general explanation. | Maintain clean card design and accessibility. |
| `src/app/developers/page.tsx` | Server | Developer API and embed widget documentation. | Maintain clean code block readability. |
| `src/app/embd/page.tsx` | Server | Iframe embed widget for external website owners (`noindex`, disallowed in `robots.txt`). | Preserve lightweight layout. |
| `src/app/privacy-policy/page.tsx` | Server | Privacy policy (mapped via rewrite from `/%D8%B3%D9%8A%D8%A7%D8%B3%D8%A9-%D8%A7%D9%84%D8%AE%D8%B5%D9%88%D8%B5%D9%8A%D8%A9/`). | High readability, clean headings. |

---

## 3. Design System & Design Tokens Baseline

- **Color Palette:**
  - Primary Brand: Teal (`teal-700` `#0f766e`, `teal-600` `#0d9488`, `teal-800` `#115e59`).
  - Neutral Backgrounds: Off-white (`gray-50` `#f8fafc`, `white` `#ffffff`, subtle tint `teal-50/60`).
  - Text & Contrast: High-contrast slate/gray (`gray-900` `#0f172a`, `gray-800` `#1e293b`, `gray-600` `#475569`).
  - Accents: Amber/Gold for user preferences (`amber-100` / `amber-800`), Emerald for verified levels (`emerald-100` / `emerald-800`).
- **Typography:**
  - Font Family: `Tajawal` loaded via `next/font/google` (`subsets: ['arabic', 'latin']`).
  - Fallbacks: `'IBM Plex Sans Arabic', 'Cairo', Arial, sans-serif`.
  - Line Height: 1.8 for body prose, 1.4 for headings, tabular numerals (`font-feature-settings: "tnum"`) for timings.
- **Breakpoints Tested:**
  - 320px (Small phone: iPhone SE).
  - 375px (Compact phone: iPhone 13 mini).
  - 390px (Standard mobile: iPhone 14/15/16).
  - 768px (Tablet portrait: iPad).
  - 1024px (Tablet landscape / Small laptop).
  - 1440px (Desktop wide).

---

## 4. Framework Artifact Analysis: The Circular "N" Badge

- **Observation:** In development screenshots, a black circular badge with a white stylized "N" appears at the bottom edge of the browser viewport.
- **Root Cause Identification:**
  - This is the **Next.js 15 Dev Indicator** (formerly build activity indicator).
  - Configuration: Built into Next.js core. Enabled automatically in development mode (`NODE_ENV=development` / `next dev`).
  - Behavior: Shows when pages are compiling, static route generation state, and developer error overlay shortcuts.
- **Verification:**
  - It is **not** an application component, nor does it exist in `src/components/`.
  - In production (`npm run build` followed by `next start`), Next.js completely strips the dev overlay and indicator scripts.
  - **Verdict:** Do NOT add brittle CSS hacks to suppress framework tools. Confirm that production outputs are free of the badge.

---

## 5. Existing Tests Baseline

Executed command: `npm test` (vitest run)  
Output recorded:
```text
 ✓ tests/url-manifest.test.ts (7 tests)
 ✓ tests/design-system.test.ts (7 tests)
 ✓ tests/domain-types.test.ts (5 tests)
 ✓ tests/geodata-enrichment.test.ts (8 tests)
 ✓ tests/comparison-fixtures.test.ts (5 tests)
 ✓ tests/search-api.test.ts (10 tests)
 ✓ tests/phase3-routes.test.ts (54 tests)
 ✓ tests/prayer-controls.test.ts (8 tests)
 ✓ tests/city-search-interaction.test.ts (11 tests)
 ✓ tests/prayer-service.test.ts (5 tests)
 ✓ tests/pre-launch-audit.test.ts (12 tests)

 Test Files  11 passed (11)
      Tests  132 passed (132) — 0 failed
   Duration  968ms
```

- Typecheck: `tsc --noEmit` exited with code 0.
- Lint: `next lint` exited with code 0 (zero warnings, zero errors).
- Build: `next build` compiled 377 static pages in 4.4 seconds.

---

## 6. Pre-Improvement SEO & Route Status

- **Status:** All 372 published legacy URLs are strictly accounted for (371 exact 200 OK + 1 redirect 301).
- **Canonicals:** Self-referential with trailing slashes across all 328 cities and 38 countries.
- **Sitemap:** 370 canonical URLs.
- **Robots.txt:** Explicitly allows `/` and disallows `/api/` and `/embd/`.

All improvements in Phase 5 will be built strictly on top of these verified foundations without regressions.
