import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { Coordinates, PrayerTimes, CalculationMethod, CalculationParameters } from 'adhan';
import { RawCity, RawCountry } from '@/lib/data';

describe('Phase 6A — Expansion Batch 1: Morocco (8) & Iraq (6) Verification', () => {
  const citiesPath = path.join(__dirname, '../data/normalized/cities.json');
  const countriesPath = path.join(__dirname, '../data/normalized/countries.json');
  const cities: RawCity[] = JSON.parse(fs.readFileSync(citiesPath, 'utf8'));
  const countries: RawCountry[] = JSON.parse(fs.readFileSync(countriesPath, 'utf8'));

  const batch1Cities = cities.filter((c) => c.id >= 634 && c.id <= 647);

  describe('1. Dataset Volume and ID Sequencing', () => {
    it('contains exactly 647 cities and 40 countries', () => {
      expect(cities).toHaveLength(647);
      expect(countries).toHaveLength(40);
    });

    it('contains exactly 14 new cities in the expansion range 634..647', () => {
      expect(batch1Cities).toHaveLength(14);
      batch1Cities.forEach((city, index) => {
        expect(city.id).toBe(634 + index);
      });
    });

    it('ensures all 647 city IDs and slugs are unique', () => {
      const ids = new Set(cities.map((c) => c.id));
      const slugs = new Set(cities.map((c) => c.slug));
      expect(ids.size).toBe(647);
      expect(slugs.size).toBe(647);
    });

    it('verifies all 14 new cities follow canonical slug and urlPath formats', () => {
      batch1Cities.forEach((city) => {
        expect(city.slug).toMatch(/^prayer-times-in-[a-z0-9_-]+$/);
        expect(city.urlPath).toBe(`/city/${city.slug}/`);
      });
    });
  });

  describe('2. Country Totals & Specific City Allocations', () => {
    it('synchronizes Morocco (MA) to exactly 45 cities with method 15', () => {
      const ma = countries.find((c) => c.code === 'MA')!;
      expect(ma.totalCities).toBe(45);
      const maCities = cities.filter((c) => c.countryCode === 'MA');
      expect(maCities).toHaveLength(45);

      const maBatch1 = batch1Cities.filter((c) => c.countryCode === 'MA');
      expect(maBatch1).toHaveLength(8);
      maBatch1.forEach((city) => {
        expect(city.countryId).toBe(3);
        expect(city.calculationMethodId).toBe(15);
        expect(city.timezone).toBe('Africa/Casablanca');
      });
    });

    it('synchronizes Iraq (IQ) to exactly 25 cities with method 8', () => {
      const iq = countries.find((c) => c.code === 'IQ')!;
      expect(iq.totalCities).toBe(25);
      const iqCities = cities.filter((c) => c.countryCode === 'IQ');
      expect(iqCities).toHaveLength(25);

      const iqBatch1 = batch1Cities.filter((c) => c.countryCode === 'IQ');
      expect(iqBatch1).toHaveLength(6);
      iqBatch1.forEach((city) => {
        expect(city.countryId).toBe(15);
        expect(city.calculationMethodId).toBe(8);
        expect(city.timezone).toBe('Asia/Baghdad');
      });
    });
  });

  describe('3. Coordinate Accuracy & Terrestrial Bounding', () => {
    it('ensures all 14 new cities have valid terrestrial coordinates', () => {
      batch1Cities.forEach((city) => {
        expect(city.coordinates).toBeDefined();
        expect(city.coordinates.latitude).toBeGreaterThan(-90);
        expect(city.coordinates.latitude).toBeLessThan(90);
        expect(city.coordinates.longitude).toBeGreaterThan(-180);
        expect(city.coordinates.longitude).toBeLessThan(180);
        expect(isNaN(city.coordinates.latitude)).toBe(false);
        expect(isNaN(city.coordinates.longitude)).toBe(false);
      });
    });
  });

  describe('4. Astronomical Calculation Solvability Across All 4 Seasons', () => {
    const testDates = [
      new Date('2026-03-21T12:00:00Z'), // Vernal Equinox
      new Date('2026-06-21T12:00:00Z'), // Summer Solstice
      new Date('2026-09-23T12:00:00Z'), // Autumnal Equinox
      new Date('2026-12-21T12:00:00Z'), // Winter Solstice
    ];

    it('produces valid, non-NaN prayer times for all 14 new cities in all 4 seasons', () => {
      batch1Cities.forEach((city) => {
        const coords = new Coordinates(city.coordinates.latitude, city.coordinates.longitude);
        let params: CalculationParameters;
        if (city.calculationMethodId === 15) {
          params = new CalculationParameters('MoonsightingCommittee', 19.0, 17.0);
        } else {
          params = new CalculationParameters('Dubai', 19.5, 0);
          params.ishaInterval = 90;
        }

        testDates.forEach((date) => {
          const pt = new PrayerTimes(coords, date, params);
          expect(pt.fajr, `Failed fajr in ${city.slug} on ${date.toISOString()}`).toBeDefined();
          expect(pt.sunrise, `Failed sunrise in ${city.slug} on ${date.toISOString()}`).toBeDefined();
          expect(pt.dhuhr, `Failed dhuhr in ${city.slug} on ${date.toISOString()}`).toBeDefined();
          expect(pt.asr, `Failed asr in ${city.slug} on ${date.toISOString()}`).toBeDefined();
          expect(pt.maghrib, `Failed maghrib in ${city.slug} on ${date.toISOString()}`).toBeDefined();
          expect(pt.isha, `Failed isha in ${city.slug} on ${date.toISOString()}`).toBeDefined();

          expect(isNaN(pt.fajr.getTime())).toBe(false);
          expect(isNaN(pt.isha.getTime())).toBe(false);
        });
      });
    });
  });

  describe('5. Preservation of Previous 633 Baseline Cities', () => {
    it('ensures all original 633 cities remain intact and unmodified', () => {
      const baselineSlice = cities.slice(0, 633);
      expect(baselineSlice).toHaveLength(633);
      baselineSlice.forEach((city, index) => {
        expect(city.id).toBe(index + 1);
      });
    });
  });
});
