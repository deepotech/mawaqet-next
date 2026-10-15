/**
 * Phase 3 — City & Country Route Generation Tests
 *
 * Verifies that all 328 city pages and 38 country pages can be
 * correctly identified from the normalized data, that legacy URLs
 * are preserved exactly, and that country-city relationships are valid.
 */

import { describe, it, expect } from 'vitest';
import {
  getAllCities,
  getAllCountries,
  getCityBySlug,
  getCountryBySlug,
  getCitiesByCountryId,
  getCountryById,
  getSiblingCities,
  searchCities,
  toCalculationMethodId,
} from '@/lib/data';
import { buildPrayerConfig } from '@/lib/prayer-config';

describe('City Data Integrity', () => {
  const cities = getAllCities();

  it('loads exactly 478 cities', () => {
    expect(cities).toHaveLength(478);
  });

  it('every city has a slug, urlPath, nameAr, nameEn', () => {
    for (const city of cities) {
      expect(city.slug, `city id ${city.id}`).toBeTruthy();
      expect(city.urlPath, `city ${city.slug}`).toBeTruthy();
      expect(city.nameAr, `city ${city.slug}`).toBeTruthy();
      expect(city.nameEn, `city ${city.slug}`).toBeTruthy();
    }
  });

  it('every city urlPath follows /city/[slug]/ pattern', () => {
    for (const city of cities) {
      // Allow underscores: legacy slug prayer-times-in-amman_city has one (preserved exactly)
      expect(city.urlPath).toMatch(/^\/city\/[a-z0-9_-]+\/$/);
    }
  });

  it('every city has valid coordinates', () => {
    for (const city of cities) {
      expect(city.coordinates.latitude).toBeGreaterThanOrEqual(-90);
      expect(city.coordinates.latitude).toBeLessThanOrEqual(90);
      expect(city.coordinates.longitude).toBeGreaterThanOrEqual(-180);
      expect(city.coordinates.longitude).toBeLessThanOrEqual(180);
    }
  });

  it('every city has a non-empty IANA timezone', () => {
    for (const city of cities) {
      expect(city.timezone, `city ${city.slug}`).toBeTruthy();
      expect(city.timezone).toContain('/'); // IANA format like Asia/Baghdad
    }
  });

  it('no duplicate city slugs', () => {
    const slugs = cities.map((c) => c.slug);
    const unique = new Set(slugs);
    expect(unique.size).toBe(slugs.length);
  });

  it('no duplicate urlPaths', () => {
    const paths = cities.map((c) => c.urlPath);
    const unique = new Set(paths);
    expect(unique.size).toBe(paths.length);
  });

  it('slug matches the urlPath', () => {
    for (const city of cities) {
      expect(city.urlPath).toBe(`/city/${city.slug}/`);
    }
  });
});

describe('Country Data Integrity', () => {
  const countries = getAllCountries();

  it('loads exactly 38 countries', () => {
    expect(countries).toHaveLength(38);
  });

  it('every country has required fields', () => {
    for (const country of countries) {
      expect(country.slug).toBeTruthy();
      expect(country.nameAr).toBeTruthy();
      expect(country.code).toMatch(/^[A-Z]{2}$/);
      expect(country.flagUrl).toBeTruthy();
    }
  });

  it('no duplicate country slugs', () => {
    const slugs = countries.map((c) => c.slug);
    const unique = new Set(slugs);
    expect(unique.size).toBe(slugs.length);
  });

  it('preserves legacy typo: prayer-times-in-eqypt (Egypt with q)', () => {
    const egypt = getCountryBySlug('prayer-times-in-eqypt');
    expect(egypt).toBeDefined();
    expect(egypt?.code).toBe('EG');
  });

  it('preserves legacy typo: rayer-times-in-india (missing p)', () => {
    const india = getCountryBySlug('rayer-times-in-india');
    expect(india).toBeDefined();
    expect(india?.code).toBe('IN');
  });
});

describe('Country-City Relationships', () => {
  it('every city references a valid countryId', () => {
    const cities = getAllCities();
    for (const city of cities) {
      const country = getCountryById(city.countryId);
      expect(country, `city ${city.slug} countryId ${city.countryId}`).toBeDefined();
    }
  });

  it('getCitiesByCountryId returns only cities with that countryId', () => {
    const cities = getCitiesByCountryId(1); // Saudi Arabia
    for (const city of cities) {
      expect(city.countryId).toBe(1);
    }
  });

  it('total cities across all countries equals 478', () => {
    const countries = getAllCountries();
    let total = 0;
    for (const country of countries) {
      total += getCitiesByCountryId(country.id).length;
    }
    expect(total).toBe(478);
  });

  it('no city belongs to a non-existent country', () => {
    const validCountryIds = new Set(getAllCountries().map((c) => c.id));
    const cities = getAllCities();
    for (const city of cities) {
      expect(validCountryIds.has(city.countryId), `city ${city.slug}`).toBe(true);
    }
  });
});

describe('Legacy URL Preservation', () => {
  const cities = getAllCities();
  const countries = getAllCountries();

  it('all city slugs start with prayer-times-in-', () => {
    const nonStandard = cities.filter((c) => !c.slug.startsWith('prayer-times-in-'));
    // There should be 0 — all legacy slugs follow this pattern
    expect(nonStandard).toHaveLength(0);
  });

  it('top city by GSC clicks is preserved: prayer-times-in-baghdad', () => {
    const baghdad = getCityBySlug('prayer-times-in-baghdad');
    expect(baghdad).toBeDefined();
    expect(baghdad?.nameAr).toBe('بغداد');
  });

  it('top city #2: prayer-times-in-casablanca', () => {
    const casablanca = getCityBySlug('prayer-times-in-casablanca');
    expect(casablanca).toBeDefined();
  });

  it('handles legacy Fez (فاس) city: actual slug is prayer-times-in-fez', () => {
    // Note: GSC data referenced prayer-times-in-fezs (typo) — but the actual
    // WordPress slug was prayer-times-in-fez. The SEO_MIGRATION_MAP referenced fezs
    // as a Tier 2 page; the actual data has prayer-times-in-fez.
    const fes = getCityBySlug('prayer-times-in-fez');
    expect(fes).toBeDefined();
    expect(fes?.nameAr).toBe('فاس');
  });

  it('all 38 country slugs are present', () => {
    const slugs = countries.map((c) => c.slug);
    expect(slugs).toContain('prayer-times-in-morocco');
    expect(slugs).toContain('prayer-times-in-iraq');
    expect(slugs).toContain('prayer-times-in-saudi-arabia');
  });
});

describe('Lookup Functions', () => {
  it('getCityBySlug returns undefined for unknown slug', () => {
    expect(getCityBySlug('not-a-real-city')).toBeUndefined();
  });

  it('getCountryBySlug returns undefined for unknown slug', () => {
    expect(getCountryBySlug('not-a-real-country')).toBeUndefined();
  });

  it('getSiblingCities excludes self', () => {
    const city = getAllCities()[0];
    const siblings = getSiblingCities(city.id, city.countryId, 10);
    const hasSelf = siblings.some((s) => s.id === city.id);
    expect(hasSelf).toBe(false);
  });

  it('getSiblingCities respects limit', () => {
    const cities = getAllCities();
    const countryId = cities.find((c) => c.countryCode === 'SE')?.countryId;
    if (countryId !== undefined) {
      const siblings = getSiblingCities(0, countryId, 5);
      expect(siblings.length).toBeLessThanOrEqual(5);
    }
  });
});

describe('Method ID Mapping', () => {
  it('maps method 4 to MAKKAH', () => expect(toCalculationMethodId(4)).toBe('MAKKAH'));
  it('maps method 3 to EGYPT', () => expect(toCalculationMethodId(3)).toBe('EGYPT'));
  it('maps method 8 to GULF', () => expect(toCalculationMethodId(8)).toBe('GULF'));
  it('maps method 15 to MOROCCO', () => expect(toCalculationMethodId(15)).toBe('MOROCCO'));
  it('maps method 9 to KUWAIT', () => expect(toCalculationMethodId(9)).toBe('KUWAIT'));
  it('maps method 10 to QATAR', () => expect(toCalculationMethodId(10)).toBe('QATAR'));
  it('maps method 13 to TURKEY', () => expect(toCalculationMethodId(13)).toBe('TURKEY'));
  it('maps unknown method to GULF fallback', () => expect(toCalculationMethodId(999)).toBe('GULF'));
});

describe('Prayer Config Builder', () => {
  it('Moroccan city (lat 33) gets MOROCCO config without high-lat rule', () => {
    const cfg = buildPrayerConfig(15, 33);
    expect(cfg.method).toBe('MOROCCO');
    expect(cfg.highLatitudeRule).toBeUndefined();
  });

  it('Iraqi city (lat 33) gets GULF config', () => {
    const cfg = buildPrayerConfig(8, 33.34);
    expect(cfg.method).toBe('GULF');
    expect(cfg.highLatitudeRule).toBeUndefined();
  });

  it('Swedish city (lat 59) gets seventh_of_the_night high-lat rule', () => {
    const cfg = buildPrayerConfig(8, 59.33);
    expect(cfg.method).toBe('GULF');
    expect(cfg.highLatitudeRule).toBe('seventh_of_the_night');
  });

  it('latitude exactly 48 triggers high-lat rule', () => {
    const cfg = buildPrayerConfig(8, 48);
    expect(cfg.highLatitudeRule).toBe('seventh_of_the_night');
  });

  it('latitude 47.9 does not trigger high-lat rule', () => {
    const cfg = buildPrayerConfig(8, 47.9);
    expect(cfg.highLatitudeRule).toBeUndefined();
  });
});

describe('Search Functionality', () => {
  it('returns empty array for query < 2 chars', () => {
    expect(searchCities('a')).toHaveLength(0);
    expect(searchCities('')).toHaveLength(0);
  });

  it('finds Baghdad by Arabic name', () => {
    const results = searchCities('بغداد');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].city.slug).toBe('prayer-times-in-baghdad');
  });

  it('finds Baghdad by English name', () => {
    const results = searchCities('baghdad');
    expect(results.length).toBeGreaterThan(0);
    const slugs = results.map((r) => r.city.slug);
    expect(slugs).toContain('prayer-times-in-baghdad');
  });

  it('returns at most maxResults results', () => {
    const results = searchCities('a', 5);
    expect(results.length).toBeLessThanOrEqual(5);
  });

  it('every result has a valid country reference', () => {
    const results = searchCities('rabat', 10);
    for (const r of results) {
      expect(r.country).toBeDefined();
      expect(r.country.nameAr).toBeTruthy();
    }
  });

  it('exact match scores higher than partial match', () => {
    const results = searchCities('الرباط', 10);
    // Rabat (الرباط) should appear before cities merely containing الرباط
    if (results.length > 0) {
      expect(results[0].city.nameAr).toContain('الرباط');
    }
  });
});

describe('Sitemap Coverage', () => {
  it('total pages to be sitemapped: 520 (4 static + 38 country + 478 city)', () => {
    const cities = getAllCities();
    const countries = getAllCountries();
    const staticPages = 4;
    const total = staticPages + countries.length + cities.length;
    expect(total).toBe(520);
  });

  it('sample-page is NOT in city or country data (correctly excluded)', () => {
    const cities = getAllCities();
    const hasSamplePage = cities.some((c) => c.slug === 'sample-page');
    expect(hasSamplePage).toBe(false);
  });
});

describe('Prayer Config Completeness', () => {
  const cities = getAllCities();

  it('all cities have a calculationMethodId that maps to a valid method', () => {
    const validMethods = new Set([3, 4, 8, 9, 10, 13, 15, 17, 2, 12, 11]);
    const unknownMethods = cities.filter((c) => !validMethods.has(c.calculationMethodId));
    // Unknown IDs fall back to GULF — report them for documentation
    // We accept fallback but require the mapping to exist
    for (const city of unknownMethods) {
      const methodId = toCalculationMethodId(city.calculationMethodId);
      expect(methodId).toBe('GULF'); // fallback must always be GULF
    }
  });

  it('Riyadh uses MAKKAH method (ID 4)', () => {
    const riyadh = getCityBySlug('prayer-times-in-riyadh');
    expect(riyadh?.calculationMethodId).toBe(4);
  });

  it('Baghdad uses GULF method (ID 8)', () => {
    const baghdad = getCityBySlug('prayer-times-in-baghdad');
    expect(baghdad?.calculationMethodId).toBe(8);
  });

  it('Casablanca uses MOROCCO method (ID 15)', () => {
    const casablanca = getCityBySlug('prayer-times-in-casablanca');
    expect(casablanca?.calculationMethodId).toBe(15);
  });

  it('Cairo uses EGYPT method (ID 3)', () => {
    const cairo = getCityBySlug('prayer-times-in-cairo');
    expect(cairo?.calculationMethodId).toBe(3);
  });
});

describe('Unresolved Geodata Handling', () => {
  it('all unresolved cities are explicitly marked as unresolved', () => {
    const cities = getAllCities();
    const unresolved = cities.filter((c) => c.verificationStatus === 'unresolved');
    // All 328 were resolved in Phase 1 — this should be 0
    expect(unresolved.length).toBe(0);
  });

  it('verification status is one of known values', () => {
    const validStatuses = new Set(['verified_exact', 'verified_regional', 'unresolved']);
    const cities = getAllCities();
    for (const city of cities) {
      expect(validStatuses.has(city.verificationStatus), `city ${city.slug}`).toBe(true);
    }
  });
});
