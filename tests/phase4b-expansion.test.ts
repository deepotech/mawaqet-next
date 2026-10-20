import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { Coordinates, PrayerTimes, CalculationMethod, CalculationParameters } from 'adhan';
import { RawCity, RawCountry } from '@/lib/data';

describe('Phase 4B — Controlled Expansion: First 6 Cities Verification', () => {
  const citiesPath = path.join(__dirname, '../data/normalized/cities.json');
  const countriesPath = path.join(__dirname, '../data/normalized/countries.json');
  const cities: RawCity[] = JSON.parse(fs.readFileSync(citiesPath, 'utf8'));
  const countries: RawCountry[] = JSON.parse(fs.readFileSync(countriesPath, 'utf8'));

  const newSlugs = [
    'prayer-times-in-mansoura',
    'prayer-times-in-duhok',
    'prayer-times-in-amarah',
    'prayer-times-in-baqubah',
    'prayer-times-in-jerash',
    'prayer-times-in-el-mahalla-el-kubra',
  ];

  describe('1. Batch Presence & ID Sequencing', () => {
    it('contains at least 484 cities in dataset', () => {
      expect(cities.length).toBeGreaterThanOrEqual(484);
    });

    it('contains all 6 new cities with sequential IDs 479..484', () => {
      newSlugs.forEach((slug, idx) => {
        const city = cities.find((c) => c.slug === slug);
        expect(city, `City ${slug} should exist`).toBeDefined();
        expect(city!.id).toBe(479 + idx);
        expect(city!.urlPath).toBe(`/city/${slug}/`);
      });
    });

    it('ensures all city IDs and slugs are unique', () => {
      const ids = new Set(cities.map((c) => c.id));
      const slugs = new Set(cities.map((c) => c.slug));
      expect(ids.size).toBe(cities.length);
      expect(slugs.size).toBe(cities.length);
    });
  });

  describe('2. Country Totals Synchronization', () => {
    it('synchronizes Egypt (EG) to exactly 28 cities', () => {
      const eg = countries.find((c) => c.code === 'EG')!;
      const egCities = cities.filter((c) => c.countryCode === 'EG');
      expect(eg.totalCities).toBe(28);
      expect(egCities).toHaveLength(28);
    });

    it('synchronizes Iraq (IQ) to at least 17 cities', () => {
      const iq = countries.find((c) => c.code === 'IQ')!;
      const iqCities = cities.filter((c) => c.countryCode === 'IQ');
      expect(iq.totalCities).toBeGreaterThanOrEqual(17);
      expect(iqCities.length).toBeGreaterThanOrEqual(17);
    });

    it('synchronizes Jordan (JO) to at least 9 cities', () => {
      const jo = countries.find((c) => c.code === 'JO')!;
      const joCities = cities.filter((c) => c.countryCode === 'JO');
      expect(jo.totalCities).toBeGreaterThanOrEqual(9);
      expect(joCities.length).toBeGreaterThanOrEqual(9);
    });
  });

  describe('3. Coordinate & Timezone Integrity', () => {
    it('verifies Mansoura coordinates and Africa/Cairo timezone', () => {
      const mansoura = cities.find((c) => c.slug === 'prayer-times-in-mansoura')!;
      expect(mansoura.coordinates.latitude).toBeCloseTo(31.0504, 3);
      expect(mansoura.coordinates.longitude).toBeCloseTo(31.3800, 3);
      expect(mansoura.timezone).toBe('Africa/Cairo');
      expect(mansoura.calculationMethodId).toBe(3); // Egypt
    });

    it('verifies Duhok coordinates and Asia/Baghdad timezone', () => {
      const duhok = cities.find((c) => c.slug === 'prayer-times-in-duhok')!;
      expect(duhok.coordinates.latitude).toBeCloseTo(36.8667, 3);
      expect(duhok.coordinates.longitude).toBeCloseTo(43.0000, 3);
      expect(duhok.timezone).toBe('Asia/Baghdad');
      expect(duhok.calculationMethodId).toBe(8); // Gulf default for IQ
    });

    it('verifies Amarah coordinates and Asia/Baghdad timezone', () => {
      const amarah = cities.find((c) => c.slug === 'prayer-times-in-amarah')!;
      expect(amarah.coordinates.latitude).toBeCloseTo(31.8416, 3);
      expect(amarah.coordinates.longitude).toBeCloseTo(47.1512, 3);
      expect(amarah.timezone).toBe('Asia/Baghdad');
    });

    it('verifies Baqubah coordinates and Asia/Baghdad timezone', () => {
      const baqubah = cities.find((c) => c.slug === 'prayer-times-in-baqubah')!;
      expect(baqubah.coordinates.latitude).toBeCloseTo(33.7476, 3);
      expect(baqubah.coordinates.longitude).toBeCloseTo(44.6573, 3);
      expect(baqubah.timezone).toBe('Asia/Baghdad');
    });

    it('verifies Jerash coordinates and Asia/Amman timezone', () => {
      const jerash = cities.find((c) => c.slug === 'prayer-times-in-jerash')!;
      expect(jerash.coordinates.latitude).toBeCloseTo(32.2723, 3);
      expect(jerash.coordinates.longitude).toBeCloseTo(35.8914, 3);
      expect(jerash.timezone).toBe('Asia/Amman');
    });

    it('verifies El Mahalla El Kubra coordinates and Africa/Cairo timezone', () => {
      const mahalla = cities.find((c) => c.slug === 'prayer-times-in-el-mahalla-el-kubra')!;
      expect(mahalla.coordinates.latitude).toBeCloseTo(30.9706, 3);
      expect(mahalla.coordinates.longitude).toBeCloseTo(31.1669, 3);
      expect(mahalla.timezone).toBe('Africa/Cairo');
      expect(mahalla.calculationMethodId).toBe(3); // Egypt
    });
  });

  describe('4. Astronomical Solvability Across All 4 Seasons', () => {
    const seasons = [
      new Date('2026-03-20T12:00:00Z'), // Equinox
      new Date('2026-06-21T12:00:00Z'), // Solstice
      new Date('2026-09-22T12:00:00Z'), // Equinox
      new Date('2026-12-21T12:00:00Z'), // Solstice
    ];

    const pEgypt = CalculationMethod.Egyptian();
    const pGulf = new CalculationParameters('Dubai', 19.5, 0);
    pGulf.ishaInterval = 90;

    newSlugs.forEach((slug) => {
      const city = cities.find((c) => c.slug === slug)!;
      const params = city.calculationMethodId === 3 ? pEgypt : pGulf;

      it(`computes non-NaN, chronologically ordered prayer times for ${city.nameAr} (${slug})`, () => {
        seasons.forEach((date) => {
          const coords = new Coordinates(city.coordinates.latitude, city.coordinates.longitude);
          const pt = new PrayerTimes(coords, date, params);

          expect(pt.fajr).toBeDefined();
          expect(isNaN(pt.fajr.getTime())).toBe(false);
          expect(isNaN(pt.sunrise.getTime())).toBe(false);
          expect(isNaN(pt.dhuhr.getTime())).toBe(false);
          expect(isNaN(pt.asr.getTime())).toBe(false);
          expect(isNaN(pt.maghrib.getTime())).toBe(false);
          expect(isNaN(pt.isha.getTime())).toBe(false);

          // Chronological check
          expect(pt.fajr.getTime()).toBeLessThan(pt.sunrise.getTime());
          expect(pt.sunrise.getTime()).toBeLessThan(pt.dhuhr.getTime());
          expect(pt.dhuhr.getTime()).toBeLessThan(pt.asr.getTime());
          expect(pt.asr.getTime()).toBeLessThan(pt.maghrib.getTime());
          expect(pt.maghrib.getTime()).toBeLessThan(pt.isha.getTime());
        });
      });
    });
  });
});
