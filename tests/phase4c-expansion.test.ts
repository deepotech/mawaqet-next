import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { Coordinates, PrayerTimes, CalculationMethod, CalculationParameters } from 'adhan';
import { RawCity, RawCountry } from '@/lib/data';

describe('Phase 4C — Expansion Batch 2: Samarra, Maan, Samawah, Jenin', () => {
  const citiesPath = path.join(__dirname, '../data/normalized/cities.json');
  const countriesPath = path.join(__dirname, '../data/normalized/countries.json');
  const cities: RawCity[] = JSON.parse(fs.readFileSync(citiesPath, 'utf8'));
  const countries: RawCountry[] = JSON.parse(fs.readFileSync(countriesPath, 'utf8'));

  const phase4cSlugs = [
    'prayer-times-in-samarra',
    'prayer-times-in-maan',
    'prayer-times-in-samawah',
    'prayer-times-in-jenin',
  ];

  describe('1. Batch Presence & ID Sequencing', () => {
    it('contains exactly 488 cities in dataset', () => {
      expect(cities).toHaveLength(488);
    });

    it('contains all 4 new cities with sequential IDs 485..488', () => {
      phase4cSlugs.forEach((slug, idx) => {
        const city = cities.find((c) => c.slug === slug);
        expect(city, `City ${slug} should exist`).toBeDefined();
        expect(city!.id).toBe(485 + idx);
        expect(city!.urlPath).toBe(`/city/${slug}/`);
      });
    });

    it('ensures all 488 city IDs and slugs are unique', () => {
      const ids = new Set(cities.map((c) => c.id));
      const slugs = new Set(cities.map((c) => c.slug));
      expect(ids.size).toBe(488);
      expect(slugs.size).toBe(488);
    });
  });

  describe('2. Country Totals Synchronization', () => {
    it('synchronizes Iraq (IQ) to exactly 19 cities', () => {
      const iq = countries.find((c) => c.code === 'IQ')!;
      const iqCities = cities.filter((c) => c.countryCode === 'IQ');
      expect(iq.totalCities).toBe(19);
      expect(iqCities).toHaveLength(19);
    });

    it('synchronizes Jordan (JO) to exactly 10 cities', () => {
      const jo = countries.find((c) => c.code === 'JO')!;
      const joCities = cities.filter((c) => c.countryCode === 'JO');
      expect(jo.totalCities).toBe(10);
      expect(joCities).toHaveLength(10);
    });

    it('synchronizes Palestine (PS) to exactly 10 cities', () => {
      const ps = countries.find((c) => c.code === 'PS')!;
      const psCities = cities.filter((c) => c.countryCode === 'PS');
      expect(ps.totalCities).toBe(10);
      expect(psCities).toHaveLength(10);
    });
  });

  describe('3. Coordinate & Timezone Integrity', () => {
    it('verifies Samarra coordinates and Asia/Baghdad timezone', () => {
      const samarra = cities.find((c) => c.slug === 'prayer-times-in-samarra')!;
      expect(samarra.coordinates.latitude).toBeCloseTo(34.194, 3);
      expect(samarra.coordinates.longitude).toBeCloseTo(43.875, 3);
      expect(samarra.timezone).toBe('Asia/Baghdad');
      expect(samarra.calculationMethodId).toBe(8);
    });

    it('verifies Maan coordinates and Asia/Amman timezone', () => {
      const maan = cities.find((c) => c.slug === 'prayer-times-in-maan')!;
      expect(maan.coordinates.latitude).toBeCloseTo(30.192, 3);
      expect(maan.coordinates.longitude).toBeCloseTo(35.736, 3);
      expect(maan.timezone).toBe('Asia/Amman');
      expect(maan.calculationMethodId).toBe(8);
    });

    it('verifies Samawah coordinates and Asia/Baghdad timezone', () => {
      const samawah = cities.find((c) => c.slug === 'prayer-times-in-samawah')!;
      expect(samawah.coordinates.latitude).toBeCloseTo(31.310, 3);
      expect(samawah.coordinates.longitude).toBeCloseTo(45.280, 3);
      expect(samawah.timezone).toBe('Asia/Baghdad');
      expect(samawah.calculationMethodId).toBe(8);
    });

    it('verifies Jenin coordinates and Asia/Hebron timezone', () => {
      const jenin = cities.find((c) => c.slug === 'prayer-times-in-jenin')!;
      expect(jenin.coordinates.latitude).toBeCloseTo(32.461, 3);
      expect(jenin.coordinates.longitude).toBeCloseTo(35.297, 3);
      expect(jenin.timezone).toBe('Asia/Hebron');
      expect(jenin.calculationMethodId).toBe(8);
    });
  });

  describe('4. Astronomical Calculation Sanity Check', () => {
    it('calculates valid prayer times for all 4 expansion cities', () => {
      const testDate = new Date('2026-10-20T12:00:00Z');

      phase4cSlugs.forEach((slug) => {
        const city = cities.find((c) => c.slug === slug)!;
        const coords = new Coordinates(city.coordinates.latitude, city.coordinates.longitude);
        const params = CalculationMethod.Dubai();

        const prayerTimes = new PrayerTimes(coords, testDate, params);

        expect(prayerTimes.fajr, `${slug} Fajr should be valid Date`).toBeInstanceOf(Date);
        expect(prayerTimes.sunrise, `${slug} Sunrise should be valid Date`).toBeInstanceOf(Date);
        expect(prayerTimes.dhuhr, `${slug} Dhuhr should be valid Date`).toBeInstanceOf(Date);
        expect(prayerTimes.asr, `${slug} Asr should be valid Date`).toBeInstanceOf(Date);
        expect(prayerTimes.maghrib, `${slug} Maghrib should be valid Date`).toBeInstanceOf(Date);
        expect(prayerTimes.isha, `${slug} Isha should be valid Date`).toBeInstanceOf(Date);

        expect(isNaN(prayerTimes.fajr.getTime())).toBe(false);
        expect(isNaN(prayerTimes.dhuhr.getTime())).toBe(false);

        expect(prayerTimes.fajr.getTime()).toBeLessThan(prayerTimes.sunrise.getTime());
        expect(prayerTimes.sunrise.getTime()).toBeLessThan(prayerTimes.dhuhr.getTime());
        expect(prayerTimes.dhuhr.getTime()).toBeLessThan(prayerTimes.asr.getTime());
        expect(prayerTimes.asr.getTime()).toBeLessThan(prayerTimes.maghrib.getTime());
        expect(prayerTimes.maghrib.getTime()).toBeLessThan(prayerTimes.isha.getTime());
      });
    });
  });

  describe('5. Minimum Geographic Distance Threshold (>= 25km)', () => {
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

    it('verifies all 4 candidates exceed 25 km from existing cities in same country', () => {
      phase4cSlugs.forEach((slug) => {
        const city = cities.find((c) => c.slug === slug)!;
        const otherCities = cities.filter(
          (c) => c.countryCode === city.countryCode && c.id !== city.id
        );

        let minDistance = Infinity;
        let nearestCity = otherCities[0];

        otherCities.forEach((other) => {
          const dist = haversineDistance(
            city.coordinates.latitude,
            city.coordinates.longitude,
            other.coordinates.latitude,
            other.coordinates.longitude
          );
          if (dist < minDistance) {
            minDistance = dist;
            nearestCity = other;
          }
        });

        expect(
          minDistance,
          `${city.nameEn} is ${minDistance.toFixed(2)}km from ${nearestCity.nameEn}, which must be >= 25km`
        ).toBeGreaterThanOrEqual(25);
      });
    });
  });
});
