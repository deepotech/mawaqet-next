import { describe, it, expect } from 'vitest';
import { getAllCities, getAllCountries, getCityBySlug, getCountryBySlug, getCountryById, getCitiesByCountryId, toCalculationMethodId } from '@/lib/data';
import { prayerTimeService } from '@/services/prayer-service';
import { buildPrayerConfig } from '@/lib/prayer-config';

describe('Phase 1 — Pre-Expansion Hardening Regressions', () => {
  const cities = getAllCities();
  const countries = getAllCountries();

  describe('1. Country totalCities synchronization', () => {
    it('verifies that every country totalCities exactly matches actual city count in cities.json', () => {
      for (const country of countries) {
        const matchingCities = getCitiesByCountryId(country.id);
        expect(
          country.totalCities,
          `Mismatch in country "${country.nameEn}" (id=${country.id}, code=${country.code}): declared ${country.totalCities}, actual ${matchingCities.length}`
        ).toBe(matchingCities.length);
      }
    });

    it('verifies Sweden has exactly 43 cities declared and in dataset', () => {
      const sweden = getCountryBySlug('prayer-times-in-sweden');
      expect(sweden).toBeDefined();
      expect(sweden?.totalCities).toBe(43);
      expect(getCitiesByCountryId(sweden!.id)).toHaveLength(43);
    });

    it('verifies Bahrain and Philippines have 1 city each, and Uzbekistan has 5 cities', () => {
      const bh = countries.find(c => c.code === 'BH');
      const ph = countries.find(c => c.code === 'PH');
      const uz = countries.find(c => c.code === 'UZ');

      expect(bh?.totalCities).toBe(1);
      expect(getCitiesByCountryId(bh!.id)).toHaveLength(1);

      expect(ph?.totalCities).toBe(1);
      expect(getCitiesByCountryId(ph!.id)).toHaveLength(1);

      expect(uz?.totalCities).toBe(5);
      expect(getCitiesByCountryId(uz!.id)).toHaveLength(5);
    });
  });

  describe('2. Calculation Method Support: FRANCE & TURKEY', () => {
    it('maps numeric ID 7 to FRANCE calculation method', () => {
      expect(toCalculationMethodId(7)).toBe('FRANCE');
    });

    it('correctly resolves FRANCE calculation parameters (12° Fajr, 12° Isha)', () => {
      const params = prayerTimeService.resolveCalculationParameters({ method: 'FRANCE' });
      expect(params).toBeDefined();
      expect(params.fajrAngle).toBe(12.0);
      expect(params.ishaAngle).toBe(12.0);
    });

    it('computes valid prayer times using FRANCE method for Paris coordinates', () => {
      const parisCoords = { latitude: 48.8566, longitude: 2.3522 };
      const schedule = prayerTimeService.calculateDailySchedule({
        coordinates: parisCoords,
        timezone: 'Europe/Paris',
        date: new Date('2026-10-15T12:00:00Z'),
        config: { method: 'FRANCE' },
      });
      expect(schedule.timings.fajr).toMatch(/^([01]\d|2[0-3]):([0-5]\d)$/);
      expect(schedule.timings.maghrib).toMatch(/^([01]\d|2[0-3]):([0-5]\d)$/);
      expect(schedule.meta.calculationAuthority).toContain('فرنسا');
    });

    it('verifies Turkey country record uses defaultMethodId 13 (TURKEY/Diyanet)', () => {
      const turkey = getCountryBySlug('prayer-times-in-turkey');
      expect(turkey).toBeDefined();
      expect(turkey?.defaultMethodId).toBe(13);
      expect(toCalculationMethodId(turkey!.defaultMethodId)).toBe('TURKEY');
    });

    it('verifies all Turkish cities use calculationMethodId 13', () => {
      const turkeyCities = cities.filter(c => c.countryCode === 'TR');
      expect(turkeyCities.length).toBeGreaterThan(0);
      for (const city of turkeyCities) {
        expect(city.calculationMethodId).toBe(13);
      }
    });

    it('computes valid prayer times using TURKEY method with official Diyanet offsets', () => {
      const istanbul = getCityBySlug('prayer-times-in-istanbul');
      expect(istanbul).toBeDefined();
      const schedule = prayerTimeService.calculateDailySchedule({
        coordinates: istanbul!.coordinates,
        timezone: istanbul!.timezone,
        date: new Date('2026-10-15T12:00:00Z'),
        config: { method: 'TURKEY' },
      });
      expect(schedule.timings.fajr).toMatch(/^([01]\d|2[0-3]):([0-5]\d)$/);
      expect(schedule.meta.calculationAuthority).toContain('Diyanet');
    });
  });

  describe('3. Character Encoding Integrity', () => {
    it('verifies Norrköping (city ID 282) has clean ASCII enrichmentSource and valid Arabic name', () => {
      const norr = cities.find(c => c.id === 282);
      expect(norr).toBeDefined();
      expect(norr?.enrichmentSource).toBe('GeoNames (city-timezones - Norrkoeping)');
      expect(norr?.nameEn).toBe('norrkoeping');
      expect(norr?.nameAr).toBeTruthy();
      // Ensure no replacement characters or corrupted byte markers exist in enrichmentSource
      expect(norr?.enrichmentSource).not.toContain('?');
      expect(norr?.enrichmentSource).not.toContain('\uFFFD');
    });

    it('verifies no city record has non-ASCII corruptions or question marks in enrichmentSource', () => {
      for (const city of cities) {
        expect(city.enrichmentSource).not.toContain('?');
        expect(city.enrichmentSource).not.toContain('\uFFFD');
      }
    });
  });

  describe('4. Map Index O(1) Lookups & Referential Integrity', () => {
    it('returns exact same objects from getCityBySlug as direct array find', () => {
      const testSlugs = [
        'prayer-times-in-baghdad',
        'prayer-times-in-casablanca',
        'prayer-times-in-istanbul',
        'prayer-times-in-manama',
        'prayer-times-in-stockholm',
      ];
      for (const slug of testSlugs) {
        const indexed = getCityBySlug(slug);
        const linear = cities.find(c => c.slug === slug);
        expect(indexed).toBe(linear);
      }
    });

    it('returns undefined for non-existent slugs', () => {
      expect(getCityBySlug('prayer-times-in-non-existent-city-999')).toBeUndefined();
      expect(getCountryBySlug('prayer-times-in-non-existent-country-999')).toBeUndefined();
    });

    it('returns correct country by ID through Map index', () => {
      for (const country of countries) {
        expect(getCountryById(country.id)).toBe(country);
      }
    });
  });

  describe('5. Legacy URL Preservation & Method Edge Cases', () => {
    it('preserves legacy typo slug for India ("rayer-times-in-india")', () => {
      const india = getCountryBySlug('rayer-times-in-india');
      expect(india).toBeDefined();
      expect(india?.code).toBe('IN');
      expect(india?.id).toBe(24);
    });

    it('preserves legacy underscore slug for UAE ("prayer-times-in-united_arab_emirates")', () => {
      const uae = getCountryBySlug('prayer-times-in-united_arab_emirates');
      expect(uae).toBeDefined();
      expect(uae?.code).toBe('AE');
      expect(uae?.id).toBe(6);
    });

    it('preserves legacy spelling for Egypt ("prayer-times-in-eqypt")', () => {
      const egypt = getCountryBySlug('prayer-times-in-eqypt');
      expect(egypt).toBeDefined();
      expect(egypt?.code).toBe('EG');
      expect(egypt?.id).toBe(2);
    });

    it('explicitly falls back to GULF for unsupported or unmapped calculation method IDs', () => {
      expect(toCalculationMethodId(9999)).toBe('GULF');
      expect(toCalculationMethodId(-1)).toBe('GULF');
      expect(toCalculationMethodId(0)).toBe('GULF');
    });

    it('applies seventh_of_the_night high-latitude rule for cities at or above 48° latitude', () => {
      // Paris is at 48.86°
      const parisConfig = buildPrayerConfig(8, 48.86);
      expect(parisConfig.highLatitudeRule).toBe('seventh_of_the_night');

      // Stockholm is at 59.33°
      const stockholmConfig = buildPrayerConfig(8, 59.33);
      expect(stockholmConfig.highLatitudeRule).toBe('seventh_of_the_night');

      // Mecca is at 21.42° (below 48°)
      const meccaConfig = buildPrayerConfig(4, 21.42);
      expect(meccaConfig.highLatitudeRule).toBeUndefined();
    });
  });
});
