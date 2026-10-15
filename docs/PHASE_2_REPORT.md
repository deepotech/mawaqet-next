# Phase 2 Report — Design System & Core UI Components

**Completed:** 2026-10-14  
**Status:** ✅ All quality checks passed

---

## Quality Gate Results

| Check | Result |
|---|---|
| `npm test` | ✅ **37/37** tests pass (6 suites — +7 new in Phase 2) |
| `npm run typecheck` | ✅ 0 errors |
| `npm run lint` | ✅ 0 warnings, 0 errors |
| `npm run build` | ✅ Production build successful |

Build output:
- Route `/` — 2.29 kB, 114 kB first load JS
- Fully statically prerendered (○) — optimal for SEO

---

## Files Created / Modified

### New Files

| File | Purpose |
|---|---|
| `src/lib/design-tokens.ts` | Single source of truth for colors, typography, prayer labels |
| `src/components/layout/Header.tsx` | Teal-700 header, logo, desktop nav, accessible mobile hamburger |
| `src/components/layout/Footer.tsx` | Copyright, privacy link, Facebook/Twitter/Instagram icons |
| `src/components/ads/AdContainer.tsx` | 4-slot AdSense wrapper (renders nothing when env var absent) |
| `src/components/prayer/PrayerTimesTable.tsx` | Accessible prayer table, current/next row highlighting |
| `src/components/prayer/NextPrayerCountdown.tsx` | Client countdown with hydration-safe mounted guard |
| `src/components/prayer/MonthlyTimetable.tsx` | Horizontally scrollable monthly table, sticky day column |
| `src/components/search/CitySearch.tsx` | Debounced city search, ARIA combobox, keyboard navigation |
| `tests/design-system.test.ts` | 7 structural tests for design tokens |

### Modified Files

| File | Changes |
|---|---|
| `src/app/layout.tsx` | next/font/google Tajawal, Header, Footer, GA4, AdSense, skip-to-content |
| `src/app/globals.css` | Arabic line-height, tabular nums, custom scrollbar, focus ring, ad CLS guard |
| `src/app/page.tsx` | Full homepage: hero + search, countries grid, cities grid, info section, 4 ads |
| `.env.example` | Added 4 new NEXT_PUBLIC_AD_SLOT_* variables |

---

## Key Design Decisions

### Font: next/font/google (Tajawal)
- Uses next/font/google, not raw link tags, for automatic font subsetting, zero FOUT
- Subsets: arabic + latin. Weights: 300/400/500/700/800
- CSS variable --font-tajawal injected on html, consumed by --font-arabic in globals.css

### Homepage: Static Prerendering
- page.tsx is a Server Component — Next.js renders it as fully static
- City/country arrays are currently hardcoded constants → replaced by DB queries in Phase 3
- All 4 ad placements included but render null in dev (no env var set)

### AdContainer: Lazy & Conditional
- NEXT_PUBLIC_ADSENSE_CLIENT_ID must be set for ads to appear
- strategy="afterInteractive" — AdSense script does NOT block LCP
- Next.js deduplicates Script src=adsbygoogle.js automatically

### NextPrayerCountdown: Hydration Safety
- Initial render returns a skeleton via mounted === false
- useEffect sets mounted=true after first paint, then starts 1-second interval
- Prevents SSR/client mismatch hydration error
- aria-live="off" prevents screen readers from announcing every second tick

### MonthlyTimetable: Mobile-First Scrolling
- overflow-x-auto wrapper + sticky right-0 first column (RTL)
- Today's row uses aria-current="date"

### CitySearch: ARIA Combobox Pattern
- Implements role="combobox" + role="listbox" + role="option"
- aria-activedescendant tracks keyboard selection
- Calls /api/search?q=... — endpoint to be implemented in Phase 3

---

## Deferred to Phase 3

| Item | Reason |
|---|---|
| City page /city/[slug]/ | Phase 3 |
| Country page /country/[slug]/ | Phase 3 |
| /api/search endpoint | Phase 3 |
| Sitemap / robots.txt | Phase 3 |
| Redirect middleware | Phase 3 |
| Hijri date calculation | Phase 3 |
| Playwright E2E tests | Phase 6 |

---

## Open Decision for Phase 3

Iraq/Syria calculation method: Legacy used Method 8 (Gulf/Dubai, 19.5°, 90min isha) as default for all unspecified countries including Iraq and Syria. Confirm before Phase 3 city pages go live whether to keep this or switch Iraq to MWL (18°/17°). Documented in docs/PRAYER_ENGINE_DECISIONS.md.
