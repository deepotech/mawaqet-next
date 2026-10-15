# System Architecture & Technical Specification: MawaqetSalat.com Rebuild

**Date:** October 15, 2026  
**Status:** Approved Technical Architecture (Phase 1)

---

## 1. Architectural Philosophy & Objectives

The goal is to rebuild `mawaqetsalat.com` into a modern prayer times platform that rivals `mawaqit.net` in speed, user experience, reliability, and organic search performance.

### Core Principles
1. **Server-First SSR / Static Generation:** Every prayer timetable must be rendered server-side so search engine crawlers and users receive 100% complete HTML on initial byte arrival (zero client-side loading spinners for critical content).
2. **Offline-Resilient Astronomical Engine:** Calculation logic must run natively in the server/application runtime using validated astronomical algorithms, eliminating real-time downtime risks associated with third-party APIs like AlAdhan.
3. **Mobile-First Core Web Vitals:** With **94.6% of users on mobile devices**, JavaScript bundle size, TTFB, and layout stability (Zero Cumulative Layout Shift) are release criteria.
4. **Clean Domain Separation:** Separate astronomical prayer times, mosque iqamah times, jummah schedules, and facility hours.

---

## 2. Technology Stack & ORM Selection

| Component | Selected Technology | Architectural Rationale |
|---|---|---|
| **Framework** | **Next.js App Router (Node.js runtime)** | Server Components, streaming SSR, built-in metadata API, Incremental Static Regeneration (ISR). |
| **Language** | **TypeScript (Strict Mode)** | Full end-to-end type safety across database schemas, prayer algorithms, and UI props. |
| **Styling** | **Tailwind CSS** | Zero runtime CSS overhead, native RTL support (`rtl:` variant), responsive utility design. |
| **Database** | **PostgreSQL** | Industry standard relational persistence for cities, countries, calculation preferences, and future mosque records. |
| **ORM** | **Drizzle ORM** | **Selected over Prisma.** Drizzle provides: (1) Zero runtime overhead, (2) native SQL syntax, (3) instant cold-starts in serverless/edge environments, (4) type-safe schema declaration without heavy binary engines. |
| **Data Validation** | **Zod** | Schema validation for user search input, coordinates, and API payloads. |
| **Prayer Engine** | **`adhan` + Custom Authority Profiles** | Battle-tested astronomical calculation library with custom overrides matching national ministries (e.g. Habous Morocco, Umm Al-Qura, Egyptian Authority). |
| **Testing** | **Vitest & Playwright** | Fast unit and integration tests (Vitest) + cross-browser mobile E2E flows (Playwright). |

---

## 3. High-Level System Architecture

```mermaid
flowchart TD
    subgraph Client["Client Browser (Mobile 94.6% / Desktop)"]
        UI["Next.js UI (RTL, Tailwind CSS)"]
        Countdown["Tick-Accurate Live Countdown Component"]
        Search["Autocomplete City Search (Instant Local Filter)"]
        Geo["Geolocation Hook (Browser GPS with Consent)"]
    end

    subgraph Edge["Edge / Reverse Proxy / Vercel"]
        Router["Next.js App Router"]
        TrailingSlash["Trailing Slash & Typo 301 Redirects"]
        Sitemap["XML Sitemaps (cities, countries, pages)"]
    end

    subgraph Server["Next.js Server / Node.js Runtime"]
        CityPage["Server Component: /city/[slug]"]
        CountryPage["Server Component: /country/[slug]"]
        HomePage["Server Component: /"]
        PrayerService["Core Prayer Times Engine (adhan-js + Profiles)"]
        Drizzle["Drizzle ORM Layer"]
    end

    subgraph Data["Persistence & Cache"]
        DB[(PostgreSQL Database)]
        CityData["Static Seed Data (328 Cities / 38 Countries)"]
    end

    UI --> Edge
    Edge --> Router
    Router --> CityPage
    Router --> CountryPage
    Router --> HomePage
    CityPage --> PrayerService
    CountryPage --> Drizzle
    PrayerService --> CityData
    Drizzle --> DB
```

---

## 4. Prayer-Time Engine Design

### Problem with Legacy Architecture
The legacy site invoked `https://api.aladhan.com/v1/calendarByCity?city=...&country=...` from the client's web browser on every page load. This resulted in:
- Empty tables for crawlers.
- Failures when AlAdhan throttled requests.
- High Latency on mobile 3G/4G connections.

### New Multi-Tier Hybrid Engine (`lib/prayer/`)
1. **Tier 1 — High-Precision Local Astronomical Computation:**
   Using astronomical algorithms based on solar coordinates, equation of time, solar declination, and twilight angles.
   - Calculates daily and 30-day monthly schedules instantly in memory (<1ms).
   - Zero network dependency.
2. **Tier 2 — National Calculation Method Overrides:**
   - **Morocco (`morocco`):** Method 15 (Ministry of Habous and Islamic Affairs). Fajr angle 19°, Isha angle 17°.
   - **Saudi Arabia (`saudi arabia`):** Method 4 (Umm Al-Qura University, Makkah). Fajr angle 18.5°, Isha 90 minutes after Maghrib (120 min during Ramadan).
   - **Egypt (`egypt`):** Method 3 (Egyptian General Authority of Survey). Fajr angle 19.5°, Isha angle 17.5°.
   - **Kuwait (`kuwait`):** Method 9 (Kuwait Ministry). Fajr 18°, Isha 17.5°.
   - **Qatar (`qatar`):** Method 10 (Qatar). Fajr 18°, Isha 90 minutes after Maghrib.
   - **Algeria (`algeria`):** Algerian Ministry of Religious Affairs (Method 3 adjustment).
   - **North America / Europe:** ISNA (Method 2) / Muslim World League (Method 1) / UOIF France (Method 12).
3. **Tier 3 — Optional AlAdhan API Cache-Fill:**
   For cities requiring exact administrative table synchronization, an automated background job queries and caches AlAdhan data into PostgreSQL, falling back seamlessly to Tier 1 astronomical calculation if the API is unreachable.

---

## 5. Country and City Data Model

### Relational Schema (Drizzle ORM)

```typescript
// schema.ts
import { pgTable, serial, text, doublePrecision, integer, timestamp, boolean, varchar } from 'drizzle-orm/pg-core';

export const countries = pgTable('countries', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 120 }).notNull().unique(),
  nameAr: text('name_ar').notNull(),
  nameEn: varchar('name_en', { length: 100 }).notNull(),
  flagCode: varchar('flag_code', { length: 10 }),
  defaultMethod: integer('default_method').notNull().default(8),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const cities = pgTable('cities', {
  id: serial('id').primaryKey(),
  countryId: integer('country_id').references(() => countries.id).notNull(),
  slug: varchar('slug', { length: 150 }).notNull().unique(),
  nameAr: text('name_ar').notNull(),
  nameEn: varchar('name_en', { length: 100 }).notNull(),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  timezone: varchar('timezone', { length: 60 }).notNull(),
  calculationMethod: integer('calculation_method'),
  isPopular: boolean('is_popular').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

---

## 6. Future Mosque Directory Architectural Separation

To allow `mawaqetsalat.com` to evolve into a full competitor to `mawaqit.net`, the database model isolates astronomical prayer times from mosque facilities:

```mermaid
erDiagram
    CITY ||--o{ MOSQUE : contains
    MOSQUE ||--o{ IQAMAH_SCHEDULE : defines
    MOSQUE ||--o{ JUMMAH_SCHEDULE : hosts
    MOSQUE ||--o{ FACILITY_HOURS : operates
    CITY ||--o{ ASTRONOMICAL_TIMES : calculates

    MOSQUE {
        int id PK
        int city_id FK
        string name_ar
        string name_en
        string address
        float latitude
        float longitude
        boolean is_verified
    }
    IQAMAH_SCHEDULE {
        int id PK
        int mosque_id FK
        string prayer_name
        string iqamah_type "fixed_time | offset_minutes"
        string fixed_time
        int offset_minutes
    }
    JUMMAH_SCHEDULE {
        int id PK
        int mosque_id FK
        string first_khutbah_time
        string second_khutbah_time
    }
    FACILITY_HOURS {
        int id PK
        int mosque_id FK
        string day_of_week
        string opens_at
        string closes_at
    }
```

*Architectural Guarantee:* Calculated prayer times are **never** mixed with mosque opening hours or iqamah times.

---

## 7. Performance & Core Web Vitals Targets

| Metric | Target | Optimization Strategy |
|---|---|---|
| **LCP (Largest Contentful Paint)** | `< 1.2s` on Mobile | Server-rendered hero prayer card; zero client hydration delay for table data. |
| **CLS (Cumulative Layout Shift)** | `0.00` | Fixed dimensions for countdown and monthly table grid; no dynamic DOM injection. |
| **INP (Interaction to Next Paint)** | `< 50ms` | Instant client-side search autocomplete using static in-memory trie/filter. |
| **Bundle Size** | `< 75 KB` gzipped | Eliminates jQuery (30 KB), icofont (5.6 MB), and bloated third-party trackers. |

---

## 8. Deployment & Environment Variables

Documented in `.env.example`:
```env
# Application
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://mawaqetsalat.com

# Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/mawaqetsalat

# AlAdhan API Integration (Optional / Fallback cache)
ALADHAN_API_BASE_URL=https://api.aladhan.com/v1

# Analytics & Ads (Preserved from legacy)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-Z3189YVP04
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-6331163447795368
```
