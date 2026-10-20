import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { Coordinates, PrayerTimes, CalculationParameters } from 'adhan';
import { RawCity } from '@/lib/data';

describe('Phase 3.6 — Palestinian City Coordinates Regression & Astronomical Integrity', () => {
  const citiesPath = path.join(__dirname, '../data/normalized/cities.json');
  const cities: RawCity[] = JSON.parse(fs.readFileSync(citiesPath, 'utf8'));

  const acre = cities.find((c) => c.slug === 'prayer-times-in-acre')!;
  const haifa = cities.find((c) => c.slug === 'prayer-times-in-haifa')!;
  const eilat = cities.find((c) => c.slug === 'prayer-times-in-eilat')!;
  const jerusalem = cities.find((c) => c.slug === 'prayer-times-in-jerusalem')!;
  const beersheba = cities.find((c) => c.slug === 'prayer-times-in-beersheba')!;

  describe('1. Coordinate Precision and Bounding Box Verification', () => {
    it('verifies Acre (عكا) is located in the northern coastal plain and NOT in Gaza', () => {
      expect(acre).toBeDefined();
      expect(acre.coordinates.latitude).toBeCloseTo(32.927, 2);
      expect(acre.coordinates.longitude).toBeCloseTo(35.082, 2);

      // Must be north of 32.8° (Acre Bay area), strictly not the old Gaza Beit Lahiya coordinate (~31.54)
      expect(acre.coordinates.latitude).toBeGreaterThan(32.8);
      expect(acre.coordinates.latitude).toBeLessThan(33.0);
      expect(acre.coordinates.longitude).toBeGreaterThan(35.0);
      expect(acre.coordinates.longitude).toBeLessThan(35.15);
    });

    it('verifies Haifa (حيفا) is located on Mount Carmel / Haifa Bay and NOT in Gaza', () => {
      expect(haifa).toBeDefined();
      expect(haifa.coordinates.latitude).toBeCloseTo(32.819, 2);
      expect(haifa.coordinates.longitude).toBeCloseTo(34.998, 2);

      // Must be north of 32.7° (Haifa area), strictly not the old Gaza Jabalia coordinate (~31.52)
      expect(haifa.coordinates.latitude).toBeGreaterThan(32.7);
      expect(haifa.coordinates.latitude).toBeLessThan(32.9);
      expect(haifa.coordinates.longitude).toBeGreaterThan(34.9);
      expect(haifa.coordinates.longitude).toBeLessThan(35.1);
    });

    it('verifies Eilat (إيلات) is located on the Gulf of Aqaba and NOT in the West Bank', () => {
      expect(eilat).toBeDefined();
      expect(eilat.coordinates.latitude).toBeCloseTo(29.558, 2);
      expect(eilat.coordinates.longitude).toBeCloseTo(34.948, 2);

      // Must be south of 30.0° (Gulf of Aqaba), strictly not the old Ariel West Bank coordinate (~32.10)
      expect(eilat.coordinates.latitude).toBeGreaterThan(29.4);
      expect(eilat.coordinates.latitude).toBeLessThan(29.8);
      expect(eilat.coordinates.longitude).toBeGreaterThan(34.8);
      expect(eilat.coordinates.longitude).toBeLessThan(35.1);
    });

    it('verifies Jerusalem (القدس) is located in the historic Jerusalem core and NOT in Samaria/Nablus', () => {
      expect(jerusalem).toBeDefined();
      expect(jerusalem.coordinates.latitude).toBeCloseTo(31.776, 2);
      expect(jerusalem.coordinates.longitude).toBeCloseTo(35.234, 2);

      // Must be in the central Jerusalem latitude range [31.7, 31.85], strictly not Samaria (~32.19)
      expect(jerusalem.coordinates.latitude).toBeGreaterThan(31.7);
      expect(jerusalem.coordinates.latitude).toBeLessThan(31.85);
      expect(jerusalem.coordinates.longitude).toBeGreaterThan(35.15);
      expect(jerusalem.coordinates.longitude).toBeLessThan(35.3);
    });

    it('verifies Beersheba (بئر السبع) is located in the northern Negev and NOT in Hebron', () => {
      expect(beersheba).toBeDefined();
      expect(beersheba.coordinates.latitude).toBeCloseTo(31.252, 2);
      expect(beersheba.coordinates.longitude).toBeCloseTo(34.791, 2);

      // Must be south of 31.4° (Negev valley), strictly not Hebron city center (~31.53)
      expect(beersheba.coordinates.latitude).toBeGreaterThan(31.15);
      expect(beersheba.coordinates.latitude).toBeLessThan(31.35);
      expect(beersheba.coordinates.longitude).toBeGreaterThan(34.7);
      expect(beersheba.coordinates.longitude).toBeLessThan(34.9);
    });
  });

  describe('2. Metadata & Relationship Immutability', () => {
    const targets = [acre, haifa, eilat, jerusalem, beersheba];

    it('preserves countryId = 12 (Palestine) and countryCode = PS for all 5 records', () => {
      targets.forEach((c) => {
        expect(c.countryId).toBe(12);
        expect(c.countryCode).toBe('PS');
      });
    });

    it('preserves exact legacy URLs and slugs', () => {
      expect(acre.urlPath).toBe('/city/prayer-times-in-acre/');
      expect(haifa.urlPath).toBe('/city/prayer-times-in-haifa/');
      expect(eilat.urlPath).toBe('/city/prayer-times-in-eilat/');
      expect(jerusalem.urlPath).toBe('/city/prayer-times-in-jerusalem/');
      expect(beersheba.urlPath).toBe('/city/prayer-times-in-beersheba/');
    });

    it('preserves immutable IDs and legacyPostIds', () => {
      expect(acre.id).toBe(123);
      expect(haifa.id).toBe(124);
      expect(jerusalem.id).toBe(125);
      expect(beersheba.id).toBe(126);
      expect(eilat.id).toBe(127);
    });
  });

  describe('3. Astronomical Solvability & Chronological Order across All 4 Seasons', () => {
    const seasonalDates = [
      new Date('2026-03-20T12:00:00Z'), // Vernal Equinox
      new Date('2026-06-21T12:00:00Z'), // Summer Solstice
      new Date('2026-09-22T12:00:00Z'), // Autumnal Equinox
      new Date('2026-12-21T12:00:00Z'), // Winter Solstice
    ];

    const params = new CalculationParameters('Dubai', 19.5, 0);
    params.ishaInterval = 90;

    const targets = [
      { name: 'Acre', record: acre },
      { name: 'Haifa', record: haifa },
      { name: 'Eilat', record: eilat },
      { name: 'Jerusalem', record: jerusalem },
      { name: 'Beersheba', record: beersheba },
    ];

    targets.forEach(({ name, record }) => {
      it(`calculates chronologically consistent, non-NaN prayer times for ${name} across 4 seasons`, () => {
        seasonalDates.forEach((date) => {
          const coords = new Coordinates(record.coordinates.latitude, record.coordinates.longitude);
          const pt = new PrayerTimes(coords, date, params);

          expect(pt.fajr, `${name} Fajr on ${date.toISOString()} should not be null`).toBeDefined();
          expect(isNaN(pt.fajr.getTime())).toBe(false);
          expect(isNaN(pt.sunrise.getTime())).toBe(false);
          expect(isNaN(pt.dhuhr.getTime())).toBe(false);
          expect(isNaN(pt.asr.getTime())).toBe(false);
          expect(isNaN(pt.maghrib.getTime())).toBe(false);
          expect(isNaN(pt.isha.getTime())).toBe(false);

          // Strictly ordered
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
