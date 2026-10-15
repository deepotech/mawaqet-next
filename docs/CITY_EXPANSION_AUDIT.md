# CITY EXPANSION AUDIT — Phase 0
**mawaqetsalat.com · Next.js 15 App Router**
*Audit Date: 2026-10-15 · Status: Read-only inspection — no files modified*

---

## 1. Confirmed Workspace & Project Stack

| Item | Value |
|---|---|
| **Absolute workspace path** | `c:\Users\HP\Desktop\mawaqetsalat` |
| **Framework** | Next.js 15.2.0 (App Router) |
| **React version** | 19.0.0 |
| **Node requirement** | >= 20.0.0 |
| **Language** | TypeScript 5.7.3 |
| **Prayer engine** | `adhan` 4.4.6 (local, zero network calls) |
| **Validation** | `zod` 3.24.2 |
| **DB ORM (schema only)** | `drizzle-orm` 0.39.3 — schema defined in `src/db/schema.ts`; **not used at build time** |
| **Test runner** | Vitest 3.0.5 |
| **CSS** | Tailwind CSS 4.0 |
| **Rendering mode** | Fully static (SSG) via `generateStaticParams` |

> **Safety confirmation:** The workspace at `c:\Users\HP\Desktop\mawaqetsalat` is the only copy inspected. All findings derive from read-only file access. No data was deleted, renamed, overwritten, or migrated. No build was executed.

---

## 2. Dataset Locations & Record Counts

### Primary (Production) Data — Do Not Modify

| File | Records | Size | Last Modified |
|---|---|---|---|
| `data/normalized/cities.json` | **328 cities** | 303.6 KB | 2026-10-14 |
| `data/normalized/countries.json` | **38 countries** | 10.5 KB | 2026-10-14 |
| `data/normalized/enrichment-summary.json` | Summary | 0.6 KB | 2026-10-14 |
| `data/migration/legacy-urls.json` | **371 URL records** | 226.6 KB | 2026-10-14 |

### Legacy / Reference Data — Read-Only Archive

| File | Size | Purpose |
|---|---|---|
| `legacy-data/parsed_audit_data.json` | 534.7 KB | WordPress export (cities, countries, GSC stats) |
| `legacy-data/full_url_inventory.json` | 159.1 KB | Full legacy URL inventory |
| `legacy-data/gsc/Pages.csv` | 19.5 KB | Google Search Console page stats |
| `legacy-data/gsc/Requetes.csv` | 58.4 KB | GSC query data |
| `docs/extracted_wpress/database.sql` | 29,961 KB | Full WordPress MySQL dump |

### Audit Output (generated this session — read-only inventory)

| File | Records | Purpose |
|---|---|---|
| `docs/audit/city-inventory.json` | 328 | Machine-readable city inventory |
| `docs/audit/data-quality-report.json` | — | Measured data quality findings |

---

## 3. City Distribution by Country

| Country | Code | City Count | Default Method |
|---|---|---|---|
| Sweden | SE | 43 | 8 (Gulf) |
| Saudi Arabia | SA | 42 | 4 (Umm Al-Qura) |
| Morocco | MA | 30 | 15 (Morocco Habous) |
| Egypt | EG | 26 | 3 (Egyptian Survey) |
| Germany | DE | 23 | 8 (Gulf) |
| Oman | OM | 13 | 8 (Gulf) |
| Turkey | TR | 10 | 8 (Gulf) — see §7.4 |
| USA | US | 9 | 8 (Gulf) |
| Kuwait | KW | 8 | 9 (Kuwait) |
| Algeria | DZ | 7 | 8 (Gulf) |
| UK | GB | 7 | 8 (Gulf) |
| Iraq | IQ | 7 | 8 (Gulf) |
| Canada | CA | 7 | 8 (Gulf) |
| Yemen | YE | 7 | 8 (Gulf) |
| UAE | AE | 7 | 8 (Gulf) |
| Syria | SY | 6 | 8 (Gulf) |
| Libya | LY | 6 | 8 (Gulf) |
| Palestine | PS | 6 | 8 (Gulf) |
| India | IN | 6 | 8 (Gulf) |
| Qatar | QA | 6 | 10 (Qatar) |
| China | CN | 6 | 8 (Gulf) |
| Sudan | SD | 5 | 8 (Gulf) |
| Spain | ES | 4 | 8 (Gulf) |
| Malaysia | MY | 4 | 8 (Gulf) |
| Netherlands | NL | 4 | 8 (Gulf) |
| Tunisia | TN | 4 | 8 (Gulf) |
| Ukraine | UA | 4 | 8 (Gulf) |
| Jordan | JO | 3 | 8 (Gulf) |
| France | FR | 3 | 8 (Gulf) |
| Norway | NO | 2 | 8 (Gulf) |
| Russia | RU | 2 | 8 (Gulf) |
| Georgia | GE | 2 | 8 (Gulf) |
| Lebanon | LB | 2 | 8 (Gulf) |
| Italy | IT | 2 | 8 (Gulf) |
| Indonesia | ID | 2 | 8 (Gulf) |
| Bahrain | BH | 1 declared / 0 actual | 8 (Gulf) |
| Philippines | PH | 1 declared / 0 actual | 8 (Gulf) |
| Uzbekistan | UZ | 1 declared / 0 actual | 8 (Gulf) |

> **33 of 38 countries (87%) use Gulf Method 8 as their default.** Only SA, EG, MA, KW, and QA have country-specific methods.

---

## 4. Route Patterns & Static Generation

### URL Patterns

| Route | Pattern | Count | Source |
|---|---|---|---|
| City page | `/city/[slug]/` | 328 | `generateStaticParams` in `src/app/city/[slug]/page.tsx` |
| Country page | `/country/[slug]/` | 38 | `generateStaticParams` in `src/app/country/[slug]/page.tsx` |
| Homepage | `/` | 1 | `src/app/page.tsx` |
| Imsakia Ramadan | `/imsakia-ramadan/` | 1 | `src/app/imsakia-ramadan/page.tsx` |
| Developers | `/developers/` | 1 | `src/app/developers/page.tsx` |
| Embed | `/embd/` | 1 | `src/app/embd/page.tsx` |
| Privacy (rewrite) | `/سياسة-الخصوصية/` → `/privacy-policy/` | — | `next.config.ts` rewrite |
| Search API | `/api/search` | 1 (dynamic) | `src/app/api/search/route.ts` |

**Current sitemap total: 370 URLs** (328 city + 38 country + 4 static), generated in `src/app/sitemap.ts`.

### Rendering Mode

All city and country pages are **fully static (SSG)**:
- `generateStaticParams()` iterates all slugs at build time from the two JSON files
- Prayer times are **computed on the server at build** using `adhan` — no external API
- `trailingSlash: true` is set globally in `next.config.ts`
- No ISR (`revalidate`) and no `dynamic = 'force-dynamic'` on any page

### Build Route Count

| Type | Routes |
|---|---|
| City pages | 328 |
| Country pages | 38 |
| Static pages | 4 |
| **Total static routes** | **370** |

> The `.next/server/app/` contains 0 pre-rendered HTML files — the project has a `build-manifest.json` from a prior partial build but no current static output. A fresh `next build` is required to regenerate all 370 pages.

---

## 5. Prayer-Time Engine Architecture

### Data Flow: City Record → Displayed Timetable

```
data/normalized/cities.json
        │
        ▼
 getAllCities()  [src/lib/data.ts]
        │  getCityBySlug(slug)
        ▼
 CityPage  [src/app/city/[slug]/page.tsx]
        │
        ├─ toCalculationMethodId(city.calculationMethodId)
        ├─ buildPrayerConfig(methodId, latitude)  [src/lib/prayer-config.ts]
        │     └─ auto-assigns highLatitudeRule if |lat| >= 48°
        │
        ├─ prayerTimeService.calculateDailySchedule(coords, tz, date, config)
        └─ prayerTimeService.calculateMonthlySchedule(coords, tz, year, month, config)
                │
                ▼
         PrayerTimeService  [src/services/prayer-service.ts]
                │  resolveCalculationParameters(config)
                │  new Coordinates(lat, lon)       [adhan]
                │  new PrayerTimes(coords, date, params)  [adhan]
                │  Intl.DateTimeFormat(timezone)   [node built-in]
                ▼
         DailyPrayerSchedule / MonthlyPrayerSchedule
                │
                ▼
         CityPrayerInteractive  [client component]
                └─ PrayerControls (user can switch method/madhhab, stored in localStorage)
```

### Calculation Method Mapping

The numeric `calculationMethodId` stored per city is translated by `METHOD_ID_MAP` in `src/lib/data.ts`:

| Numeric ID | Domain ID | Authority | Cities using it |
|---|---|---|---|
| 3 | `EGYPT` | Egyptian General Authority of Survey (19.5°/17.5°) | 26 |
| 4 | `MAKKAH` | Umm Al-Qura University (+90 min Isha) | 42 |
| 8 | `GULF` | Gulf Region (19.5°/+90 min Isha) | 216 |
| 9 | `KUWAIT` | Kuwait Ministry of Awqaf | 8 |
| 10 | `QATAR` | Qatar Ministry of Awqaf | 6 |
| 13 | `TURKEY` | Diyanet Isleri Baskanligi | 0 (mapped but no city uses it) |
| 15 | `MOROCCO` | Morocco Habous (19.0°/17.0°) | 30 |
| 17 | `TEHRAN` | Institute of Geophysics, Tehran | 0 |
| 2 | `ISNA` | Islamic Society of North America | 0 |
| 12 | `KARACHI` | University of Islamic Sciences | 0 |
| 11 | `SINGAPORE` | Majlis Ugama Islam Singapura | 0 |
| *(unmapped)* | `GULF` | **Silent fallback** (line 63, data.ts) | — |

> `FRANCE` is declared in `CalculationMethodIdSchema` in `src/types/prayer.ts` but has **no entry in `METHOD_ID_MAP`** and **no branch in `resolveCalculationParameters()`**. Any city assigned a FRANCE method silently falls back to MWL — a latent bug.

### Madhhab & High-Latitude Rules

| Rule | Trigger | Applied where |
|---|---|---|
| Default madhhab | Always Shafi | `prayer-service.ts` L125–129 |
| Hanafi Asr | User toggle via PrayerControls | Client component, localStorage |
| High-latitude auto-rule | `|latitude| >= 48°` → `seventh_of_the_night` | `src/lib/prayer-config.ts` L20–22 |

### Enrichment Sources (per city)

| Source | Count | Verification Status |
|---|---|---|
| GeoNames (`city-timezones` npm package) | 178 | `verified_exact` |
| OpenStreetMap Nominatim | 150 | `verified_regional` |
| UTF-8 anomaly (Norrkoping) | 1 | `verified_exact` (coord OK, source string corrupted) |

---

## 6. SEO & URL Preservation Requirements

### Canonical URL Policy

- **City:** `https://mawaqetsalat.com/city/[slug]/`
- **Country:** `https://mawaqetsalat.com/country/[slug]/`
- All canonical tags are self-referential, set via `alternates.canonical` in `generateMetadata()`
- Trailing slashes enforced by `trailingSlash: true` in `next.config.ts`

### Active Redirects — Must Not Change

| Source | Target | Type | Location |
|---|---|---|---|
| `/sample-page/` | `/` | 301 | `src/middleware.ts` |
| `/country/prayer-times-in-egypt/` | `/country/prayer-times-in-eqypt/` | 301 | `src/middleware.ts` |
| `/%D8%B3%D9%8A%D8%A7…/` | `/privacy-policy/` | Rewrite | `next.config.ts` |
| `/سياسة-الخصوصية/` | `/privacy-policy/` | Rewrite | `next.config.ts` |

### Known Slug Anomalies

| Issue | ID | Slug in data | Required action |
|---|---|---|---|
| Typo: missing leading `p` | country 24 | `rayer-times-in-india` | **Do not rename** — GSC-indexed; route to it must be preserved |
| Underscore instead of hyphen | country 6 | `prayer-times-in-united_arab_emirates` | **Do not rename** — legacy canonical |
| Egypt typo is deliberate | country 2 | `prayer-times-in-eqypt` | Middleware redirects corrected spelling here |

### Structured Data

Every city page emits a `BreadcrumbList` JSON-LD. Every country page emits a `BreadcrumbList`. No `Place`, `LocalBusiness`, or `Event` schema currently.

### Sitemap Strategy

`src/app/sitemap.ts` produces a **single XML sitemap** at build time.
- Current: 370 entries
- At +5,000 new cities: ~5,370 entries — **safely under Google's 50,000/file limit**
- No sitemap index split required at target scale

---

## 7. Data Quality Findings (Measured)

### 7.1 Summary

| Metric | Value | Status |
|---|---|---|
| Total cities | 328 | OK |
| Total countries | 38 | OK |
| `verified_exact` cities | 178 (54.3%) | OK |
| `verified_regional` cities | 150 (45.7%) | Note |
| `unresolved` cities | 0 | OK |
| Missing coordinates | 0 | OK |
| Missing timezone | 0 | OK |
| Missing `calculationMethodId` | 0 | OK |
| Duplicate city slugs | 0 | OK |
| Duplicate city `urlPath` | 0 | OK |
| Duplicate city `legacyPostId` | 0 | OK |
| Invalid coordinates (out of WGS-84 bounds) | 0 | OK |
| Independently verified against external refs | 42 (12.8%) | Note |

### 7.2 Country-Level Issues

**`totalCities` field mismatches** — `countries.json` declares a count that does not match actual records in `cities.json`:

| Country | Code | ID | Declared | Actual | Delta |
|---|---|---|---|---|---|
| Bahrain | BH | 5 | 1 | 0 | −1 |
| Sweden | SE | 31 | 41 | 43 | +2 |
| Philippines | PH | 32 | 1 | 0 | −1 |
| Uzbekistan | UZ | 37 | 1 | 0 | −1 |

> **Bahrain, Philippines, and Uzbekistan each declare 1 city but have 0 records.** The country page will display "1 مدينة مسجلة" but render an empty city list. This is a display bug — not a routing error — because `getCitiesByCountryId()` reads actual records, not the `totalCities` counter. These three countries' missing cities may exist in the raw WordPress dump (`docs/extracted_wpress/database.sql`) and should be recovered before expansion.

> **Sweden shows +2 extra cities** (43 actual vs 41 declared). The `totalCities` counter is stale and needs updating.

### 7.3 Calculation Method Gaps

| Gap | Detail | Risk |
|---|---|---|
| `FRANCE` method | Declared in `CalculationMethodIdSchema` but has no branch in `resolveCalculationParameters()` and no entry in `METHOD_ID_MAP` | **Medium** — any French city assigned this method silently falls to MWL |
| Turkey `defaultMethodId` | `countries.json` id=25 declares `defaultMethodId: 8` (Gulf) but Turkey uses Diyanet (method 13). No Turkish city record was verified to confirm city-level override. | **Low** — currently Turkey cities may still compute correctly if individual records carry method 13 at city level |
| Norrköping encoding | `enrichmentSource` contains non-ASCII bytes: `"GeoNames (city-timezones - Norrk??ping)"` | **Low** — display only; coordinates and timezone are correct |

### 7.4 High-Latitude Coverage (Current)

The `buildPrayerConfig()` function auto-assigns `seventh_of_the_night` to any city with `|latitude| >= 48°`. This covers all Swedish, German, British, Canadian, Norwegian, Russian, Dutch, and Ukrainian cities in the current dataset. No manual override is needed for expansion cities if coordinates are correct.

---

## 8. Build-Time & Runtime Risks

### 8.1 Static Build Scalability

| Metric | Current (328 cities) | Target (+5,000 = 5,328 total) | Risk |
|---|---|---|---|
| Prayer-time compute at build | ~1 s | ~16 s | None |
| `cities.json` size (import) | 303 KB | ~4.9 MB estimated | **HIGH — see below** |
| Total static pages | 370 | ~5,370 | None |
| Sitemap entries | 370 | ~5,370 | None (< 50,000 limit) |

> **JSON bundle inflation is the single largest build risk.** `cities.json` is imported as a static module at the top of `src/lib/data.ts` (`import citiesRaw from '../../data/normalized/cities.json'`). At 5,328 cities (~4.9 MB), this will be bundled into every server chunk that imports `data.ts` — including the `/api/search` route. This increases cold-start time on serverless deployments and raises peak memory during SSG.
>
> **Required mitigation before importing > ~1,000 cities:** Replace the static `import` with `fs.readFileSync` + a module-level singleton cache in `data.ts`. This keeps the data on disk instead of in the JavaScript bundle and requires zero infrastructure changes.

### 8.2 Linear-Scan Performance (O(n))

| Function | Current cost | At 5,328 cities | Acceptable? |
|---|---|---|---|
| `getCityBySlug()` — SSG only | < 1ms | < 5ms | Yes (build-time) |
| `searchCities()` — per API request | ~1ms | ~15–25ms | Marginal |
| `findClosestCity()` — per API request | ~2ms | ~40–80ms | Needs geohash pre-filter |

> Adding a `Map<slug, RawCity>` index (built once at module load) makes `getCityBySlug` O(1). The search API route has `Cache-Control: s-maxage=300` so marginal latency is acceptable at first.

### 8.3 Country Page City List

`CountryPage` renders every city in a country in a single grid. If expansion adds 200+ cities to Morocco or Saudi Arabia, the country page will produce very large server-rendered HTML. **Pagination or virtual list must be added to `CountryCitiesList` before any single country exceeds ~100 cities.**

### 8.4 Hosting Limits

The deployment platform is **not identifiable from the project config**. Assuming Vercel:

| Limit | Value | At 5,370 pages |
|---|---|---|
| Build time (free) | 45 min | Estimated ~10 min — monitor |
| Function bundle size | 50 MB (free) / 250 MB (pro) | Monitor JSON file growth |
| Static file count | Unlimited | OK |

---

## 9. Recommended Import Schema & Validation Gates

### 9.1 Import Record Schema

Each new city must conform to `RawCity` (`src/lib/data.ts`) and `CitySchema` (`src/types/location.ts`). Recommended additions for provenance tracking (backward-compatible optional fields):

```typescript
// Add to RawCity (optional — absent on legacy records)
importBatch?: string;    // e.g. "batch-2026-11-SA-001"
importedAt?: string;     // ISO 8601
lastVerifiedAt?: string; // ISO 8601
```

Example new record:
```json
{
  "id": 329,
  "countryId": 1,
  "countryCode": "SA",
  "slug": "prayer-times-in-hail",
  "urlPath": "/city/prayer-times-in-hail/",
  "nameAr": "حائل",
  "nameEn": "hail",
  "coordinates": { "latitude": 27.5114, "longitude": 41.7208 },
  "timezone": "Asia/Riyadh",
  "calculationMethodId": 4,
  "seoTitle": "مواقيت الصلاة في حائل",
  "seoDescription": "...",
  "contentAr": "",
  "legacyPostId": -1,
  "verificationStatus": "verified_exact",
  "enrichmentSource": "GeoNames v1 — batch-2026-11-SA-001",
  "importBatch": "batch-2026-11-SA-001",
  "importedAt": "2026-11-01T10:00:00Z"
}
```

### 9.2 Mandatory Validation Gates (G1–G15)

All gates must pass before merging any batch into `cities.json`:

| Gate | Rule |
|---|---|
| **G1** | `id` is unique across entire `cities.json` |
| **G2** | `slug` matches `/^prayer-times-in-[a-z0-9-]+$/` and is globally unique |
| **G3** | `urlPath` = `/city/${slug}/` and is globally unique |
| **G4** | `countryId` resolves to a valid `id` in `countries.json` |
| **G5** | `countryCode` matches `countries[countryId].code` |
| **G6** | `latitude` in `[-90, 90]` and `longitude` in `[-180, 180]` |
| **G7** | `timezone` is a valid IANA string (verified via `Intl.DateTimeFormat`) |
| **G8** | `calculationMethodId` maps to a defined key in `METHOD_ID_MAP` (no silent fallback) |
| **G9** | No existing production slug is duplicated |
| **G10** | For multi-timezone countries (US, RU, CA, CN, ID): `timezone` is city-level, not country-level |
| **G11** | `verificationStatus` is `verified_exact` or `verified_regional` — never `unresolved` |
| **G12** | `enrichmentSource` is non-empty (provenance required) |
| **G13** | `legacyPostId` = `-1` for all non-legacy cities |
| **G14** | `nameEn` is lowercase with no underscores |
| **G15** | Smoke test: `adhan.PrayerTimes` computes a non-NaN Fajr for today's date |

### 9.3 Rollback Procedure

1. Before any batch import, commit current state and create a git tag: `git tag pre-expansion-v{N}`
2. Copy current file: `cp data/normalized/cities.json data/normalized/cities.json.bak.$(date +%Y%m%d)`
3. Run validation gate script on the batch file — stop if any gate fails
4. Merge only after all gates pass
5. If post-merge issues: `git checkout data/normalized/cities.json` to restore instantly
6. Trigger a new build — all pages regenerate from restored data, no DB rollback needed

---

## 10. Source Provenance & Update Tracking

### Current Fields

Each city record has `verificationStatus`, `enrichmentSource`, and optional `notes`.

### Gaps Identified

- No `importBatch` or `importedAt` timestamp — cannot distinguish new from legacy by timestamp
- No `lastVerifiedAt` — cannot detect stale coordinates
- No `dataVersion` — cannot identify which GeoNames / OSM snapshot was used

### Recommendation

Add the three optional fields listed in §9.1 to new city records only. Legacy records are untouched. The `RawCity` interface update is backward-compatible (all fields optional).

---

## 11. Phased Implementation Plan

### Phase 1 — Pre-Expansion Hardening

*Complete before importing a single new city.*

**Acceptance criteria:**
- [ ] Fix `totalCities` mismatches in `countries.json` for BH (5), SE (31), PH (32), UZ (37)
- [ ] Add `FRANCE` method branch to `resolveCalculationParameters()` and `METHOD_ID_MAP`
- [ ] Verify Turkey `defaultMethodId` at country level (should be 13, not 8)
- [ ] Fix UTF-8 encoding anomaly in Norrköping `enrichmentSource` field
- [ ] Add `Map<string, RawCity>` slug index in `data.ts` for O(1) lookups
- [ ] Write `scripts/validate-cities.js` implementing gates G1–G15
- [ ] Add `importBatch`, `importedAt`, `lastVerifiedAt` optional fields to `RawCity` type
- [ ] Create git tag `pre-expansion-v1`
- [ ] Full Vitest suite passes (0 failures)

---

### Phase 2 — Pilot Batch (50–100 cities, 1–2 countries)

*Choose a single country with validated method: Morocco (MA) or Saudi Arabia (SA).*

**Acceptance criteria:**
- [ ] Validation gate script exits 0 on the pilot batch
- [ ] `cities.json` grows by exactly N records; no existing record changes
- [ ] `next build` exits 0 with all new city pages
- [ ] 5 sample new cities: prayer times validated against AlAdhan API reference
- [ ] All existing 328 city pages still return correct data
- [ ] Sitemap count increases by exactly N
- [ ] `pre-launch-audit.test.ts` count assertions updated to new total — suite passes
- [ ] Deploy to preview URL; GSC monitoring starts

---

### Phase 3 — Medium Batch (100–500 cities, multiple countries)

**Acceptance criteria:**
- [ ] `cities.json` size measured: if > 1 MB, `data.ts` migrated to `fs.readFileSync` singleton before proceeding
- [ ] `findClosestCity()` benchmarked at new N; geohash pre-filter added if > 50ms
- [ ] Any country gaining > 50 cities has `CountryCitiesList` pagination implemented
- [ ] One PR per country for rollback granularity
- [ ] Build time measured and within hosting limit

---

### Phase 4 — Large Batch (500–5,000 cities)

**Acceptance criteria:**
- [ ] JSON architecture decision finalized (see Appendix)
- [ ] `searchCities()` P99 latency < 30ms at full N
- [ ] Sitemap total < 50,000
- [ ] Build time within hosting limit
- [ ] All G1–G15 gates pass for complete batch
- [ ] Regression tests cover 10 sample cities per country + all 42 independently verified cities

---

### Phase 5 — Post-Expansion Validation

**Acceptance criteria:**
- [ ] GSC: no existing city loses > 20% impressions in 30-day window
- [ ] All new city pages indexed within 60 days (GSC URL Inspection)
- [ ] Zero duplicate slugs in production (CI gate)
- [ ] `docs/audit/city-inventory.json` regenerated and committed

---

## 12. Regression Test Requirements

### Automated (Vitest — must pass before each batch deploy)

| Test | File | What to verify |
|---|---|---|
| Dataset count assertions | `pre-launch-audit.test.ts` | Update hardcoded `328` / `38` to new totals |
| Unique slugs and IDs | `pre-launch-audit.test.ts` | Must pass for all records including new |
| Valid coordinates | `pre-launch-audit.test.ts` | All new cities in bounds |
| Country FK integrity | `pre-launch-audit.test.ts` | All new `countryId` values resolve |
| High-latitude rule | `phase3-routes.test.ts` | Sample 5 new high-latitude cities |
| Prayer time non-NaN | `prayer-service.test.ts` | Run for 5 new sample cities |
| Domain separation | `pre-launch-audit.test.ts` | No mosque/iqamah fields in new records |

### Script-Based

| Test | Script | Requirement |
|---|---|---|
| Validation gates G1–G15 | `scripts/validate-cities.js` (to be written) | 0 violations |
| URL manifest integrity | `scripts/validate-urls.js` | 0 errors |
| Legacy URL preservation | `scripts/verify-all-legacy-urls.js` | All 328 original cities still 200 OK |

---

## 13. Unresolved Questions

1. **Hosting platform** — No deployment config identified. Vercel, Cloudflare Pages, AWS Amplify, or self-hosted? Build time limit differs significantly.
2. **Turkey `defaultMethodId`** — Is `8` (Gulf) intentional legacy parity or an oversight? Individual Turkish city records may carry `13` at city level but this was not confirmed.
3. **Bahrain, Philippines, Uzbekistan missing cities** — Three countries declare 1 city each but have 0 records. Were these lost during migration? The WordPress dump at `docs/extracted_wpress/database.sql` likely contains them.
4. **India country slug** — `rayer-times-in-india` is the GSC-indexed canonical (missing `p`). New Indian cities must use `countryId: 24`. Should the slug typo eventually be corrected with a 301 redirect or left permanent?
5. **Static JSON vs. database at scale** — At what city count should the project switch from file-based JSON to Drizzle/Postgres (schema already exists in `src/db/schema.ts`) or edge-compatible SQLite? The DB client (`src/db/client.ts`) is lazy-initialized and ready.
6. **City-level SEO content (`contentAr`)** — Legacy cities have WordPress editorial content. New cities will have `contentAr: ""`. Is AI-generated or templated Arabic content planned for new cities?
7. **Imsakia Ramadan page** — `src/app/imsakia-ramadan/page.tsx` was not fully inspected. Does it depend on the city dataset? If so, it needs to scale.

---

## Appendix: Data Architecture at Scale

| Approach | Bundle impact | Search latency | Infra cost | Recommended at |
|---|---|---|---|---|
| **Current: static JSON import** | Grows with N | O(n) ~20ms | Zero | Up to ~500 cities |
| **`fs.readFileSync` + singleton** | None | O(n) ~20ms | Zero | Up to ~2,000 cities |
| **`fs.readFileSync` + Map index + geohash** | None | O(1) slug / O(k) geo | Zero | Up to ~5,000 cities |
| **SQLite via Turso/libSQL (edge)** | None | O(log n) | Low | 5,000+ cities |
| **PostgreSQL via Drizzle (existing schema)** | None | O(log n) | Moderate | 5,000+ cities |

> The simplest safe path for 1,000–5,000 cities: switch `data.ts` to `fs.readFileSync` singleton + slug Map index. Zero new infrastructure, fully backward-compatible with the static build.

---

*Audit complete. No production files were modified.*
*Machine-readable inventory: `docs/audit/city-inventory.json` (328 records)*
*Machine-readable quality report: `docs/audit/data-quality-report.json`*

**Next step: Await approval, then begin Phase 1 — Pre-Expansion Hardening.**
