import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { Coordinates, PrayerTimes, CalculationMethod } from 'adhan';
import { RawCity, RawCountry } from '@/lib/data';

describe('Phase 6A — Expansion Batch 2: Egypt (7) & Saudi Arabia (7) Verification', () => {
  const citiesPath = path.join(__dirname, '../data/normalized/cities.json');
  const countriesPath = path.join(__dirname, '../data/normalized/countries.json');
  const cities: RawCity[] = JSON.parse(fs.readFileSync(citiesPath, 'utf8'));
  const countries: RawCountry[] = JSON.parse(fs.readFileSync(countriesPath, 'utf8'));

  const batch2Cities = cities.filter((c) => c.id >= 648 && c.id <= 661);

  describe('1. Dataset Volume and ID Sequencing', () => {
    it('contains exactly 661 cities and 40 countries', () => {
      expect(cities).toHaveLength(661);
      expect(countries).toHaveLength(40);
    });

    it('contains exactly 14 new cities in the expansion range 648..661', () => {
      expect(batch2Cities).toHaveLength(14);
      batch2Cities.forEach((city, index) => {
        expect(city.id).toBe(648 + index);
      });
    });

    it('ensures all 661 city IDs and slugs are unique', () => {
      const ids = new Set(cities.map((c) => c.id));
      const slugs = new Set(cities.map((c) => c.slug));
      expect(ids.size).toBe(661);
      expect(slugs.size).toBe(661);
    });

    it('verifies all 14 new cities follow canonical slug and urlPath formats', () => {
      batch2Cities.forEach((city) => {
        expect(city.slug).toMatch(/^prayer-times-in-[a-z0-9_-]+$/);
        expect(city.urlPath).toBe(`/city/${city.slug}/`);
      });
    });
  });

  describe('2. Country Totals & Specific City Allocations', () => {
    it('synchronizes Egypt (EG) to exactly 35 cities with method 3', () => {
      const eg = countries.find((c) => c.code === 'EG')!;
      expect(eg.totalCities).toBe(35);
      const egCities = cities.filter((c) => c.countryCode === 'EG');
      expect(egCities).toHaveLength(35);

      const egBatch2 = batch2Cities.filter((c) => c.countryCode === 'EG');
      expect(egBatch2).toHaveLength(7);
      egBatch2.forEach((city) => {
        expect(city.countryId).toBe(2);
        expect(city.calculationMethodId).toBe(3);
        expect(city.timezone).toBe('Africa/Cairo');
      });
    });

    it('synchronizes Saudi Arabia (SA) to exactly 55 cities with method 4', () => {
      const sa = countries.find((c) => c.code === 'SA')!;
      expect(sa.totalCities).toBe(55);
      const saCities = cities.filter((c) => c.countryCode === 'SA');
      expect(saCities).toHaveLength(55);

      const saBatch2 = batch2Cities.filter((c) => c.countryCode === 'SA');
      expect(saBatch2).toHaveLength(7);
      saBatch2.forEach((city) => {
        expect(city.countryId).toBe(1);
        expect(city.calculationMethodId).toBe(4);
        expect(city.timezone).toBe('Asia/Riyadh');
      });
    });

    it('contains correct Egypt Batch 2 city slugs', () => {
      const egSlugs = batch2Cities
        .filter((c) => c.countryCode === 'EG')
        .map((c) => c.slug);
      expect(egSlugs).toContain('prayer-times-in-6th-of-october');
      expect(egSlugs).toContain('prayer-times-in-10th-of-ramadan');
      expect(egSlugs).toContain('prayer-times-in-marsa-alam');
      expect(egSlugs).toContain('prayer-times-in-sallum');
      expect(egSlugs).toContain('prayer-times-in-saint-catherine');
      expect(egSlugs).toContain('prayer-times-in-dahab');
      expect(egSlugs).toContain('prayer-times-in-mallawi');
    });

    it('contains correct Saudi Arabia Batch 2 city slugs', () => {
      const saSlugs = batch2Cities
        .filter((c) => c.countryCode === 'SA')
        .map((c) => c.slug);
      expect(saSlugs).toContain('prayer-times-in-ar-rass');
      expect(saSlugs).toContain('prayer-times-in-sabya');
      expect(saSlugs).toContain('prayer-times-in-abu-arish');
      expect(saSlugs).toContain('prayer-times-in-sharurah');
      expect(saSlugs).toContain('prayer-times-in-haql');
      expect(saSlugs).toContain('prayer-times-in-tayma');
      expect(saSlugs).toContain('prayer-times-in-rabigh');
    });
  });

  describe('3. Geographic Coordinate Integrity', () => {
    it('all Batch 2 cities have valid WGS-84 coordinates', () => {
      batch2Cities.forEach((city) => {
        expect(city.coordinates.latitude).toBeGreaterThanOrEqual(-90);
        expect(city.coordinates.latitude).toBeLessThanOrEqual(90);
        expect(city.coordinates.longitude).toBeGreaterThanOrEqual(-180);
        expect(city.coordinates.longitude).toBeLessThanOrEqual(180);
      });
    });

    it('all Egypt cities are within Egypt bounding box (lat 22-32, lng 25-37)', () => {
      batch2Cities
        .filter((c) => c.countryCode === 'EG')
        .forEach((city) => {
          expect(city.coordinates.latitude).toBeGreaterThan(22);
          expect(city.coordinates.latitude).toBeLessThan(32);
          expect(city.coordinates.longitude).toBeGreaterThan(25);
          expect(city.coordinates.longitude).toBeLessThan(37);
        });
    });

    it('all Saudi Arabia cities are within Saudi bounding box (lat 16-32.5, lng 34-56)', () => {
      batch2Cities
        .filter((c) => c.countryCode === 'SA')
        .forEach((city) => {
          expect(city.coordinates.latitude).toBeGreaterThan(16);
          expect(city.coordinates.latitude).toBeLessThan(32.5);
          expect(city.coordinates.longitude).toBeGreaterThan(34);
          expect(city.coordinates.longitude).toBeLessThan(56);
        });
    });
  });

  describe('4. Astronomical Solvability (All 4 Seasons)', () => {
    const seasons = [
      new Date('2026-01-15'), // Winter
      new Date('2026-04-15'), // Spring
      new Date('2026-07-15'), // Summer
      new Date('2026-10-15'), // Autumn
    ];

    const methodMap: Record<number, any> = {
      3: CalculationMethod.Egyptian(),
      4: CalculationMethod.UmmAlQura(),
    };

    it('produces valid non-NaN prayer timestamps for all 14 Batch 2 cities in all 4 seasons', () => {
      batch2Cities.forEach((city) => {
        const coords = new Coordinates(
          city.coordinates.latitude,
          city.coordinates.longitude
        );
        const params = methodMap[city.calculationMethodId];
        expect(params).toBeDefined();

        seasons.forEach((date) => {
          const pt = new PrayerTimes(coords, date, params);
          expect(pt.fajr).toBeInstanceOf(Date);
          expect(pt.sunrise).toBeInstanceOf(Date);
          expect(pt.dhuhr).toBeInstanceOf(Date);
          expect(pt.asr).toBeInstanceOf(Date);
          expect(pt.maghrib).toBeInstanceOf(Date);
          expect(pt.isha).toBeInstanceOf(Date);
          expect(isNaN(pt.fajr.getTime())).toBe(false);
          expect(isNaN(pt.isha.getTime())).toBe(false);
        });
      });
    });
  });

  describe('5. Baseline Preservation (647 Batch 1 Cities Unchanged)', () => {
    it('preserves all 647 pre-Batch-2 city records intact', () => {
      const pre = cities.filter((c) => c.id <= 647);
      expect(pre).toHaveLength(647);
      // IDs are sequential from 1 to 647
      pre.forEach((city, index) => {
        expect(city.id).toBe(index + 1);
      });
    });

    it('preserves Batch 1 Morocco cities (IDs 634–641) unchanged', () => {
      const moroccoBatch1 = cities.filter((c) => c.id >= 634 && c.id <= 641);
      expect(moroccoBatch1).toHaveLength(8);
      moroccoBatch1.forEach((c) => {
        expect(c.countryCode).toBe('MA');
        expect(c.calculationMethodId).toBe(15);
        expect(c.timezone).toBe('Africa/Casablanca');
      });
    });

    it('preserves Batch 1 Iraq cities (IDs 642–647) unchanged', () => {
      const iraqBatch1 = cities.filter((c) => c.id >= 642 && c.id <= 647);
      expect(iraqBatch1).toHaveLength(6);
      iraqBatch1.forEach((c) => {
        expect(c.countryCode).toBe('IQ');
        expect(c.calculationMethodId).toBe(8);
        expect(c.timezone).toBe('Asia/Baghdad');
      });
    });
  });
});
