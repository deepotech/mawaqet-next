# SEO Migration Map & URL Inventory: MawaqetSalat.com

**Date:** October 15, 2026  
**Target:** 100% SEO Value Preservation & Organic Visibility Expansion  
**Status:** Approved Specification (Phase 1)

---

## 1. URL Inventory & Classification

Across the Google Search Console export and WordPress sitemaps, we cataloged all 372 canonical URLs.

| Classification | Count | Legacy URL Structure | Action |
|---|---|---|---|
| **Homepage** | 1 | `https://mawaqetsalat.com/` | **Preserve Exact URL** |
| **City Prayer Pages** | 328 | `/city/prayer-times-in-[city-slug]/` | **Preserve Exact URL** (100% slug parity) |
| **Country Prayer Pages** | 38 | `/country/prayer-times-in-[country-slug]/` | **Preserve Exact URL** + 301 alias mappings |
| **Static Utility Pages** | 4 | `/imsakia-ramadan/`, `/developers/`, `/embd/`, `/%d8%b3%d9%8a%d8%a7%d8%b3%d8%a9-%d8%a7%d9%84%d8%ae%d8%b5%d9%88%d8%b5%d9%8a%d8%a9/` | **Preserve Exact URL** |
| **Legacy Junk Pages** | 1 | `/sample-page/` | **410 Gone / 301 Redirect to Homepage** |

---

## 2. High-Value Priority 1 (P1) City Pages

These top 30 city pages generate over 85% of total search visibility. They require zero downtime, zero URL changes, and instantaneous TTFB.

| Rank | Legacy URL | Monthly Impressions | Clicks | Next.js Target Path | Action |
|---|---|---|---|---|---|
| 1 | `/city/prayer-times-in-baghdad/` | 1,246,457 | 1,285 | `/city/prayer-times-in-baghdad/` | Preserve |
| 2 | `/city/prayer-times-in-casablanca/` | 131,694 | 649 | `/city/prayer-times-in-casablanca/` | Preserve |
| 3 | `/city/prayer-times-in-erbil/` | 241,508 | 630 | `/city/prayer-times-in-erbil/` | Preserve |
| 4 | `/city/prayer-times-in-najaf/` | 351,432 | 563 | `/city/prayer-times-in-najaf/` | Preserve |
| 5 | `/city/prayer-times-in-agadir/` | 58,499 | 436 | `/city/prayer-times-in-agadir/` | Preserve |
| 6 | `/city/prayer-times-in-basra/` | 370,614 | 391 | `/city/prayer-times-in-basra/` | Preserve |
| 7 | `/city/prayer-times-in-beni-mellal/` | 44,524 | 390 | `/city/prayer-times-in-beni-mellal/` | Preserve |
| 8 | `/city/prayer-times-in-safi/` | 116,486 | 373 | `/city/prayer-times-in-safi/` | Preserve |
| 9 | `/city/prayer-times-in-temara/` | 68,083 | 362 | `/city/prayer-times-in-temara/` | Preserve |
| 10 | `/city/prayer-times-in-oujda/` | 93,007 | 261 | `/city/prayer-times-in-oujda/` | Preserve |
| 11 | `/city/prayer-times-in-rabat/` | 52,103 | 244 | `/city/prayer-times-in-rabat/` | Preserve |
| 12 | `/city/prayer-times-in-homs/` | 319,514 | 185 | `/city/prayer-times-in-homs/` | Preserve |
| 13 | `/city/prayer-times-in-berkane/` | 101,022 | 180 | `/city/prayer-times-in-berkane/` | Preserve |
| 14 | `/city/prayer-times-in-errachidia/` | 44,028 | 177 | `/city/prayer-times-in-errachidia/` | Preserve |
| 15 | `/city/prayer-times-in-sharm-el-sheikh/` | 237,898 | 166 | `/city/prayer-times-in-sharm-el-sheikh/` | Preserve |
| 16 | `/city/prayer-times-in-al-hasakah/` | 135,279 | 156 | `/city/prayer-times-in-al-hasakah/` | Preserve |
| 17 | `/city/prayer-times-in-al-hoceima/` | 120,956 | 154 | `/city/prayer-times-in-al-hoceima/` | Preserve |
| 18 | `/city/prayer-times-in-mohammedia/` | 121,004 | 148 | `/city/prayer-times-in-mohammedia/` | Preserve |
| 19 | `/city/prayer-times-in-settat/` | 112,014 | 148 | `/city/prayer-times-in-settat/` | Preserve |
| 20 | `/city/prayer-times-in-riyadh/` | 183,954 | 147 | `/city/prayer-times-in-riyadh/` | Preserve |
| 21 | `/city/prayer-times-in-kenitra/` | 36,873 | 144 | `/city/prayer-times-in-kenitra/` | Preserve |
| 22 | `/city/prayer-times-in-constantine/` | 18,327 | 144 | `/city/prayer-times-in-constantine/` | Preserve |
| 23 | `/city/prayer-times-in-nador/` | 56,030 | 110 | `/city/prayer-times-in-nador/` | Preserve |
| 24 | `/city/prayer-times-in-tartus/` | 280,939 | 99 | `/city/prayer-times-in-tartus/` | Preserve |
| 25 | `/city/prayer-times-in-sanaa/` | 42,003 | 97 | `/city/prayer-times-in-sanaa/` | Preserve |
| 26 | `/city/prayer-times-in-barcelona/` | 10,177 | 94 | `/city/prayer-times-in-barcelona/` | Preserve |
| 27 | `/city/prayer-times-in-khouribga/` | 48,405 | 89 | `/city/prayer-times-in-khouribga/` | Preserve |
| 28 | `/city/prayer-times-in-port-sudan/` | 64,607 | 88 | `/city/prayer-times-in-port-sudan/` | Preserve |
| 29 | `/city/prayer-times-in-aden/` | 15,767 | 80 | `/city/prayer-times-in-aden/` | Preserve |
| 30 | `/city/prayer-times-in-tabuk/` | 301,373 | 77 | `/city/prayer-times-in-tabuk/` | Preserve |

---

## 3. Permanent 301 Redirect Mappings (Legacy Typo & Anomaly Resolution)

Several legacy URLs contain spelling errors or inconsistencies that rank or exist in historical indexes. These must be permanently redirected to their canonical target with HTTP 301:

| Legacy Source URL | HTTP Status | Canonical Target URL | Rationale |
|---|---|---|---|
| `/country/rayer-times-in-india/` | **301 Permanent** | `/country/prayer-times-in-india/` | Fixed legacy typo (`rayer` -> `prayer`). Legacy URL also served directly as an alias if crawled. |
| `/country/prayer-times-in-eqypt/` | **301 Permanent** | `/country/prayer-times-in-egypt/` | Fixed legacy typo (`eqypt` -> `egypt`). Legacy URL preserved as alias. |
| `/country/prayer-times-in-united_arab_emirates/` | **301 Permanent** | `/country/prayer-times-in-united-arab-emirates/` | Hyphen standard normalization. Legacy alias preserved. |
| `/sample-page/` | **301 Permanent** | `/` | Retirement of default unconfigured WordPress sample page. |
| `/wp-admin/*` | **404 / 410** | — | Drop legacy WordPress admin endpoints cleanly. |
| `/wp-content/*` | **410 Gone** | — | Cleanly retire defunct legacy theme asset paths. |
| `/xmlrpc.php` | **410 Gone** | — | Security & bot crawl reduction. |

---

## 4. Canonical & Trailing Slash Policy

- **Global Trailing Slash Rule:**  
  Set `trailingSlash: true` in `next.config.ts`.  
  *Justification:* WordPress with Rank Math strictly canonicalized every URL with a trailing slash (`/city/prayer-times-in-baghdad/`). Changing to slash-free URLs would trigger domain-wide redirect hops or duplicate indexing.
- **Protocol & Host:** Strict `https://mawaqetsalat.com`. Any `http://` or `www.` request will 301 redirect at the edge/middleware to `https://mawaqetsalat.com/.../`.
- **Self-referential Canonical Tag:** Every page will render:
  ```html
  <link rel="canonical" href="https://mawaqetsalat.com/city/prayer-times-in-baghdad/" />
  ```

---

## 5. Metadata & Title Optimization

### Title Templates
- **Homepage:**
  `مواقيت الصلاة اليوم ومواعيد الأذان لجميع المدن | مواقيت الصلاة`
- **City Page:**
  `مواقيت الصلاة في [اسم المدينة] اليوم | مواعيد الأذان لشهر [الشهر الحالي] [السنة]`
  *Example:* `مواقيت الصلاة في بغداد اليوم | مواعيد الأذان لشهر أكتوبر 2026`
- **Country Page:**
  `مواقيت الصلاة في [اسم الدولة] ومواعيد الأذان لجميع المدن`
  *Example:* `مواقيت الصلاة في المغرب ومواعيد الأذان لجميع المدن`
- **Ramadan Imsakia:**
  `إمساكية رمضان [السنة الهجرية] - [السنة الميلادية] | مواقيت الإمساك والإفطار`

### Meta Description Templates
- **City Page:**
  `احصل على مواقيت الصلاة اليوم في [اسم المدينة] (الفجر، الشروق، الظهر، العصر، المغرب، العشاء) مع العد التنازلي للأذان القادم والجدول الشهري المعتمد.`
  *(Concise, under 155 characters, high CTR action verbs, mobile-optimized).*

---

## 6. Structured Data (Schema.org JSON-LD)

Every city page will emit valid, content-backed JSON-LD:
```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://mawaqetsalat.com/#website",
      "url": "https://mawaqetsalat.com/",
      "name": "مواقيت الصلاة",
      "description": "مواقيت الصلاة ومواعيد الأذان لجميع دول ومدن العالم",
      "inLanguage": "ar"
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://mawaqetsalat.com/city/prayer-times-in-baghdad/#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "الرئيسية",
          "item": "https://mawaqetsalat.com/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "العراق",
          "item": "https://mawaqetsalat.com/country/prayer-times-in-iraq/"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "بغداد",
          "item": "https://mawaqetsalat.com/city/prayer-times-in-baghdad/"
        }
      ]
    }
  ]
}
```

---

## 7. XML Sitemap Strategy

To replicate the indexed Rank Math sitemap structure and maintain instant discoverability for Googlebot:

- `/sitemap.xml` (Index sitemap):
  - `https://mawaqetsalat.com/sitemaps/pages.xml` (Homepage, static pages)
  - `https://mawaqetsalat.com/sitemaps/countries.xml` (38 country pages)
  - `https://mawaqetsalat.com/sitemaps/cities-1.xml` (First 200 cities)
  - `https://mawaqetsalat.com/sitemaps/cities-2.xml` (Remaining 128 cities)

Generated automatically at build/request time using Next.js App Router dynamic sitemap routes (`app/sitemap.ts`).

---

## 8. Robots.txt Specification

```txt
User-agent: *
Allow: /
Disallow: /api/
Disallow: /wp-admin/
Disallow: /wp-content/

Sitemap: https://mawaqetsalat.com/sitemap.xml
```

---

## 9. Automated Testing for SEO Preservation

Before cutover, automated Vitest and Playwright test suites will assert:
1. All 328 legacy city URLs return HTTP 200 with matching `<title>`, `canonical`, and non-empty server-rendered prayer table HTML.
2. All 38 country URLs return HTTP 200 with list of child city links.
3. Typo URLs (`rayer-times-in-india`, `prayer-times-in-eqypt`) return 301 redirects or serve canonical content without 404s.
4. Sitemap XML is well-formed XML and contains exactly 0 broken URLs.
5. Trailing slash consistency: requesting any path without a trailing slash responds with a 308/301 redirect to the trailing slash version.
