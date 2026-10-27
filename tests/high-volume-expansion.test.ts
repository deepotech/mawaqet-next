import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { Coordinates, PrayerTimes, CalculationMethod, CalculationParameters } from 'adhan';
import { RawCity, RawCountry } from '@/lib/data';

describe('High-Volume City Expansion (145 Cities) Verification', () => {
  const citiesPath = path.join(__dirname, '../data/normalized/cities.json');
  const countriesPath = path.join(__dirname, '../data/normalized/countries.json');
  const cities: RawCity[] = JSON.parse(fs.readFileSync(citiesPath, 'utf8'));
  const countries: RawCountry[] = JSON.parse(fs.readFileSync(countriesPath, 'utf8'));

  const newCities = cities.filter((c) => c.id >= 489 && c.id <= 633);

  describe('1. Dataset Volume and ID Sequencing', () => {
    it('contains exactly 633 cities and 40 countries', () => {
      expect(cities).toHaveLength(633);
      expect(countries).toHaveLength(40);
    });

    it('contains exactly 145 new cities in the expansion range 489..633', () => {
      expect(newCities).toHaveLength(145);
      newCities.forEach((city, index) => {
        expect(city.id).toBe(489 + index);
      });
    });

    it('ensures all 633 city IDs and slugs are unique', () => {
      const ids = new Set(cities.map((c) => c.id));
      const slugs = new Set(cities.map((c) => c.slug));
      expect(ids.size).toBe(633);
      expect(slugs.size).toBe(633);
    });

    it('verifies all new cities follow canonical slug and urlPath formats', () => {
      newCities.forEach((city) => {
        expect(city.slug).toMatch(/^prayer-times-in-[a-z0-9_-]+$/);
        expect(city.urlPath).toBe(`/city/${city.slug}/`);
      });
    });
  });

  describe('2. New Countries Integration (Pakistan & Singapore)', () => {
    it('contains Pakistan (PK) with method 12 (KARACHI) and 14 cities', () => {
      const pk = countries.find((c) => c.code === 'PK');
      expect(pk).toBeDefined();
      expect(pk!.id).toBe(39);
      expect(pk!.defaultMethodId).toBe(12);
      expect(pk!.totalCities).toBe(14);

      const pkCities = cities.filter((c) => c.countryCode === 'PK');
      expect(pkCities).toHaveLength(14);
      pkCities.forEach((c) => {
        expect(c.calculationMethodId).toBe(12);
        expect(c.timezone).toBe('Asia/Karachi');
      });
    });

    it('contains Singapore (SG) with method 11 (SINGAPORE) and 1 city', () => {
      const sg = countries.find((c) => c.code === 'SG');
      expect(sg).toBeDefined();
      expect(sg!.id).toBe(40);
      expect(sg!.defaultMethodId).toBe(11);
      expect(sg!.totalCities).toBe(1);

      const sgCities = cities.filter((c) => c.countryCode === 'SG');
      expect(sgCities).toHaveLength(1);
      expect(sgCities[0].calculationMethodId).toBe(11);
      expect(sgCities[0].timezone).toBe('Asia/Singapore');
    });
  });

  describe('3. Country Totals Synchronization', () => {
    it('synchronizes every country declared totalCities to actual city count', () => {
      countries.forEach((country) => {
        const actual = cities.filter((c) => c.countryId === country.id).length;
        expect(
          country.totalCities,
          `Mismatch in ${country.nameEn} (${country.code}): declared ${country.totalCities}, actual ${actual}`
        ).toBe(actual);
      });
    });
  });

  describe('4. Geodata & Prayer Calculation Integrity', () => {
    it('verifies all 145 new cities have valid coordinates and timezones', () => {
      newCities.forEach((city) => {
        expect(city.coordinates.latitude).toBeGreaterThanOrEqual(-90);
        expect(city.coordinates.latitude).toBeLessThanOrEqual(90);
        expect(city.coordinates.longitude).toBeGreaterThanOrEqual(-180);
        expect(city.coordinates.longitude).toBeLessThanOrEqual(180);

        expect(() => {
          new Intl.DateTimeFormat('en-US', { timeZone: city.timezone });
        }).not.toThrow();
      });
    });

    it('calculates valid, chronologically ordered prayer times for key expansion hubs', () => {
      const testDate = new Date('2026-10-27T12:00:00Z');
      const gulfParams = new CalculationParameters('Dubai', 19.5, 0);
      gulfParams.ishaInterval = 90;

      const testSlugs = [
        { slug: 'prayer-times-in-karachi', params: CalculationMethod.Karachi() },
        { slug: 'prayer-times-in-lahore', params: CalculationMethod.Karachi() },
        { slug: 'prayer-times-in-singapore', params: CalculationMethod.Singapore() },
        { slug: 'prayer-times-in-sakakah', params: CalculationMethod.UmmAlQura() },
        { slug: 'prayer-times-in-tiznit', params: new CalculationParameters('MoonsightingCommittee', 19.0, 17.0) },
        { slug: 'prayer-times-in-edirne', params: CalculationMethod.Turkey() },
        { slug: 'prayer-times-in-denpasar', params: gulfParams },
        { slug: 'prayer-times-in-houston', params: gulfParams },
      ];

      testSlugs.forEach(({ slug, params }) => {
        const city = cities.find((c) => c.slug === slug);
        expect(city, `City ${slug} should exist`).toBeDefined();
        const coords = new Coordinates(city!.coordinates.latitude, city!.coordinates.longitude);
        const pt = new PrayerTimes(coords, testDate, params);

        expect(pt.fajr).toBeInstanceOf(Date);
        expect(pt.sunrise).toBeInstanceOf(Date);
        expect(pt.dhuhr).toBeInstanceOf(Date);
        expect(pt.asr).toBeInstanceOf(Date);
        expect(pt.maghrib).toBeInstanceOf(Date);
        expect(pt.isha).toBeInstanceOf(Date);

        expect(isNaN(pt.fajr.getTime())).toBe(false);
        expect(isNaN(pt.dhuhr.getTime())).toBe(false);

        expect(pt.fajr.getTime()).toBeLessThan(pt.sunrise.getTime());
        expect(pt.sunrise.getTime()).toBeLessThan(pt.dhuhr.getTime());
        expect(pt.dhuhr.getTime()).toBeLessThan(pt.asr.getTime());
        expect(pt.asr.getTime()).toBeLessThan(pt.maghrib.getTime());
        expect(pt.maghrib.getTime()).toBeLessThan(pt.isha.getTime());
      });
    });
  });

  describe('5. Geographic Separation Threshold (>= 15km Minimum Separation)', () => {
    function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
      const R = 6371;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    }

    it('ensures all 145 expansion cities maintain healthy spatial separation from existing network', () => {
      newCities.forEach((city) => {
        const otherSameCountry = cities.filter(
          (c) => c.countryCode === city.countryCode && c.id !== city.id
        );

        otherSameCountry.forEach((other) => {
          const dist = haversineDistance(
            city.coordinates.latitude,
            city.coordinates.longitude,
            other.coordinates.latitude,
            other.coordinates.longitude
          );
          expect(
            dist,
            `Proximity collision between ${city.nameEn} and ${other.nameEn}: ${dist.toFixed(1)}km`
          ).toBeGreaterThanOrEqual(15.0);
        });
      });
    });
  });
});
