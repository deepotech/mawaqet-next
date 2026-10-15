/**
 * Data access layer for normalized city and country records.
 * Reads from static JSON files generated in Phase 1.
 * Used by generateStaticParams, page components, and the search API.
 */

import citiesRaw from '../../data/normalized/cities.json';
import countriesRaw from '../../data/normalized/countries.json';
import { CalculationMethodId } from '@/types/prayer';

// ─── Raw types matching the JSON schema ──────────────────────────────────────

export interface RawCity {
  id: number;
  countryId: number;
  countryCode: string;
  slug: string;
  urlPath: string;
  nameAr: string;
  nameEn: string;
  coordinates: { latitude: number; longitude: number };
  timezone: string;
  calculationMethodId: number;
  seoTitle: string;
  seoDescription: string;
  contentAr: string;
  legacyPostId: number;
  verificationStatus: 'verified_exact' | 'verified_regional' | 'unresolved';
  enrichmentSource?: string;
  notes?: string;
}

export interface RawCountry {
  id: number;
  slug: string;
  nameAr: string;
  nameEn: string;
  code: string;
  flagUrl: string;
  defaultMethodId: number;
  contentAr: string;
  legacyPostId: number;
  totalCities: number;
}

// ─── Map legacy numeric method IDs to domain CalculationMethodId ─────────────

const METHOD_ID_MAP: Record<number, CalculationMethodId> = {
  3:  'EGYPT',
  4:  'MAKKAH',
  7:  'FRANCE',
  8:  'GULF',
  9:  'KUWAIT',
  10: 'QATAR',
  13: 'TURKEY',
  15: 'MOROCCO',
  17: 'TEHRAN',
  2:  'ISNA',
  12: 'KARACHI',
  11: 'SINGAPORE',
};

export function toCalculationMethodId(numericId: number): CalculationMethodId {
  return METHOD_ID_MAP[numericId] ?? 'GULF';
}

// ─── Typed accessor functions ─────────────────────────────────────────────────

const cities = citiesRaw as RawCity[];
const countries = countriesRaw as RawCountry[];

// O(1) Lookups using Map caches
const cityBySlugMap = new Map<string, RawCity>(cities.map((c) => [c.slug, c]));
const countryBySlugMap = new Map<string, RawCountry>(countries.map((c) => [c.slug, c]));
const countryByIdMap = new Map<number, RawCountry>(countries.map((c) => [c.id, c]));
const citiesByCountryIdMap = new Map<number, RawCity[]>();
for (const city of cities) {
  const existing = citiesByCountryIdMap.get(city.countryId);
  if (existing) {
    existing.push(city);
  } else {
    citiesByCountryIdMap.set(city.countryId, [city]);
  }
}

/** All 328 cities */
export function getAllCities(): RawCity[] {
  return cities;
}

/** All 38 countries */
export function getAllCountries(): RawCountry[] {
  return countries;
}

/** City by exact slug (O(1) with Map index) */
export function getCityBySlug(slug: string): RawCity | undefined {
  return cityBySlugMap.get(slug);
}

/** Country by exact slug (O(1) with Map index) */
export function getCountryBySlug(slug: string): RawCountry | undefined {
  return countryBySlugMap.get(slug);
}

/** Cities belonging to a specific country (O(1) with Map index) */
export function getCitiesByCountryId(countryId: number): RawCity[] {
  return citiesByCountryIdMap.get(countryId) ?? [];
}

/** Country for a given city (O(1) with Map index) */
export function getCountryById(countryId: number): RawCountry | undefined {
  return countryByIdMap.get(countryId);
}

/** Sibling cities (same country, excluding self), limited to N */
export function getSiblingCities(cityId: number, countryId: number, limit = 12): RawCity[] {
  const siblings = citiesByCountryIdMap.get(countryId) ?? [];
  return siblings.filter((c) => c.id !== cityId).slice(0, limit);
}

/**
 * 42 Representative Cities verified against independent astronomical references
 * (Level 4 evidence tier in docs/PRAYER_TIME_VALIDATION.md).
 * All other cities operate under Level 1-3 algorithmic regional configurations.
 */
export const INDEPENDENTLY_VERIFIED_CITY_SLUGS = new Set([
  'prayer-times-in-casablanca',
  'prayer-times-in-rabat',
  'prayer-times-in-marrakesh',
  'prayer-times-in-agadir',
  'prayer-times-in-laayoune',
  'prayer-times-in-mohammedia',
  'prayer-times-in-nador',
  'prayer-times-in-berkane',
  'prayer-times-in-beni-mellal',
  'prayer-times-in-taroudant',
  'prayer-times-in-baghdad',
  'prayer-times-in-basra',
  'prayer-times-in-musul',
  'prayer-times-in-erbil',
  'prayer-times-in-najaf',
  'prayer-times-in-karbala',
  'prayer-times-in-fallujah',
  'prayer-times-in-riyadh',
  'prayer-times-in-mecca',
  'prayer-times-in-madina',
  'prayer-times-in-jeddah',
  'prayer-times-in-dammam',
  'prayer-times-in-taif',
  'prayer-times-in-tabuk',
  'prayer-times-in-cairo',
  'prayer-times-in-alexandria',
  'prayer-times-in-giza',
  'prayer-times-in-port-said',
  'prayer-times-in-suez',
  'prayer-times-in-luxor',
  'prayer-times-in-damascus',
  'prayer-times-in-aleppo',
  'prayer-times-in-homs',
  'prayer-times-in-tartus',
  'prayer-times-in-amman_city',
  'prayer-times-in-irbid',
  'prayer-times-in-kuwait-city',
  'prayer-times-in-doha',
  'prayer-times-in-dubai',
  'prayer-times-in-abu-dhabi',
  'prayer-times-in-istanbul',
  'prayer-times-in-algiers',
]);

export function isCityIndependentlyVerified(slug: string): boolean {
  return INDEPENDENTLY_VERIFIED_CITY_SLUGS.has(slug);
}

/**
 * Normalizes Arabic text for flexible search comparison:
 * - Strips tashkeel (diacritics) and tatweel
 * - Normalizes Alef variants (إ, أ, آ, ٱ -> ا)
 * - Normalizes Teh Marbuta (ة -> ه)
 * - Normalizes Alef Maksura (ى -> ي)
 */
export function normalizeArabic(text: string): string {
  return text
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/ـ/g, '')
    .replace(/[إأآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/[ىي]/g, 'ي')
    .trim()
    .toLowerCase();
}

/**
 * Full-text search across city names (Arabic + English) and country names.
 * Returns results sorted by relevance: exact prefix matches first,
 * then partial matches. Limited to maxResults.
 */
export function searchCities(
  query: string,
  maxResults = 10,
): Array<{ city: RawCity; country: RawCountry }> {
  const qRaw = query.trim();
  if (!qRaw || qRaw.length < 2) return [];

  const qLower = qRaw.toLowerCase();
  const qNorm = normalizeArabic(qRaw);
  const qWithoutAl = qNorm.startsWith('ال') ? qNorm.slice(2) : qNorm;

  const countryMap = new Map(countries.map((c) => [c.id, c]));

  const scored = cities
    .map((city) => {
      const arLower = city.nameAr.toLowerCase();
      const enLower = city.nameEn.toLowerCase();
      const arNorm = normalizeArabic(city.nameAr);
      const arWithoutAl = arNorm.startsWith('ال') ? arNorm.slice(2) : arNorm;

      const country = countryMap.get(city.countryId);
      const countryArNorm = country ? normalizeArabic(country.nameAr) : '';
      const countryEnLower = country ? country.nameEn.toLowerCase() : '';

      let score = 0;

      // 1. Exact matches
      if (arLower === qLower || enLower === qLower) {
        score = 100;
      } else if (arNorm === qNorm) {
        score = 95;
      } else if (qWithoutAl.length >= 2 && arWithoutAl === qWithoutAl) {
        score = 90;
      }
      // 2. StartsWith matches
      else if (arLower.startsWith(qLower) || enLower.startsWith(qLower)) {
        score = 85;
      } else if (arNorm.startsWith(qNorm)) {
        score = 80;
      } else if (qWithoutAl.length >= 2 && arWithoutAl.startsWith(qWithoutAl)) {
        score = 75;
      }
      // 3. Substring contains matches
      else if (arLower.includes(qLower) || enLower.includes(qLower)) {
        score = 65;
      } else if (arNorm.includes(qNorm)) {
        score = 55;
      } else if (qWithoutAl.length >= 2 && arWithoutAl.includes(qWithoutAl)) {
        score = 45;
      }
      // 4. Country name matches
      else if (countryArNorm.includes(qNorm) || countryEnLower.includes(qLower)) {
        score = 30;
      }

      return { city, country, score };
    })
    .filter((r): r is { city: RawCity; country: RawCountry; score: number } => r.score > 0 && r.country !== undefined)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);

  return scored.map(({ city, country }) => ({ city, country }));
}

/**
 * Calculates geodesic distance between two coordinate pairs in kilometers using the Haversine formula.
 */
export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth's mean radius in km
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Finds the closest city in the dataset to the provided GPS coordinates.
 * Returns null if coordinates are out of bounds or invalid.
 */
export function findClosestCity(
  latitude: number,
  longitude: number,
): { city: RawCity; country: RawCountry; distanceKm: number } | null {
  if (isNaN(latitude) || isNaN(longitude)) return null;
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null;

  const countryMap = new Map(countries.map((c) => [c.id, c]));
  let closest: { city: RawCity; country: RawCountry; distanceKm: number } | null = null;
  let minDistance = Infinity;

  for (const city of cities) {
    const dist = haversineDistanceKm(
      latitude,
      longitude,
      city.coordinates.latitude,
      city.coordinates.longitude,
    );
    if (dist < minDistance) {
      minDistance = dist;
      const country = countryMap.get(city.countryId);
      if (country) {
        closest = {
          city,
          country,
          distanceKm: Math.round(dist * 10) / 10,
        };
      }
    }
  }

  return closest;
}

