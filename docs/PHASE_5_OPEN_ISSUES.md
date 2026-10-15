# Phase 5 Open Issues, Trade-offs & Staging Recommendations

**Project:** MawaqetSalat.com WordPress-to-Next.js Migration  
**Date:** October 15, 2026  
**Auditor:** Principal Software Architect & Technical Lead  
**Working Directory:** `C:\Users\HP\.gemini\antigravity\scratch\mawaqetsalat`  
**Target:** Staging Deployment Preparation

---

## 1. Resolved Inquiries & Verified Behaviors

### 1.1 The Circular Black "N" Badge
- **Inquiry:** A circular badge with the white letter "N" appears at the bottom of pages during `next dev`.
- **Finding:** Verified definitively as the native Next.js 15 dev indicator (`devIndicators`). It signals development mode status and static generation activity to developers.
- **Resolution:** In production builds (`next build` + `next start`), Next.js completely strips this component. It does NOT appear in production, is not indexed by crawlers, and requires no CSS hacks or workarounds.

### 1.2 Geolocation Implementation Strategy
- **Trade-off:** Client-side GPS vs IP-based geocoding.
- **Resolution:** Implemented explicit client-side GPS matching via W3C Geolocation API + local Haversine distance lookup (`findClosestCity`). This avoids third-party IP geocoding fees, respects user privacy by requiring explicit consent, operates with zero latency, and provides a clear confirmation card showing the matched city and distance in kilometers.

---

## 2. Astronomical Verification Tiers

The dataset maintains clear, honest provenance distinctions:

| Verification Tier | City Count | Description & Source Authority | Page Label |
| :--- | :---: | :--- | :--- |
| **Tier 4 (Independently Verified Benchmark)** | 5 Hubs | Verified against official national calendars and independent astronomical references (Casablanca, Baghdad, Cairo, Riyadh, Istanbul). | `مستوى التحقق 4 (مقارنة معتمدة)` |
| **Tier 3 (Regional Astronomical Standard)** | 323 Cities | Calculated using precise WGS84 coordinates and verified national/regional calculation authorities (MWL, Egyptian Survey, Umm Al-Qura, Moroccan Habous, Diyanet, Gulf). | `مستوى التحقق 3 (حساب فلكي إقليمي)` |

---

## 3. Staging Deployment Checklist & Environment Prerequisites

Before initiating staging deployment, the following environment configurations should be reviewed:

1. **Environment Variables (`.env.production` / Staging Platform Secrets):**
   - `NEXT_PUBLIC_SITE_URL`: Should be set to the staging URL during staging testing (e.g. `https://staging.mawaqetsalat.com` or Vercel preview domain) to allow testing canonical tag generation.
   - `NEXT_PUBLIC_AD_SLOT_HEADER`, `NEXT_PUBLIC_AD_SLOT_AFTER_PT`, `NEXT_PUBLIC_AD_SLOT_AFTER_CITIES`, `NEXT_PUBLIC_AD_SLOT_FOOTER`: Left blank in staging or configured with test AdSense slots.
2. **Search Engine Protection for Staging:**
   - **Crucial Rule:** The staging environment MUST NOT be indexed by search engines to protect existing production SEO rank.
   - Staging servers should emit `X-Robots-Tag: noindex, nofollow` or use HTTP Basic Authentication.
3. **Legacy WordPress Web Server Protection:**
   - Live WordPress site remains completely untouched, maintaining live traffic and advertising revenue uninterrupted.
   - No DNS records or MX records should be changed until full staging sign-off is completed.

---

## 4. Next Phase Roadmap (Phase 6: Staging Deployment & Live Smoke Verification)

Upon user approval to proceed:
1. Configure staging host (Vercel, Cloudflare Pages, or Docker VPS).
2. Validate HTTP headers, SSL, and compression (Brotli/Gzip).
3. Execute end-to-end smoke tests on mobile and desktop devices.
4. Finalize cutover plan and rollback procedure.
