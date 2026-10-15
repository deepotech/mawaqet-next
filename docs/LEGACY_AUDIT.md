# Legacy System Audit: MawaqetSalat.com

**Date of Audit:** October 15, 2026  
**Auditor:** Senior Software Architect & Technical SEO Specialist  
**Status:** Complete (Phase 0)  
**Target Migration:** WordPress (`deepotechprayertimes` theme) -> Next.js App Router (Production-Ready)

---

## 1. Executive Summary & GSC Performance Verification

The legacy website `mawaqetsalat.com` is an active Islamic prayer times portal running on WordPress. Our inspection verified the exact Google Search Console (GSC) performance export covering the 6-month period from **April 12, 2026 to October 11, 2026** (183 days).

### Verified Historical Performance Metrics
| Metric | Value | Verification Source |
|---|---|---|
| **Total Clicks** | **9,262** | `Appareils.csv` (Pages sum: 9,264) |
| **Total Impressions** | **6,569,533** (~6.57M) | `Appareils.csv` (Pages sum: 6,570,275) |
| **Impression-Weighted Avg Position** | **9.36** | Calculated from `Pages.csv` |
| **Average CTR** | **0.14%** | `Pages.csv` & `Appareils.csv` |
| **Mobile Traffic Proportion** | **94.60%** (8,762 clicks) | `Appareils.csv` |
| **Desktop Traffic Proportion** | **4.19%** (388 clicks) | `Appareils.csv` |
| **Tablet Traffic Proportion** | **1.21%** (112 clicks) | `Appareils.csv` |
| **Active Ranking URLs** | **281 URLs** | `Pages.csv` |

### Geographical Distribution (Top Countries by Traffic)
1. **Morocco (`Maroc`):** 4,077 clicks (44.0%), 1,296,751 impressions, CTR 0.31%, Avg Pos 8.72
2. **Iraq (`Irak`):** 2,908 clicks (31.4%), 2,206,133 impressions, CTR 0.13%, Avg Pos 9.31
3. **Syria (`Syrie`):** 560 clicks (6.0%), 912,593 impressions, CTR 0.06%, Avg Pos 8.56
4. **Saudi Arabia (`Arabie Saoudite`):** 358 clicks (3.9%), 1,002,206 impressions, CTR 0.04%, Avg Pos 9.76
5. **Egypt (`Égypte`):** 268 clicks (2.9%), 543,063 impressions, CTR 0.05%, Avg Pos 8.87
6. **Yemen (`Yémen`):** 230 clicks (2.5%), 86,250 impressions, CTR 0.27%, Avg Pos 10.03
7. **Algeria (`Algérie`):** 188 clicks (2.0%), 29,232 impressions, CTR 0.64%, Avg Pos 10.08
8. **Sudan (`Soudan`):** 145 clicks (1.6%), 92,571 impressions, CTR 0.16%, Avg Pos 9.51
9. **France:** 66 clicks (0.7%), 15,342 impressions, CTR 0.43%, Pos 9.17
10. **Spain (`Espagne`):** 58 clicks (0.6%), 8,616 impressions, CTR 0.67%, Pos 12.65

*Finding:* Morocco and Iraq alone account for **75.4% of all organic clicks**. Saudi Arabia, Syria, and Egypt represent over **4.1 million impressions** despite low CTR (0.04%–0.06%), signaling an enormous upside if Core Web Vitals, rich snippets, and mobile UI speed are improved.

---

## 2. WordPress Source Artifacts & Extraction Report

### Source Archives Located
1. **Primary Backup Archive:**  
   `C:\Users\HP\Desktop\mawaqetsalat-com-20261014-090003-blree4exyzwo.wpress` (191,271,908 bytes / ~191 MB).  
   *Verified format:* All-in-One WP Migration (`Servmask`) archive.  
   *Extraction:* Extracted 100% cleanly into `docs/extracted_wpress/` including all theme files and the full 30.68 MB database dump (`database.sql`).
2. **GSC Performance Export:**  
   `C:\Users\HP\Downloads\Compressed\https___mawaqetsalat.com_-Performance-on-Search-2026-10-14.zip` (22,478 bytes).  
   *Extracted into:* `docs/gsc_export/`.
3. **Foreign / Unrelated Files Flagged During Audit:**  
   `u715387787_a62W6.sql` (59.6 MB in Downloads): Inspected and verified to belong to `lwatta.com` (automotive site). NOT part of this project.

---

## 3. WordPress Theme Architecture & Code Audit

### Theme Identity & Files
- **Theme Name:** `deepotechprayertimes` (Author: DeepoTech / hecoplus)
- **Files Inspected:**
  - `functions.php`: Custom post types (`country`, `city`), REST routes, widget sidebars, asset enqueuing.
  - `front-page.php`: Homepage template (search box, grid of all countries with flags).
  - `single-city.php`: City prayer timetable template (hero table, next prayer countdown, monthly table, cross-links to nearby cities and other countries).
  - `single-country.php`: Country landing page template (lists all cities belonging to the country).
  - `page-imsakia-ramadan.php`: Ramadan timetable template.
  - `page-dev.php`: Developer embed/API page.
  - `ebd.php`: Embed iframe endpoint (`/embd/`).
  - `js/main.js`: Core client-side prayer times logic (253 lines).
  - `style.css`: Tailwind/utility classes bundle (25.5 KB).
  - `css/icofont.min.css` & font files: Icon font used for visual embellishments.

### Critical Deficiencies in Legacy Theme
1. **100% Client-Side Prayer Times Rendering (Empty HTML for Googlebot):**
   In `single-city.php`, the HTML delivered by WordPress contains empty table cells:
   ```html
   <td class="border border-gray-400 py-2 ps-2" id="fajr"></td>
   <tbody ></tbody> <!-- Monthly table completely empty -->
   ```
   At the bottom, an inline script triggers `getSalatTime("city_name_en", "country_name_en")`. If a search engine crawler does not execute JavaScript or times out, the page content is completely missing.
2. **Fragile Third-Party Client API Dependency:**
   Every single browser visitor sends an unauthenticated HTTP request directly from their client to `api.aladhan.com`. If AlAdhan is slow, rate limits the user's IP, or fails, the user sees `--:--:--` and blank fields.
3. **Flawed Timezone and Countdown Logic in `main.js`:**
   - Substring parsing bug in `clock()`:
     ```javascript
     let [f_hours, f_minuts] = prayerData.timings["Fajr"].substr(0, 4).split(":");
     ```
     `substr(0, 4)` extracts 4 characters (e.g., `"05:1"` instead of `"05:12"`), leading to erroneous countdown calculations when minutes have two digits.
   - Client machine clock skew: The countdown mixes client local `new Date()` with timezone strings from AlAdhan metadata.
4. **Cumulative Layout Shift (CLS):**
   Because the monthly prayer table is injected into `<tbody>` dynamically by JavaScript after DOM load, the entire page content jumps down dramatically, destroying Core Web Vitals on mobile.

---

## 4. Database Structure & Content Inventory

Analysis of `database.sql` (`SERVMASK_PREFIX_` tables):
- **Custom Post Types:**
  - `city`: **328 published posts**
  - `country`: **38 published posts**
  - `page`: **5 published posts** (`/`, `/imsakia-ramadan/`, `/developers/`, `/embd/`, `/%d8%b3%d9%8a%d8%a7%d8%b3%d8%a9-%d8%a7%d9%84%d8%ae%d8%b5%d9%88%d8%b5%d9%8a%d8%a9/` [Privacy Policy])
- **Custom Fields (Advanced Custom Fields - ACF):**
  - On `city`:
    - `city_name_ar` (e.g., "مواقيت الصلاة في بغداد")
    - `city_name_en` (e.g., "baghdad")
    - `city_text` (text descriptions; largely empty in legacy database)
  - On `country`:
    - `country_name` (e.g., "مواقيت الصلاة في العراق")
    - `country_name_en` (e.g., "iraq")
    - `country_flag` (attachment ID for flag image)
    - `country_text` (text descriptions)
    - `cities` (PHP serialized array of city post IDs linked to this country)
- **Active WordPress Plugins in Legacy Site:**
  - Rank Math SEO (Schema, sitemaps, redirections, 404 monitor)
  - LiteSpeed Cache (Page caching)
  - Advanced Custom Fields (ACF) PRO
  - All-in-One WP Migration

---

## 5. Prayer Calculation Methods: Legacy vs Standard Verification

Inspecting `main.js` revealed the hardcoded country-to-calculation-method mapping:

```javascript
if (selectedCountryName == "saudi arabia") {
  calcMethod = 4;  // Umm Al-Qura University, Makkah
} else if (selectedCountryName == "kuwait") {
  calcMethod = 9;  // Kuwait
} else if (selectedCountryName == "qatar") {
  calcMethod = 10; // Qatar
} else if (selectedCountryName == "egypt") {
  calcMethod = 3;  // Egyptian General Authority of Survey
} else if (selectedCountryName == "morocco") {
  calcMethod = 15; // Ministry of Habous and Islamic Affairs, Morocco
} else {
  calcMethod = 8;  // Gulf Region / default
}
```

### Verified Observations:
1. **Morocco (Method 15):** Correctly mapped to Habous (Ministry of Habous and Islamic Affairs), critical because Morocco is the #1 traffic driver (44% of clicks).
2. **Saudi Arabia (Method 4):** Correctly mapped to Umm Al-Qura.
3. **Egypt (Method 3):** Correctly mapped to Egyptian General Authority of Survey.
4. **Kuwait (Method 9) & Qatar (Method 10):** Specific official local methods.
5. **Iraq, Syria, Algeria, France, Germany, USA, etc. (Default Method 8):**
   - The legacy site fell back to Method 8 (Gulf Region).
   - *Risk/Opportunity:* Method 8 is accurate for Gulf nations, but for Algeria (requires Algerian Ministry / Method 3 or 8), France (UOIF Method 12), North America (ISNA Method 2), and Muslim World League (Method 1), using a generic Gulf fallback is suboptimal. The new engine must support explicit, authoritative method mappings per country while preserving compatibility.

---

## 6. Existing SEO & Metadata Analysis

### Rank Math Configuration
- **Title Structure:**
  - Homepage: `mawaqetsalat.com - مواقيت الصلاة🙏مواعيد الصلاة`
  - City pages: `مواقيت الصلاة في [اسم المدينة]`
  - Country pages: `مواقيت الصلاة في [اسم الدولة]`
- **Meta Description Structure:**
  - City pages: `مواقيت الصلاة في [اسم المدينة], حصة مواقيت الصلاة الشهرية بمدينة [اسم المدينة]، مواعيد و مواقيت الصلاة والاذان اليوم في [اسم المدينة]، احصل على مواعيد الصلاة الفجر، اذان الظهر، اذان`
- **Canonical URLs:** Strict self-referential canonical with trailing slash (e.g., `https://mawaqetsalat.com/city/prayer-times-in-baghdad/`).
- **Robots Directives:** `index, follow, max-snippet:-1, max-video-preview:-1, max-image-preview:large`.
- **Structured Data:** Rank Math injected basic `CollectionPage` and `WebSite` schema. **No `PrayerTime` or specialized timetable structured data** existed in legacy.

---

## 7. High-Value Landing Pages & Search Trends

From `Pages.csv`, the top 20 revenue/traffic-driving city pages:

| URL | Clicks | Impressions | CTR | Position | Country |
|---|---|---|---|---|---|
| `/city/prayer-times-in-baghdad/` | 1,285 | 1,246,457 | 0.10% | 9.23 | Iraq |
| `/city/prayer-times-in-casablanca/` | 649 | 131,694 | 0.49% | 9.63 | Morocco |
| `/city/prayer-times-in-erbil/` | 630 | 241,508 | 0.26% | 9.48 | Iraq |
| `/city/prayer-times-in-najaf/` | 563 | 351,432 | 0.16% | 8.81 | Iraq |
| `/city/prayer-times-in-agadir/` | 436 | 58,499 | 0.75% | 8.97 | Morocco |
| `/city/prayer-times-in-basra/` | 391 | 370,614 | 0.11% | 9.91 | Iraq |
| `/city/prayer-times-in-beni-mellal/` | 390 | 44,524 | 0.88% | 7.78 | Morocco |
| `/city/prayer-times-in-safi/` | 373 | 116,486 | 0.32% | 8.50 | Morocco |
| `/city/prayer-times-in-temara/` | 362 | 68,083 | 0.53% | 7.66 | Morocco |
| `/city/prayer-times-in-oujda/` | 261 | 93,007 | 0.28% | 8.40 | Morocco |
| `/city/prayer-times-in-rabat/` | 244 | 52,103 | 0.47% | 10.08 | Morocco |
| `/city/prayer-times-in-homs/` | 185 | 319,514 | 0.06% | 7.03 | Syria |
| `/city/prayer-times-in-berkane/` | 180 | 101,022 | 0.18% | 8.68 | Morocco |
| `/city/prayer-times-in-errachidia/` | 177 | 44,028 | 0.40% | 8.23 | Morocco |
| `/city/prayer-times-in-sharm-el-sheikh/` | 166 | 237,898 | 0.07% | 8.76 | Egypt |
| `/city/prayer-times-in-al-hasakah/` | 156 | 135,279 | 0.12% | 9.27 | Syria |
| `/city/prayer-times-in-al-hoceima/` | 154 | 120,956 | 0.13% | 8.44 | Morocco |
| `/city/prayer-times-in-mohammedia/` | 148 | 121,004 | 0.12% | 8.61 | Morocco |
| `/city/prayer-times-in-settat/` | 148 | 112,014 | 0.13% | 8.57 | Morocco |
| `/city/prayer-times-in-riyadh/` | 147 | 183,954 | 0.08% | 11.15 | Saudi Arabia |

**SEO Imperative:** Any breaking URL change to these top 20 pages would instantly jeopardize >6,500 organic clicks. They must retain their exact URL slugs or receive permanent 301 redirects if slugs are normalized.

---

## 8. Legacy Dependencies to Discard vs Features to Preserve

### What Must Be Discarded:
1. **WordPress Core & Plugins:** PHP runtime, MySQL overhead, LiteSpeed plugin, Rank Math bloat, WooCommerce residual tables.
2. **Client-side Fetching on Page Render:** Zero prayer times loaded on the client for initial HTML. Everything must be Server-Side Rendered (SSR) / Static Site Generated (SSG).
3. **Heavy Icon Font (`icofont`):** 5.6 MB of TTF, EOT, SVG, WOFF files loaded on mobile. Replace with inline SVG icons (Lucide Icons).
4. **AdSense Blocking Scripts:** AdSense scripts must be loaded cleanly without blocking LCP.

### What Must Be Preserved & Elevated:
1. **Exact Legacy URL Slugs:** `/city/prayer-times-in-[city-name]/` and `/country/prayer-times-in-[country-name]/`.
2. **Search Autocomplete:** Fast search by Arabic and English city name.
3. **Geolocation Detection:** Client-side GPS detection with transparent user permission request (no third-party data leaks).
4. **Monthly Timetable:** Full Hijri and Gregorian monthly prayer calendar rendered on the server.
5. **Next Prayer Live Countdown:** High-performance, tick-accurate countdown component without layout shift.
6. **Embeddable Prayer Times Widget (`/embd/`):** Maintain support for external sites that embed the widget.
7. **Ramadan Imsakia (`/imsakia-ramadan/`):** Maintain this dedicated high-traffic seasonal template.

---

## 9. Migration Risks & Mitigations

| Risk | Impact | Mitigation Strategy |
|---|---|---|
| **URL Trailing Slash Mismatch** | High (404s, link equity loss) | Enforce `trailingSlash: true` in Next.js config to match legacy WordPress Rank Math URLs identically. |
| **AlAdhan API Rate Limiting** | Critical (Site downtime) | Hybrid calculation engine: In-memory/server-cached AlAdhan API fallback combined with local astronomical calculation engine (`adhan-js`) for offline resilience. |
| **Typo Slugs in Legacy URLs** | Medium (Broken links) | Preserve legacy typo routes (`/country/rayer-times-in-india/`, `/country/prayer-times-in-eqypt/`) and implement clean 301 redirects to normalized canonical routes while maintaining backward-compatibility. |
| **Arabic RTL Typography & Mobile CLS** | Medium (UX degradation) | Modern RTL Tailwind CSS with Cairo/Amiri font optimization using `next/font` with zero layout shift. |
| **Stale Monthly Calendars** | Medium (Incorrect prayer times) | ISR (Incremental Static Regeneration) with revalidation at midnight per timezone. |

---

## 10. Audit Sign-off

The Phase 0 audit is complete. All 328 cities, 38 countries, legacy theme templates, API logic, and Google Search Console performance data have been extracted, cataloged, and verified from actual source files. We now proceed to Phase 1: Architecture, SEO Migration Map, and Implementation Plan.
