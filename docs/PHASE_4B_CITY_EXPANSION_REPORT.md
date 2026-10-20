# Phase 4B — Controlled Expansion: First 6 Cities Report
**Document:** `docs/PHASE_4B_CITY_EXPANSION_REPORT.md`  
**Project Workspace:** `C:\Users\HP\Desktop\mawaqetsalat`  
**Production Domain:** `https://mawaqetsalat.com`  
**Execution Date:** October 20, 2026  
**Status:** IMPLEMENTED, TESTED & PRODUCTION-BUILD VERIFIED (Audit & Local Implementation Only — Zero Deploy/Commit/Push)  

---

## 1. Executive Summary

Phase 4B successfully implemented a controlled, reversible expansion adding **6 high-priority urban centers** across **3 high-demand countries** (Egypt, Iraq, and Jordan).

This batch targeted major geographic and administrative voids identified during the Phase 4A audit, particularly in Iraq (over 2.2M historical Search Console impressions) and Egypt (over 543K impressions):
- **Total cities in dataset expanded:** from **478 to 484 cities** (+6).
- **Supported countries:** remains strictly at **38 countries** (0 unsupported countries added).
- **Country declared totals synchronized:**
  - Egypt (EG / ID 2): $26 \to 28$ (+2 cities: Mansoura, El Mahalla El Kubra)
  - Iraq (IQ / ID 15): $14 \to 17$ (+3 cities: Duhok, Amarah, Baqubah)
  - Jordan (JO / ID 16): $8 \to 9$ (+1 city: Jerash)
- **Sitemap XML URLs:** expanded from **521 to 527 URLs** (+6 canonical city URLs).
- **Next.js 15 App Router static generation:** built **534 static pages** cleanly in 5.0 seconds (484 city pages + 38 country pages + 8 static/system pages + 2 dynamic/embed routes).
- **Zero regression on existing cities (IDs 1–478):** All 478 prior city records, legacy slugs, and 372 historical GSC migration URLs remain 100% bit-for-bit immutable.

---

## 2. Dossier of Added Cities

All 6 cities were assigned sequential IDs (479–484), conforming to the exact schema defined in `src/types/location.ts`:

| ID | City Name (Ar / En) | Country | Slug | Coordinates (WGS-84) | Timezone | Method ID & Name | Source Provenance & Notes |
|:---:|---|:---:|---|---|:---:|:---:|---|
| **479** | المنصورة<br>`mansoura` | Egypt<br>(EG / 2) | `prayer-times-in-mansoura` | Lat: `31.05044191`<br>Lng: `31.38003780` | `Africa/Cairo` | 3<br>(EGYPT) | `city-timezones v1.3.4` (El Mansura)<br>Pop: 540,247. Province: Dakahlia. |
| **480** | دهوك<br>`duhok` | Iraq<br>(IQ / 15) | `prayer-times-in-duhok` | Lat: `36.86670013`<br>Lng: `43.00000263` | `Asia/Baghdad` | 8<br>(GULF) | `city-timezones v1.3.4` (Dahuk)<br>Pop: 620,500. Province: Duhok. |
| **481** | العمارة<br>`amarah` | Iraq<br>(IQ / 15) | `prayer-times-in-amarah` | Lat: `31.84160809`<br>Lng: `47.15116817` | `Asia/Baghdad` | 8<br>(GULF) | `city-timezones v1.3.4` (Al Amarah)<br>Pop: 334,155. Province: Maysan. |
| **482** | بعقوبة<br>`baqubah` | Iraq<br>(IQ / 15) | `prayer-times-in-baqubah` | Lat: `33.74764162`<br>Lng: `44.65726355` | `Asia/Baghdad` | 8<br>(GULF) | `city-timezones v1.3.4` (Baqubah)<br>Pop: 226,015. Province: Diyala. |
| **483** | جرش<br>`jerash` | Jordan<br>(JO / 16) | `prayer-times-in-jerash` | Lat: `32.2723`<br>Lng: `35.8914` | `Asia/Amman` | 8<br>(GULF) | GeoNames (ID 248944)<br>Pop: 50,745. Province: Jerash. |
| **484** | المحلة الكبرى<br>`el mahalla el kubra` | Egypt<br>(EG / 2) | `prayer-times-in-el-mahalla-el-kubra` | Lat: `30.97056`<br>Lng: `31.16694` | `Africa/Cairo` | 3<br>(EGYPT) | GeoNames (ID 360526)<br>Pop: 535,278. Province: Gharbia. |

---

## 3. Preflight Distance & Threshold Analysis

Prior to insertion, pairwise Haversine distances were calculated from each candidate to **every existing city** in the same country:

### 3.1 Distance to Pre-Existing Cities in Dataset
* **Mansoura (EG):**
  * Nearest existing city: Kafr El Sheikh (`prayer-times-in-kafr-el-sheikh`) at **42.79 km** ($\ge 25\text{ km}$).
  * Tanta (`prayer-times-in-tanta`): 46.37 km.
  * Zagazig (`prayer-times-in-zagazig`): 53.55 km.
  * Status: **PASS (100% compliant)**.
* **El Mahalla El Kubra (EG):**
  * Nearest existing city: Tanta (`prayer-times-in-tanta`) at **25.59 km** ($\ge 25\text{ km}$).
  * Kafr El Sheikh (`prayer-times-in-kafr-el-sheikh`): 26.85 km ($\ge 25\text{ km}$).
  * Status: **PASS (100% compliant against pre-existing network)**.
* **Duhok (IQ):**
  * Nearest existing city: Mosul (`prayer-times-in-musul`) at **59.52 km** ($\ge 25\text{ km}$).
  * Erbil (`prayer-times-in-erbil`): 117.37 km.
  * Status: **PASS (100% compliant)**.
* **Amarah (IQ):**
  * Nearest existing city: Nasiriyah (`prayer-times-in-nasiriyah`) at **122.12 km** ($\ge 25\text{ km}$).
  * Kut (`prayer-times-in-kut`): 143.75 km.
  * Status: **PASS (100% compliant)**.
* **Baqubah (IQ):**
  * Nearest existing city: Baghdad (`prayer-times-in-baghdad`) at **51.62 km** ($\ge 25\text{ km}$).
  * Status: **PASS (100% compliant)**.
* **Jerash (JO):**
  * Nearest existing city: Zarqa (`prayer-times-in-zarqa`) at **29.86 km** ($\ge 25\text{ km}$).
  * Salt (`prayer-times-in-salt`): 30.18 km.
  * Irbid (`prayer-times-in-irbid`): 31.12 km.
  * Amman (`prayer-times-in-amman_city`): 36.05 km.
  * Status: **PASS (100% compliant)**.

### 3.2 Documented Intra-Batch Spatial Overlap Note
* **Mansoura $\leftrightarrow$ El Mahalla El Kubra:**
  * Straight-line distance between the two newly added Egyptian candidates is **22.17 km**.
  * **Geographic & Administrative Justification:**
    * Mansoura is the administrative capital of **Dakahlia Governorate** (population 540,247), situated on the east bank of the Damietta Nile branch.
    * El Mahalla El Kubra is the largest industrial city of **Gharbia Governorate** (population 535,278), situated on the west side.
    * Both cities have populations exceeding half a million residents each with distinct search query volume and civic identities.
    * To all 26 previously existing Egyptian cities, both cities independently exceed the 25.0 km threshold (Tanta is 25.59 km from Mahalla, and Kafr El Sheikh is 42.79 km from Mansoura).
    * Astronomical prayer times between the two differ by approximately 60 seconds across all daily prayers.

---

## 4. Astronomical Prayer-Time Solvability (All 4 Seasons)

A complete astronomical smoke test was conducted using `adhan` for all 6 added cities across four seasonal reference dates:
1. **Vernal Equinox (March 20, 2026)**
2. **Summer Solstice (June 21, 2026)**
3. **Autumnal Equinox (September 22, 2026)**
4. **Winter Solstice (December 21, 2026)**

### Results:
- **Zero `NaN` errors** across all timestamps.
- **Strict chronological ordering** maintained across all 4 dates:
  $$\text{Fajr} < \text{Sunrise} < \text{Dhuhr} < \text{Asr} < \text{Maghrib} < \text{Isha}$$
- **Representative Daily Timings (October 20, 2026):**
  - **Mansoura (Method 3 - Egyptian Survey):**
    - Fajr: `05:33` | Sunrise: `07:01` | Dhuhr: `12:40` | Asr: `15:51` | Maghrib: `18:18` | Isha: `19:36`
  - **El Mahalla El Kubra (Method 3 - Egyptian Survey):**
    - Fajr: `05:34` | Sunrise: `07:01` | Dhuhr: `12:41` | Asr: `15:52` | Maghrib: `18:19` | Isha: `19:37`
  - **Duhok (Method 8 - Gulf / Standard):**
    - Fajr: `05:14` | Sunrise: `06:44` | Dhuhr: `12:25` | Asr: `15:37` | Maghrib: `18:04` | Isha: `19:34`
  - **Amarah (Method 8 - Gulf / Standard):**
    - Fajr: `04:54` | Sunrise: `06:20` | Dhuhr: `12:05` | Asr: `15:23` | Maghrib: `17:49` | Isha: `19:19`
  - **Baqubah (Method 8 - Gulf / Standard):**
    - Fajr: `05:05` | Sunrise: `06:33` | Dhuhr: `12:16` | Asr: `15:32` | Maghrib: `17:59` | Isha: `19:29`
  - **Jerash (Method 8 - Gulf / Standard):**
    - Fajr: `05:15` | Sunrise: `06:43` | Dhuhr: `12:23` | Asr: `15:34` | Maghrib: `18:01` | Isha: `19:31`

---

## 5. Quality Gates & Test Suite Verification

All validation suites and build pipelines were executed and verified locally:

| Gate / Command | Purpose | Expected | Actual Result | Status |
|---|---|:---:|:---:|:---:|
| `npm test` (`vitest run`) | Comprehensive unit and integration test suite | 15 test files / 202 tests | **15 passed / 202 passed** (0 failed) in 1.02s | **PASS** |
| `npm run validate:expansion` | 15-check automated expansion gate | 15 / 15 checks | **15 passed / 0 warnings / 0 failures** | **PASS** |
| `npm run validate:urls` | Historical GSC migration URL preservation | 372 / 372 URLs | **372 verified / 0 404s / 0 loops** | **PASS** |
| `npx tsc --noEmit` | Strict TypeScript compiler check | 0 errors | **Exit code: 0** (Clean) | **PASS** |
| `npm run lint` | ESLint Next.js configuration | 0 errors | **0 warnings / 0 errors** | **PASS** |
| `npm run build` | Next.js 15 App Router production compilation | 534 static routes | **534 static pages generated** in 5.0s | **PASS** |

---

## 6. Route & Sitemap Verification

### 6.1 Route Inventory
- **Pre-existing City Routes:** 478
- **New City Routes:** +6
  1. `/city/prayer-times-in-mansoura/`
  2. `/city/prayer-times-in-duhok/`
  3. `/city/prayer-times-in-amarah/`
  4. `/city/prayer-times-in-baqubah/`
  5. `/city/prayer-times-in-jerash/`
  6. `/city/prayer-times-in-el-mahalla-el-kubra/`
- **Total City Routes:** **484**
- **Total Country Routes:** **38**
- **Total Static / System Pages:** **8** (`/`, `/countries/`, `/developers/`, `/imsakia-ramadan/`, `/privacy-policy/`, `/_not-found`, `/robots.txt`, `/sitemap.xml`)
- **Total Dynamic Routes:** **2** (`/embd/`, `/api/search/`)
- **Grand Total Routes:** **534 pages** (built by `next build`)

### 6.2 Sitemap XML (`src/app/sitemap.ts`)
- **5 static indexable URLs**
- **38 country landing URLs**
- **484 city canonical URLs**
- **Total URLs in Sitemap:** **527 URLs** (0 duplicates, 100% trailing-slash normalized).

---

## 7. Staging & Traceability Files Created

1. **Staging File:**
   - [`data/staging/city-expansion-phase4b-6.json`](file:///c:/Users/HP/Desktop/mawaqetsalat/data/staging/city-expansion-phase4b-6.json) (Contains the 6 staged records in isolated format).
2. **Dedicated Test Suite:**
   - [`tests/phase4b-expansion.test.ts`](file:///c:/Users/HP/Desktop/mawaqetsalat/tests/phase4b-expansion.test.ts) (18 tests covering ID sequencing, country counter sync, coordinates, and 4-season solvability).
3. **Execution Report:**
   - [`docs/PHASE_4B_CITY_EXPANSION_REPORT.md`](file:///c:/Users/HP/Desktop/mawaqetsalat/docs/PHASE_4B_CITY_EXPANSION_REPORT.md).

---

## 8. Safety & Deployment Boundaries

* **No git commit, push, or branch switch was executed.**
* **No deployment to Railway or Vercel was initiated.**
* **No DNS records, Cloudflare settings, or server environments were touched.**
* **All existing URLs from WordPress legacy migration remain 100% intact.**

---
*Phase 4B implementation and validation complete. Awaiting user review and authorization before any deployment.*
