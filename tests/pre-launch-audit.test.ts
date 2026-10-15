import { describe, it, expect } from 'vitest';
import { prayerTimeService } from '@/services/prayer-service';
import { getAllCities, getAllCountries, getCityBySlug, getCountryById } from '@/lib/data';
import { GET } from '@/app/api/search/route';

describe('Phase 4.5 — Pre-Launch Comprehensive Technical Audit', () => {
  describe('1. Timezone & Midnight Boundary Precision', () => {
    it('accurately resolves local date and weekday across UTC midnight for UTC+3 locations', () => {
      const baghdadCoords = { latitude: 33.338649, longitude: 44.393869 };
      const baghdadTz = 'Asia/Baghdad';

      // 21:30 UTC on Oct 14 is 00:30 on Oct 15 in Baghdad (UTC+3)
      const lateNightUtc = new Date('2026-10-14T21:30:00Z');

      const schedule = prayerTimeService.calculateDailySchedule({
        coordinates: baghdadCoords,
        timezone: baghdadTz,
        date: lateNightUtc,
        config: { method: 'GULF' },
      });

      // Gregorian day in Baghdad must be 15, not 14
      expect(schedule.gregorian.day).toBe(15);
      expect(schedule.gregorian.formattedIso).toBe('2026-10-15');
      // In Arabic: Thursday is الخميس
      expect(schedule.gregorian.weekdayAr).toContain('الخميس');
    });

    it('accurately resolves local date and weekday across UTC midnight for UTC-5 locations', () => {
      const nyCoords = { latitude: 40.712776, longitude: -74.005974 };
      const nyTz = 'America/New_York';

      // 02:00 UTC on Oct 15 is 22:00 on Oct 14 in New York (EDT, UTC-4)
      const earlyMorningUtc = new Date('2026-10-15T02:00:00Z');

      const schedule = prayerTimeService.calculateDailySchedule({
        coordinates: nyCoords,
        timezone: nyTz,
        date: earlyMorningUtc,
        config: { method: 'ISNA' },
      });

      // Gregorian day in New York must be 14, not 15
      expect(schedule.gregorian.day).toBe(14);
      expect(schedule.gregorian.formattedIso).toBe('2026-10-14');
      // In Arabic: Wednesday is الأربعاء
      expect(schedule.gregorian.weekdayAr).toContain('الأربعاء');
    });
  });

  describe('2. High-Latitude Safety & Boundary Rejection', () => {
    it('safely computes prayer times for high-latitude locations without NaN or infinite loop errors', () => {
      const stockholmCoords = { latitude: 59.329323, longitude: 18.068581 };
      const testDate = new Date('2026-06-21T12:00:00Z'); // Summer solstice

      const schedule = prayerTimeService.calculateDailySchedule({
        coordinates: stockholmCoords,
        timezone: 'Europe/Stockholm',
        date: testDate,
        config: { method: 'MWL', highLatitudeRule: 'seventh_of_the_night' },
      });

      expect(schedule.timings.fajr).not.toBe('NaN:NaN');
      expect(schedule.timings.fajr).toMatch(/^([01]\d|2[0-3]):([0-5]\d)$/);
      expect(schedule.timings.isha).not.toBe('NaN:NaN');
      expect(schedule.timings.isha).toMatch(/^([01]\d|2[0-3]):([0-5]\d)$/);
    });

    it('strictly throws on invalid or out-of-bounds geographic inputs', () => {
      const testDate = new Date('2026-10-14T12:00:00Z');

      // Latitude > 90
      expect(() =>
        prayerTimeService.calculateDailySchedule({
          coordinates: { latitude: 91, longitude: 0 },
          timezone: 'UTC',
          date: testDate,
          config: { method: 'MWL' },
        })
      ).toThrow(/Invalid geographic coordinates/);

      // Longitude > 180
      expect(() =>
        prayerTimeService.calculateDailySchedule({
          coordinates: { latitude: 0, longitude: 185 },
          timezone: 'UTC',
          date: testDate,
          config: { method: 'MWL' },
        })
      ).toThrow(/Invalid geographic coordinates/);

      // NaN coordinates
      expect(() =>
        prayerTimeService.calculateDailySchedule({
          coordinates: { latitude: NaN, longitude: 0 },
          timezone: 'UTC',
          date: testDate,
          config: { method: 'MWL' },
        })
      ).toThrow(/Invalid geographic coordinates/);
    });
  });

  describe('3. Absolute Domain Separation (Zero Mosque/Iqamah Conflation)', () => {
    it('verifies that no city record contains fabricated mosque listings, opening hours, or iqamah times', () => {
      const cities = getAllCities();

      for (const city of cities) {
        // Assert no iqamah or mosque keys exist in the city data
        const cityObj = city as unknown as Record<string, unknown>;
        expect(cityObj.iqamahTimes).toBeUndefined();
        expect(cityObj.mosqueListings).toBeUndefined();
        expect(cityObj.openingHours).toBeUndefined();
        expect(cityObj.rating).toBeUndefined();
      }
    });
  });

  describe('4. Full Data Integrity & Entity Relationship Audit', () => {
    const cities = getAllCities();
    const countries = getAllCountries();

    it('contains exactly 478 cities and 38 countries', () => {
      expect(cities).toHaveLength(478);
      expect(countries).toHaveLength(38);
    });

    it('every city slug and ID is unique', () => {
      const idSet = new Set<number>();
      const slugSet = new Set<string>();

      for (const city of cities) {
        expect(idSet.has(city.id), `Duplicate city ID: ${city.id}`).toBe(false);
        expect(slugSet.has(city.slug), `Duplicate city slug: ${city.slug}`).toBe(false);
        idSet.add(city.id);
        slugSet.add(city.slug);
      }
    });

    it('every country slug and ID is unique', () => {
      const idSet = new Set<number>();
      const slugSet = new Set<string>();

      for (const country of countries) {
        expect(idSet.has(country.id), `Duplicate country ID: ${country.id}`).toBe(false);
        expect(slugSet.has(country.slug), `Duplicate country slug: ${country.slug}`).toBe(false);
        idSet.add(country.id);
        slugSet.add(country.slug);
      }
    });

    it('every city points to a valid countryId that exists in countries dataset', () => {
      for (const city of cities) {
        const country = getCountryById(city.countryId);
        expect(country, `Missing country for city ${city.slug} with countryId ${city.countryId}`).toBeDefined();
        expect(country?.code).toBe(city.countryCode);
      }
    });

    it('every city has valid latitude, longitude, and IANA timezone', () => {
      for (const city of cities) {
        expect(city.coordinates.latitude).toBeGreaterThanOrEqual(-90);
        expect(city.coordinates.latitude).toBeLessThanOrEqual(90);
        expect(city.coordinates.longitude).toBeGreaterThanOrEqual(-180);
        expect(city.coordinates.longitude).toBeLessThanOrEqual(180);
        expect(city.timezone).toContain('/');
      }
    });
  });

  describe('5. Search API Security & Edge Case Handling', () => {
    it('handles query strings with special SQL / HTML / regex characters gracefully without throwing', async () => {
      const maliciousQueries = [
        "<script>alert('xss')</script>",
        "' OR '1'='1",
        '../etc/passwd',
        '.*',
        '(((',
        '\\',
        '%00',
      ];

      for (const q of maliciousQueries) {
        const req = new Request(`http://localhost:3000/api/search/?q=${encodeURIComponent(q)}`);
        const res = await GET(req);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(Array.isArray(data)).toBe(true);
      }
    });

    it('rejects query strings longer than 100 characters with 400 Bad Request', async () => {
      const longQuery = 'x'.repeat(101);
      const req = new Request(`http://localhost:3000/api/search/?q=${longQuery}`);
      const res = await GET(req);
      expect(res.status).toBe(400);
    });
  });
});
