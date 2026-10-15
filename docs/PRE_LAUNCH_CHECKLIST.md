# Pre-Launch Quality & Production Readiness Checklist

**Project:** MawaqetSalat.com Rebuild  
**Status:** Pre-Launch Audit Passed (Phase 3.1)  
**Target Domain:** `https://mawaqetsalat.com/`  

---

## 1. Technical SEO & Indexation Checklist

| Checkpoint | Requirement | Verification Result | Status |
| :--- | :--- | :--- | :--- |
| **Trailing Slash Consistency** | All URLs must enforce trailing slashes (`/`) to match legacy WordPress convention | `trailingSlash: true` enabled in `next.config.ts`. Verified across all routes | ✅ **PASS** |
| **Self-Referential Canonicals** | Every indexable page must output `<link rel="canonical">` matching its public URL | Verified on `/`, `/city/*`, `/country/*`, `/developers/`, `/imsakia-ramadan/`, `/privacy-policy/` | ✅ **PASS** |
| **Sitemap Completeness** | Exactly 370 canonical public URLs matching legacy indexable inventory | Verified at `/sitemap.xml` | ✅ **PASS** |
| **Sitemap Exclusion Integrity** | Exclude redirected (`/sample-page/`), non-indexable (`/embd/`), and API routes | Verified: 0 non-indexable routes in sitemap | ✅ **PASS** |
| **Robots.txt Directives** | Disallow `/api/`, `/_next/`, and `/embd/` while declaring sitemap location | Verified at `/robots.txt` | ✅ **PASS** |
| **Typo Slug Preservation** | High-traffic typos (`eqypt`, `rayer-times-in-india`, `amman_city`) must not 404 | Pre-rendered via SSG; verified returning `200 OK` | ✅ **PASS** |
| **Structured Data (Schema)** | Valid `BreadcrumbList` JSON-LD on all city and country pages | Verified in page components; 0 schema syntax errors | ✅ **PASS** |
| **Page Titles & Meta Descriptions** | Unique Arabic titles including current year and localized city/country context | Verified: 100% of cities and countries possess localized metadata | ✅ **PASS** |

---

## 2. Infrastructure & Application Checklist

| Checkpoint | Requirement | Verification Result | Status |
| :--- | :--- | :--- | :--- |
| **Static Pre-Rendering (SSG)** | All 328 cities and 38 countries pre-rendered into static HTML | `npm run build` compiled 377 static pages | ✅ **PASS** |
| **Live Smoke Testing** | Local HTTP smoke tests against production build | 13/13 representative endpoints returned expected status codes | ✅ **PASS** |
| **TypeScript Integrity** | Strict type checking with 0 type errors | `tsc --noEmit` passed with 0 errors | ✅ **PASS** |
| **Linting Compliance** | 0 ESLint warnings or errors | `next lint` passed with 0 warnings, 0 errors | ✅ **PASS** |
| **Automated Unit Tests** | Automated test suite covering types, geodata, math, and routes | 101/101 tests pass across 8 test suites | ✅ **PASS** |

---

## 3. Advertising & Monetization Checklist

| Checkpoint | Requirement | Verification Result | Status |
| :--- | :--- | :--- | :--- |
| **Publisher ID Verification** | `ads.txt` must contain active publisher identifier | Verified: `google.com, pub-6331163447795368, DIRECT, f08c47fec0942fa0` in `public/ads.txt` | ✅ **PASS** |
| **Environment Variable Guards** | Ads must NOT render in dev/staging when env var is absent | Verified: `AdContainer` returns `null` when `NEXT_PUBLIC_ADSENSE_CLIENT_ID` is unset | ✅ **PASS** |
| **Zero Secrets in Repository** | No live API keys, DB passwords, or publisher tokens in committed code | Verified: `.env.example` contains placeholders only | ✅ **PASS** |
| **Non-Blocking Ad Scripts** | AdSense scripts must not degrade LCP / INP | `next/script` configured with `strategy="afterInteractive"` | ✅ **PASS** |

---

## 4. Remaining Action Items Prior to Production DNS Cutover

1. **Deploy Target & Environment Variables:**
   - Configure hosting provider (e.g. Vercel, Node.js server, or container runtime).
   - Set `NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-6331163447795368` and `NEXT_PUBLIC_GA_ID=G-Z3189YVP04` in production environment settings.
2. **Interactive UI Toggles (Phase 4):**
   - Add browser-side method toggles on Iraqi and Syrian city pages (Sunni MWL vs. Shia Tehran).
   - Add Asr calculation toggle (Standard Shafi'i vs. Hanafi).
3. **Database Relational Sync:**
   - Run Drizzle migration against PostgreSQL when persistent relational features (user accounts, mosque submissions) are activated.
