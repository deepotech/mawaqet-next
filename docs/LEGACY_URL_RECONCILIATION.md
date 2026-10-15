# Legacy URL Reconciliation & Preservation Audit

**Domain:** `https://mawaqetsalat.com/`  
**Audit Date:** October 14, 2026  
**Auditor:** Senior Next.js Engineer & Technical SEO Specialist  
**Status:** 100% Reconciled & Runtime Smoke-Tested  

---

## 1. Executive Reconciliation & Mutual Exclusivity

In the previous Phase 3 report, `/sample-page/` was erroneously tallied under both "Redirected" and "Retired", causing an apparent discrepancy with the 372 published legacy URLs. Furthermore, 4 static pages (`/developers/`, `/embd/`, `/imsakia-ramadan/`, `/سياسة-الخصوصية/`) were listed as preserved but were missing actual Next.js App Router implementations in `src/app/`.

### Verified Mutually Exclusive Breakdown (Total: 372 URLs)

| Classification | Count | Description & Routes | HTTP Status |
| :--- | :--- | :--- | :--- |
| **Preserved Exact (City Pages)** | **328** | `/city/[slug]/` — All 328 legacy city landing pages pre-rendered via SSG | `200 OK` |
| **Preserved Exact (Country Pages)** | **38** | `/country/[slug]/` — All 38 legacy country landing pages pre-rendered via SSG (including legacy typo slugs `prayer-times-in-eqypt` and `rayer-times-in-india`) | `200 OK` |
| **Preserved Exact (Homepage)** | **1** | `/` — Statically pre-rendered homepage with search and directories | `200 OK` |
| **Preserved Exact (Static Application Pages)** | **4** | `/developers/`, `/embd/`, `/imsakia-ramadan/`, `/سياسة-الخصوصية/` (plus rewrite alias `/%d8%b3%d9%8a%d8%a7%d8%b3%d8%a9-%d8%a7%d9%84%d8%ae%d8%b5%d9%88%d8%b5%d9%8a%d8%a9/`) | `200 OK` |
| **Intentionally Redirected (Retired)** | **1** | `/sample-page/` — Default WordPress boilerplate page with 0 clicks/impressions. Permanently redirected to `/` via middleware | `301 Moved Permanently` |
| **Unresolved URLs** | **0** | No unaccounted-for legacy URLs exist | — |
| **Total Published Legacy URLs** | **372** | Exactly matches the MySQL database dump (`wp_posts` where `post_status='publish'`) | — |

---

## 2. High-Value Legacy Landing Pages Audit (Top 25 Organic URLs)

Every single high-authority landing page with historical traffic in Google Search Console is preserved identically:

| Rank | Legacy URL Path | 6-Mo Clicks | 6-Mo Impressions | Action | Verified Route | Runtime Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `/city/prayer-times-in-baghdad/` | 1,285 | 1,246,457 | preserve_exact | `/city/prayer-times-in-baghdad/` | `200 OK` |
| 2 | `/city/prayer-times-in-casablanca/` | 649 | 131,694 | preserve_exact | `/city/prayer-times-in-casablanca/` | `200 OK` |
| 3 | `/city/prayer-times-in-erbil/` | 630 | 241,508 | preserve_exact | `/city/prayer-times-in-erbil/` | `200 OK` |
| 4 | `/city/prayer-times-in-najaf/` | 563 | 351,432 | preserve_exact | `/city/prayer-times-in-najaf/` | `200 OK` |
| 5 | `/city/prayer-times-in-agadir/` | 436 | 58,499 | preserve_exact | `/city/prayer-times-in-agadir/` | `200 OK` |
| 6 | `/city/prayer-times-in-basra/` | 391 | 370,614 | preserve_exact | `/city/prayer-times-in-basra/` | `200 OK` |
| 7 | `/city/prayer-times-in-beni-mellal/` | 390 | 44,524 | preserve_exact | `/city/prayer-times-in-beni-mellal/` | `200 OK` |
| 8 | `/city/prayer-times-in-safi/` | 373 | 116,486 | preserve_exact | `/city/prayer-times-in-safi/` | `200 OK` |
| 9 | `/city/prayer-times-in-temara/` | 362 | 68,083 | preserve_exact | `/city/prayer-times-in-temara/` | `200 OK` |
| 10 | `/city/prayer-times-in-oujda/` | 261 | 93,007 | preserve_exact | `/city/prayer-times-in-oujda/` | `200 OK` |
| 11 | `/city/prayer-times-in-rabat/` | 244 | 52,103 | preserve_exact | `/city/prayer-times-in-rabat/` | `200 OK` |
| 12 | `/city/prayer-times-in-homs/` | 185 | 319,514 | preserve_exact | `/city/prayer-times-in-homs/` | `200 OK` |
| 13 | `/city/prayer-times-in-berkane/` | 180 | 101,022 | preserve_exact | `/city/prayer-times-in-berkane/` | `200 OK` |
| 14 | `/city/prayer-times-in-errachidia/` | 177 | 44,028 | preserve_exact | `/city/prayer-times-in-errachidia/` | `200 OK` |
| 15 | `/city/prayer-times-in-damascus/` | 162 | 222,013 | preserve_exact | `/city/prayer-times-in-damascus/` | `200 OK` |
| 16 | `/city/prayer-times-in-sulaymaniyah/` | 159 | 40,736 | preserve_exact | `/city/prayer-times-in-sulaymaniyah/` | `200 OK` |
| 17 | `/city/prayer-times-in-mosul/` | 152 | 93,124 | preserve_exact | `/city/prayer-times-in-mosul/` | `200 OK` |
| 18 | `/city/prayer-times-in-marrakesh/` | 137 | 41,085 | preserve_exact | `/city/prayer-times-in-marrakesh/` | `200 OK` |
| 19 | `/city/prayer-times-in-tangier/` | 135 | 25,668 | preserve_exact | `/city/prayer-times-in-tangier/` | `200 OK` |
| 20 | `/city/prayer-times-in-sale/` | 129 | 28,141 | preserve_exact | `/city/prayer-times-in-sale/` | `200 OK` |
| 21 | `/city/prayer-times-in-meknes/` | 122 | 21,988 | preserve_exact | `/city/prayer-times-in-meknes/` | `200 OK` |
| 22 | `/city/prayer-times-in-nador/` | 116 | 79,285 | preserve_exact | `/city/prayer-times-in-nador/` | `200 OK` |
| 23 | `/city/prayer-times-in-latakia/` | 114 | 98,393 | preserve_exact | `/city/prayer-times-in-latakia/` | `200 OK` |
| 24 | `/city/prayer-times-in-kenitra/` | 106 | 24,082 | preserve_exact | `/city/prayer-times-in-kenitra/` | `200 OK` |
| 25 | `/city/prayer-times-in-tetouan/` | 105 | 23,285 | preserve_exact | `/city/prayer-times-in-tetouan/` | `200 OK` |

---

## 3. Typo Slugs, Percent-Encoded Paths & Aliasing

1. **Egypt Country Slug:**
   - Legacy URL: `/country/prayer-times-in-eqypt/` (spelled with `q`).
   - Resolution: Statically pre-rendered as the canonical page. Confirmed returning `200 OK`.
2. **India Country Slug:**
   - Legacy URL: `/country/rayer-times-in-india/` (missing leading `p`).
   - Resolution: Statically pre-rendered as canonical page. Confirmed returning `200 OK`.
3. **Amman City Slug:**
   - Legacy URL: `/city/prayer-times-in-amman_city/` (contains underscore).
   - Resolution: Statically pre-rendered as canonical page. Confirmed returning `200 OK`.
4. **Fez City Slug:**
   - Legacy URL: `/city/prayer-times-in-fez/`.
   - Resolution: Statically pre-rendered as canonical page. Confirmed returning `200 OK`.
5. **Arabic Privacy Policy Path:**
   - Incoming forms: `/سياسة-الخصوصية/` and `/%D8%B3%D9%8A%D8%A7%D8%B3%D8%A9-%D8%A7%D9%84%D8%AE%D8%B5%D9%88%D8%B5%D9%8A%D8%A9/`.
   - Resolution: Handled via Next.js internal rewrites in `next.config.ts` mapping to `/privacy-policy/`. Confirmed returning `200 OK` without redirect loops or encoding mismatches.

---

## 4. Sitemap URL Reconciliation (370 Canonical Indexable URLs)

The sitemap contains **370 public indexable canonical URLs**:
- **1** Homepage (`https://mawaqetsalat.com/`)
- **38** Country pages (`https://mawaqetsalat.com/country/.../`)
- **328** City pages (`https://mawaqetsalat.com/city/.../`)
- **3** Public static tools/pages:
  - `https://mawaqetsalat.com/imsakia-ramadan/`
  - `https://mawaqetsalat.com/developers/`
  - `https://mawaqetsalat.com/%D8%B3%D9%8A%D8%A7%D8%B3%D8%A9-%D8%A7%D9%84%D8%AE%D8%B5%D9%88%D8%B5%D9%8A%D8%A9/`

**Excluded from Sitemap (By Design):**
1. `https://mawaqetsalat.com/sample-page/`: Excluded because it is 301 redirected to `/`.
2. `https://mawaqetsalat.com/embd/`: Excluded and marked `noindex` because it is an iframe widget designed for third-party embeds, not a search landing page (disallowed in `robots.txt`).
