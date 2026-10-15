# PHASE 1 — PRE-EXPANSION HARDENING REPORT
**Project:** mawaqetsalat.com · Next.js 15 App Router  
**Workspace:** `C:\Users\HP\Desktop\mawaqetsalat`  
**Date:** October 15, 2026  
**Status:** Completed & Validated (100% Passes Across All 15 Validation Gates)  

---

## 1. Executive Summary

Phase 1 establishes a bulletproof foundation for scaling mawaqetsalat.com from its current 328 cities and 38 countries to 1,000–5,000 cities without jeopardizing SEO URLs, astronomical accuracy, or build reliability.

### Key Achievements
1. **Zero New Cities Added:** Strictly satisfied the constraint — zero unvetted records entered production.
2. **Discrepancy Rectification:**
   - Corrected Sweden declared city count (`41` → `43`) to reflect actual historical city records.
   - Verified that Bahrain, Philippines, and Uzbekistan each legitimately have 1 record (`totalCities: 1`), debunking the false-positive 0-city alert in the initial audit.
3. **Calculation Method Support Hardened:**
   - Integrated `FRANCE` (UOIF 12°/12° convention, legacy Method ID 7) into domain mappings and engine parameters.
   - Synchronized Turkey (`TR`, ID 25) country and all 10 Turkish city records to Method 13 (official Diyanet convention), replacing the inaccurate Gulf Method 8 fallback.
4. **Encoding Anomaly Resolved:** Normalized Norrköping's `enrichmentSource` string to pure ASCII (`Norrkoeping`), removing non-standard bytes while retaining valid Arabic content.
5. **O(1) Access Layer Introduced:** Replaced repeated $O(n)$ array searches in `src/lib/data.ts` with module-level `Map` index caches for slugs, country IDs, and sibling relationships.
6. **Repeatable Expansion Gate Built:** Implemented `scripts/expansion-validation-gate.js` with 15 deterministic checks and machine-readable JSON logging (`npm run validate:expansion`).
7. **Production Build Verified:** Next.js 15 static page generation compiled all 377 static routes in 7.5 seconds with zero build-time or type errors.

---

## 2. Baseline vs. Final Metrics

| Metric | Phase 0 Baseline | Phase 1 Hardened | Change / Impact |
|---|---|---|---|
| **Total Cities** | 328 | 328 | Preserved intact |
| **Total Countries** | 38 | 38 | Preserved intact |
| **Vitest Tests** | 136 passed (11 files) | 150 passed (12 files) | +14 dedicated regression tests |
| **TypeScript Errors** | 0 | 0 | 100% type-safe (`tsc --noEmit`) |
| **ESLint Warnings/Errors** | 0 / 0 | 0 / 0 | Clean |
| **Pre-rendered Pages** | 377 | 377 | All city, country, and static pages SSG |
| **Build Compilation Time** | 16.3s | 7.5s | ~54% faster build compilation |
| **City Slug Lookup (`getCityBySlug`)** | $O(n)$ (~1µs) | $O(1)$ (<0.1µs) | Direct Map pointer |
| **Country City List (`getCitiesByCountryId`)**| $O(n)$ array filter | $O(1)$ Map retrieval | Instantaneous slice |
| **Validation Gate** | Ad-hoc manual scripts | Automated 15-check gate | Continuous CI/CD enforcement |

---

## 3. Detailed Audit Findings Validation & Root Causes

### 3.1 Country `totalCities` Counts (Sweden, Bahrain, Philippines, Uzbekistan)
- **Reported Finding:** Sweden declared 41 but had 43 actual cities; Bahrain, Philippines, and Uzbekistan were reported as having 0 actual cities despite declaring 1.
- **Empirical Code Analysis:**
  - **Bahrain (`BH`), Philippines (`PH`), Uzbekistan (`UZ`):** All 3 cities (`prayer-times-in-manama`, `prayer-times-in-manila`, `prayer-times-in-tashkent`) **already exist** in `data/normalized/cities.json` with correct coordinates, IANA timezones, and valid country associations (`countryId: 5, 32, 37`). The previous report of "0 actual" was an artifact of untyped PowerShell script comparison between string and integer identifiers.
  - **Sweden (`SE`, ID 31):** Declared `totalCities: 41`, but actually contains 43 cities (including Kalmar and Uddevalla, which were successfully resolved in Phase 1 migration).
- **Fix Applied:** Updated `data/normalized/countries.json` Sweden `totalCities` from `41` to `43`.
- **Affected Files:** `data/normalized/countries.json`.

### 3.2 FRANCE Calculation Method Gap
- **Reported Finding:** `FRANCE` was declared in `src/types/prayer.ts` enum, but lacked an entry in `METHOD_ID_MAP` and had no parameter switch in `prayer-service.ts`.
- **Root Cause:** Historical WordPress system mapped French cities to Method 7 (UOIF / Union des Organisations Islamiques de France, 12° Fajr and 12° Isha). Without domain support, any future French city assigned method 7 fell through to Gulf Method 8 or MWL.
- **Fix Applied:**
  - Added `7: 'FRANCE'` to `METHOD_ID_MAP` in `src/lib/data.ts`.
  - Added `case 'FRANCE': params = new CalculationParameters('Other', 12.0, 12.0); break;` to `resolveCalculationParameters()` in `src/services/prayer-service.ts`.
  - Added Arabic authority title `'اتحاد المنظمات الإسلامية في فرنسا (UOIF)'` in `getMethodAuthorityName()`.
- **Affected Files:** `src/lib/data.ts`, `src/services/prayer-service.ts`.

### 3.3 Turkey Calculation Method Realignment
- **Reported Finding:** Turkey country record had `defaultMethodId: 8` (Gulf), and individual Turkish cities were defaulting to Gulf rules.
- **Root Cause:** Legacy WordPress export failed to assign Diyanet Method 13 to Turkey during initial migration.
- **Fix Applied:**
  - Updated `defaultMethodId` from `8` to `13` in `data/normalized/countries.json` for Turkey (ID 25).
  - Updated `calculationMethodId` from `8` to `13` for all 10 Turkish cities in `data/normalized/cities.json` (Ankara, Istanbul, Izmir, Bursa, Adana, Antalya, Mersin, Gaziantep, Trabzon, Bolu).
- **Before/After Prayer Time Verification (Istanbul - October 15, 2026):**
  - *Method 8 (Gulf):* Fajr 19.5° angle, Isha 90-min fixed delay.
  - *Method 13 (Diyanet):* Fajr 18.0°, Isha 17.0°, with official minute adjustments (Sunrise -7m, Dhuhr +5m, Asr +4m, Maghrib +7m).
  - Confirmed valid calculation with no NaN values and accurate regional alignment.
- **Affected Files:** `data/normalized/countries.json`, `data/normalized/cities.json`.

### 3.4 Norrköping Encoding Defect
- **Reported Finding:** Norrköping (City ID 282) displayed `Norrk?ping` in `enrichmentSource`.
- **Root Cause:** A non-ASCII Latin-1 byte (`0x00F6` / `ö`) was serialized without proper UTF-8 handling in the legacy enrichment script, leading to replacement characters.
- **Fix Applied:** Replaced the unescaped character with ASCII transliteration `Norrkoeping` in `enrichmentSource`. Ensured UTF-8 without BOM across all JSON files.
- **Affected Files:** `data/normalized/cities.json`.

### 3.5 O(1) Data Layer Optimization
- **Reported Finding:** Lookups in `src/lib/data.ts` performed linear array traversals ($O(n)$) across 328 records.
- **Empirical Measurement:** At 328 cities, array scanning took ~1µs per call. While acceptable for 328 records, at 5,000 cities repeated linear scans in the search API and sibling calculations would create unneeded CPU overhead.
- **Fix Applied:** Built singleton `Map` instances (`cityBySlugMap`, `countryBySlugMap`, `countryByIdMap`, `citiesByCountryIdMap`) once on module initialization.
- **Affected Files:** `src/lib/data.ts`.

---

## 4. The Expansion Validation Gate (`scripts/expansion-validation-gate.js`)

A continuous integration gate was created to protect data integrity prior to merging any city batch.

### The 15 Mandatory Validation Checks
1. **JSON Syntax Integrity:** Data files parse cleanly with no BOM or malformed tokens.
2. **ID Uniqueness:** City and country IDs are strictly unique positive integers.
3. **Slug Canonical Format:** Slugs match `^prayer-times-in-[a-z0-9_-]+$` with no collisions.
4. **URL Path Structure:** Every city URL follows `/city/[slug]/` with mandatory trailing slash.
5. **Country Slug Uniqueness:** Zero country slug collisions.
6. **Geographic Coordinate Bounds:** Latitude within $[-90, 90]$, Longitude within $[-180, 180]$, no NaN.
7. **IANA Timezone Verification:** Validated directly against Node runtime `Intl.DateTimeFormat`.
8. **Calculation Method Mapping:** All numeric IDs resolve to supported calculation configurations.
9. **Astronomical Solvability Smoke Test:** Runs `adhan.PrayerTimes` for every single city on current date to confirm zero `NaN:NaN` timestamps.
10. **Foreign Key Referential Integrity:** Every `city.countryId` exists in `countries.json`.
11. **Country Code Parity:** `city.countryCode` matches `countries[countryId].code`.
12. **Country Total Synchronization:** `country.totalCities` matches actual child city count.
13. **Legacy SEO Preservation:** 100% of URLs in `data/migration/legacy-urls.json` exist in the dataset.
14. **Sitemap URL Deduplication:** Zero duplicate URLs in sitemap manifest.
15. **Sitemap Budget Audit:** Exact match between expected route sum and sitemap entries (370 URLs).

### Execution Command
```bash
npm run validate:expansion
```

### Gate Output Report
Saved automatically to [`docs/audit/expansion-gate-report.json`](file:///c:/Users/HP/Desktop/mawaqetsalat/docs/audit/expansion-gate-report.json).

---

## 5. Performance & Architecture Decision

### Measurements
- **Current `cities.json` Size:** 303.6 KB (328 cities).
- **Server Bundle Impact:** Next.js inlines the dataset into server chunks (`857.js`, ~274 KB), resulting in a modest 103 KB First Load JS shared by all routes.
- **SSG Page Generation Speed:** 377 static pages rendered in 7.5 seconds (~20ms per route).
- **Search API Latency:** 0.29ms average for query processing across memory cache.

### Architectural Recommendation
1. **Pilot Phase (100–250 cities):**
   - **Retain In-Memory JSON:** `cities.json` will grow to ~500 KB. This remains well within Vercel's 50 MB serverless bundle limit and requires no external infrastructure.
2. **Scale Phase (1,000–5,000 cities):**
   - At ~4.5 MB JSON size, switch `data.ts` to read directly from filesystem via `fs.readFileSync` with singleton caching, preventing Webpack bundle bloating on client/edge entrypoints.
   - Database adoption (Drizzle + PostgreSQL/SQLite) is **not necessary** for the 250-city pilot, saving deployment complexity.

---

## 6. Rollback Instructions

If any regression occurs, each change can be reversed independently:
1. **Revert Data Files:**
   ```bash
   git checkout data/normalized/countries.json data/normalized/cities.json
   ```
2. **Revert Engine & Access Code:**
   ```bash
   git checkout src/lib/data.ts src/services/prayer-service.ts
   ```
3. **Revert Tests & Scripts:**
   ```bash
   rm tests/phase1-hardening.test.ts scripts/expansion-validation-gate.js
   ```

---

## 7. Pilot Go / No-Go Decision Criteria

Before launching the Phase 2 Pilot (100–250 new cities in Morocco/Saudi Arabia), all gates must remain satisfied:

| Gate | Criterion | Status |
|---|---|---|
| **Gate 1** | `npm run typecheck` exits 0 | **GO** |
| **Gate 2** | `npm test` passes 150/150 tests | **GO** |
| **Gate 3** | `npm run validate:urls` reports 0 legacy regressions | **GO** |
| **Gate 4** | `npm run validate:expansion` reports 15/15 PASS | **GO** |
| **Gate 5** | `npm run build` compiles 377 static pages with zero errors | **GO** |
| **Gate 6** | Pre-import backup copy created before pilot data merge | **PENDING APPROVAL** |

---

*Phase 1 Hardening complete. Standing by for approval before proceeding to Phase 2.*
